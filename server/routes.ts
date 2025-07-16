import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import Stripe from "stripe";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import multer from "multer";
import { 
  insertUserSchema, 
  insertChakraProfileSchema,
  insertJournalEntrySchema,
  insertEmotionTrackingSchema,
  insertCoachConversationSchema,
  insertHealingRitualSchema,
  insertMediaSchema,
  insertCommunityPostSchema,
  insertPostReactionSchema,
  insertPostCommentSchema,
  insertCommunityEventSchema
} from "@shared/schema";
import { analyzeJournalEntry, generateChatResponse, getCoachSystemPrompt, prepareChakraCoachingContext } from "./openai";
import { getUserEmotionData, aggregateEmotionsByPeriod } from "./emotionAnalysis";
import { setupAuth } from "./auth";
import { getUserTokenStats, getTokenUsageByPeriod, updateUserQuota, checkUserQuota } from "./tokenTracking";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key - payment features will not work');
}

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Ensure the key is properly formatted without any extra whitespace or invalid characters
    const cleanKey = process.env.STRIPE_SECRET_KEY.trim();
    
    // Check if the key starts with sk_ (Stripe secret key format)
    if (!cleanKey.startsWith('sk_')) {
      console.error('Invalid Stripe key format. Secret key should start with sk_');
    } else {
      stripe = new Stripe(cleanKey, { 
        apiVersion: "2022-11-15" as any // Using an older, more compatible API version
      });
      console.log('Stripe initialized successfully');
    }
  } else {
    console.warn('No Stripe secret key found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes prefix
  const apiRouter = '/api';
  
  // Authentication middlewares
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };
  
  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = req.user as { isAdmin?: boolean };
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  };
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer storage
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${randomUUID()}${fileExt}`;
      cb(null, fileName);
    }
  });
  
  // File filter to check allowed file types
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
  };
  
  const upload = multer({
    storage: multerStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Health check endpoint
  app.get(`${apiRouter}/health`, (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // File upload endpoint
  app.post(`${apiRouter}/upload`, isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      // Get authenticated user
      const user = req.user;
      
      // Create relative URL for the uploaded file
      const relativeFilePath = `/uploads/${req.file.filename}`;
      
      // Create a new media entry in the database
      if (user) {
        try {
          const mediaData = {
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileUrl: relativeFilePath,
            fileSize: req.file.size,
            altText: req.body.altText || req.file.originalname,
            uploadedById: user.id
          };
          
          // Store the media in the database
          const mediaItem = await storage.uploadMedia(mediaData);
          
          res.status(201).json({
            success: true,
            url: relativeFilePath,
            fileName: req.file.originalname,
            mediaId: mediaItem.id
          });
        } catch (error) {
          console.error("Failed to save media to database:", error);
          // Even if DB storage fails, still return the file URL
          res.status(201).json({
            success: true,
            url: relativeFilePath,
            fileName: req.file.originalname,
            warning: "File saved but database entry failed"
          });
        }
      } else {
        // User not found in request
        res.status(201).json({
          success: true,
          url: relativeFilePath,
          fileName: req.file.originalname,
          warning: "User not authenticated, file saved without database entry"
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message: `File upload failed: ${(error as Error).message}`
      });
    }
  });

  // User routes
  app.post(`${apiRouter}/users`, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      const newUser = await storage.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create user', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:id`, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user', error: (error as Error).message });
    }
  });

  // Chakra profile routes
  app.post(`${apiRouter}/chakra-profiles`, async (req, res) => {
    try {
      const validatedData = insertChakraProfileSchema.parse(req.body);
      const existingProfile = await storage.getChakraProfile(validatedData.userId);
      
      if (existingProfile) {
        return res.status(409).json({ message: 'User already has a chakra profile' });
      }
      
      const newProfile = await storage.createChakraProfile(validatedData);
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid chakra profile data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create chakra profile', error: (error as Error).message });
      }
    }
  });
  
  // Update chakra profile
  app.patch(`${apiRouter}/chakra-profiles/:id`, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      console.log("Updating chakra profile with ID:", profileId);
      console.log("Request body:", req.body);
      
      // Validate only the fields that are provided
      const validatedData = insertChakraProfileSchema.partial().parse(req.body);
      
      console.log("Validated data:", validatedData);
      
      const updatedProfile = await storage.updateChakraProfile(profileId, validatedData);
      
      if (!updatedProfile) {
        console.log("Profile not found with ID:", profileId);
        return res.status(404).json({ message: 'Chakra profile not found' });
      }
      
      console.log("Updated profile:", updatedProfile);
      
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating chakra profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid chakra profile data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update chakra profile', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:userId/chakra-profile`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let profile = await storage.getChakraProfile(userId);
      
      // If no profile exists, create a default one
      if (!profile) {
        // Create a default profile with balanced values (5)
        const defaultProfileData = {
          userId,
          crownChakra: 5,
          thirdEyeChakra: 5,
          throatChakra: 5,
          heartChakra: 5,
          solarPlexusChakra: 5,
          sacralChakra: 5,
          rootChakra: 5
        };
        
        try {
          // Create the profile
          profile = await storage.createChakraProfile(defaultProfileData);
          console.log("Created default chakra profile for user:", userId);
        } catch (createError) {
          console.error("Error creating default chakra profile:", createError);
          return res.status(500).json({ 
            message: 'Failed to create default chakra profile', 
            error: (createError as Error).message 
          });
        }
      }
      
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get chakra profile', error: (error as Error).message });
    }
  });

  // Journal entry routes
  app.post(`${apiRouter}/journal-entries`, async (req, res) => {
    try {
      let {
        content = "",
        gratitude = [],
        affirmation = "",
        shortTermGoals = [],
        longTermVision = "",
        language = "english",
        userId
      } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
      }
      
      // Need at least one section filled in
      if (!content && gratitude.length === 0 && !affirmation && shortTermGoals.length === 0 && !longTermVision) {
        return res.status(400).json({ message: 'At least one journal section must be filled' });
      }
      
      // Force English language for consistency
      language = "english";
      
      // Quick analysis for immediate response (no AI call)
      const quickAnalysis = {
        sentimentScore: content.length > 50 ? 6 : 5, // Simple heuristic
        emotions: ["reflection"],
        chakras: ["heart"],
        aiInsights: "Your entry has been saved successfully."
      };
      
      // Create journal entry with quick analysis
      const journalData = {
        userId,
        content,
        gratitude,
        affirmation,
        shortTermGoals,
        longTermVision,
        language,
        sentimentScore: quickAnalysis.sentimentScore,
        emotionTags: quickAnalysis.emotions,
        chakraTags: quickAnalysis.chakras,
        aiInsights: quickAnalysis.aiInsights
      };
      
      // Schedule AI analysis in background (non-blocking)
      setTimeout(async () => {
        try {
          const fullAnalysis = await analyzeJournalEntry({
            content, gratitude, affirmation, shortTermGoals, longTermVision, language
          });
          // Update the entry with full analysis later
          console.log("Background analysis completed for entry:", newEntry?.id);
        } catch (error) {
          console.error("Background analysis failed:", error);
        }
      }, 100);
      
      const validatedData = insertJournalEntrySchema.parse(journalData);
      const newEntry = await storage.createJournalEntry(validatedData);
      
      res.status(201).json({
        ...newEntry,
        analysis: "Your journal entry has been saved successfully!",
        progressNotes: "Keep up the great work with your daily journaling practice."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid journal entry data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create journal entry', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:userId/journal-entries`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getJournalEntries(userId);
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get journal entries', error: (error as Error).message });
    }
  });

  // Emotion tracking routes
  app.post(`${apiRouter}/emotion-tracking`, async (req, res) => {
    try {
      const validatedData = insertEmotionTrackingSchema.parse(req.body);
      const newTracking = await storage.createEmotionTracking(validatedData);
      res.status(201).json(newTracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid emotion tracking data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create emotion tracking', error: (error as Error).message });
      }
    }
  });

  app.get(`${apiRouter}/users/:userId/emotion-tracking`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trackings = await storage.getEmotionTrackings(userId);
      res.status(200).json(trackings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get emotion trackings', error: (error as Error).message });
    }
  });
  
  // Emotion Analysis Routes
  app.get(`${apiRouter}/users/:userId/emotion-data`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Authorization check
      if (req.user && (req.user.id !== userId && !req.user.isAdmin)) {
        return res.status(403).json({ error: "Not authorized to access this user's data" });
      }
      
      // Return quick response to prevent slowdown
      // TODO: Implement background caching for emotion analysis
      res.json([]);
    } catch (error) {
      console.error("Error fetching emotion data:", error);
      res.status(500).json({ error: "Failed to fetch emotion data" });
    }
  });
  
  app.get(`${apiRouter}/users/:userId/emotion-aggregates`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Authorization check
      if (req.user && (req.user.id !== userId && !req.user.isAdmin)) {
        return res.status(403).json({ error: "Not authorized to access this user's data" });
      }
      
      const period = (req.query.period as string) || 'day';
      if (!['day', 'week', 'month'].includes(period)) {
        return res.status(400).json({ error: "Invalid period. Must be 'day', 'week', or 'month'" });
      }
      
      const emotionData = await getUserEmotionData(userId);
      const aggregatedData = aggregateEmotionsByPeriod(emotionData, period as 'day' | 'week' | 'month');
      
      res.json(aggregatedData);
    } catch (error) {
      console.error("Error fetching emotion aggregates:", error);
      res.status(500).json({ error: "Failed to fetch emotion aggregates" });
    }
  });

  // Coach conversation routes
  app.post(`${apiRouter}/coach-chat`, async (req, res) => {
    try {
      const { userId, coachType, message, conversationId } = req.body;
      
      if (!userId || !coachType || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      let conversation;
      let conversationHistory = [];
      
      // If conversationId is provided, get existing conversation
      if (conversationId) {
        conversation = await storage.getCoachConversation(conversationId);
        
        if (!conversation) {
          return res.status(404).json({ message: 'Conversation not found' });
        }
        
        // Verify the conversation belongs to the correct coach type
        if (conversation.coachType !== coachType) {
          return res.status(400).json({ 
            message: 'Coach type mismatch. The conversation belongs to a different coach type.' 
          });
        }
        
        // Extract conversation history
        const messages = conversation.messages || [];
        if (Array.isArray(messages)) {
          conversationHistory = messages.filter((msg: any) => msg.role !== 'system');
        }
      } else {
        // Get past conversations for context
        conversationHistory = [];
        const pastConversations = await storage.getCoachConversations(userId, coachType);
        if (pastConversations && pastConversations.length > 0) {
          // Get messages from most recent conversation (excluding this new one)
          const recentConversation = pastConversations[0];
          if (recentConversation && recentConversation.messages) {
            // Handle messages being potentially any type
            const messages = recentConversation.messages;
            if (Array.isArray(messages)) {
              // Use the previous conversation for context
              conversationHistory = messages.filter((msg: any) => msg.role !== 'system');
            } else {
              console.warn('Recent conversation messages is not an array:', typeof messages);
            }
          }
        }
      }
      
      // Use enhanced personalized coaching system
      const { generatePersonalizedResponse } = await import('./personalizedCoaching');
      const aiResponse = await generatePersonalizedResponse(coachType, userId, message, conversationHistory, conversationId);
      
      // Create or update conversation with the new message and response
      let updatedConversation;
      if (conversationId && conversation) {
        // Update existing conversation
        const existingMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
        const newMessages = [
          ...existingMessages,
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ];
        updatedConversation = await storage.updateCoachConversation(conversationId, newMessages);
      } else {
        // Create new conversation
        const conversationData = {
          userId,
          coachType,
          messages: [
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse }
          ]
        };
        updatedConversation = await storage.createCoachConversation(conversationData);
      }
      
      res.status(200).json({
        conversation: updatedConversation,
        message: aiResponse
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process coach chat', error: (error as Error).message });
    }
  });

  app.get(`${apiRouter}/users/:userId/coach-conversations`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const coachType = req.query.coachType as string | undefined;
      
      // Validate that we have a valid coach type parameter
      if (!coachType) {
        return res.status(400).json({ message: 'Missing coachType parameter' });
      }
      
      const conversations = await storage.getCoachConversations(userId, coachType);
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get coach conversations', error: (error as Error).message });
    }
  });
  
  // Delete coach conversation route
  app.delete(`${apiRouter}/coach-conversations/:id`, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Check if the conversation exists
      const conversation = await storage.getCoachConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      // Delete the conversation
      await storage.deleteCoachConversation(conversationId);
      
      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to delete conversation', 
        error: (error as Error).message 
      });
    }
  });

  // Healing ritual routes
  app.get(`${apiRouter}/healing-rituals`, async (req, res) => {
    try {
      const targetChakra = req.query.targetChakra as string | undefined;
      const targetEmotion = req.query.targetEmotion as string | undefined;
      
      const rituals = await storage.getHealingRitualsByTarget(targetChakra, targetEmotion);
      res.status(200).json(rituals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get healing rituals', error: (error as Error).message });
    }
  });

  app.get(`${apiRouter}/healing-rituals/:id`, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const ritual = await storage.getHealingRitual(ritualId);
      
      if (!ritual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      res.status(200).json(ritual);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get healing ritual', error: (error as Error).message });
    }
  });
  
  // Admin-only routes for healing rituals management
  app.post(`${apiRouter}/healing-rituals`, isAdmin, async (req, res) => {
    try {
      const validatedData = insertHealingRitualSchema.parse(req.body);
      const newRitual = await storage.createHealingRitual(validatedData);
      res.status(201).json(newRitual);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid ritual data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create ritual', error: (error as Error).message });
      }
    }
  });
  
  app.put(`${apiRouter}/healing-rituals/:id`, isAdmin, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const existingRitual = await storage.getHealingRitual(ritualId);
      
      if (!existingRitual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      const validatedData = insertHealingRitualSchema.parse(req.body);
      // Add updateHealingRitual to storage interface later
      const updatedRitual = await storage.updateHealingRitual(ritualId, validatedData);
      
      res.status(200).json(updatedRitual);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid ritual data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update ritual', error: (error as Error).message });
      }
    }
  });
  
  // Add PATCH endpoint to support partial updates from AdminDashboardPage
  app.patch(`${apiRouter}/healing-rituals/:id`, isAdmin, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const existingRitual = await storage.getHealingRitual(ritualId);
      
      if (!existingRitual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      // For PATCH we'll skip validation to allow partial updates
      const updatedRitual = await storage.updateHealingRitual(ritualId, req.body);
      
      res.status(200).json(updatedRitual);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update ritual', error: (error as Error).message });
    }
  });
  
  app.delete(`${apiRouter}/healing-rituals/:id`, isAdmin, async (req, res) => {
    try {
      const ritualId = parseInt(req.params.id);
      const existingRitual = await storage.getHealingRitual(ritualId);
      
      if (!existingRitual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      // Add deleteHealingRitual to storage interface later
      await storage.deleteHealingRitual(ritualId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete ritual', error: (error as Error).message });
    }
  });

  // User recommendation routes
  app.post(`${apiRouter}/user-recommendations`, async (req, res) => {
    try {
      const { userId, ritualId } = req.body;
      
      if (!userId || !ritualId) {
        return res.status(400).json({ message: 'Missing userId or ritualId' });
      }
      
      const ritual = await storage.getHealingRitual(ritualId);
      
      if (!ritual) {
        return res.status(404).json({ message: 'Healing ritual not found' });
      }
      
      const recommendationData = {
        userId,
        ritualId,
        completed: false
      };
      
      const newRecommendation = await storage.createUserRecommendation(recommendationData);
      res.status(201).json(newRecommendation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create user recommendation', error: (error as Error).message });
    }
  });

  app.get(`${apiRouter}/users/:userId/recommendations`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recommendations = await storage.getUserRecommendations(userId);
      
      // Fetch the corresponding ritual details for each recommendation
      const recommendationsWithRituals = await Promise.all(
        recommendations.map(async (rec) => {
          const ritual = await storage.getHealingRitual(rec.ritualId);
          return {
            ...rec,
            ritual
          };
        })
      );
      
      res.status(200).json(recommendationsWithRituals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user recommendations', error: (error as Error).message });
    }
  });

  app.patch(`${apiRouter}/user-recommendations/:id`, async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (completed === undefined) {
        return res.status(400).json({ message: 'Missing completed field' });
      }
      
      const updatedRecommendation = await storage.updateUserRecommendation(
        recommendationId,
        completed
      );
      
      if (!updatedRecommendation) {
        return res.status(404).json({ message: 'User recommendation not found' });
      }
      
      res.status(200).json(updatedRecommendation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user recommendation', error: (error as Error).message });
    }
  });

  // Media Library routes
  app.get(`${apiRouter}/media`, async (req, res) => {
    try {
      const mediaItems = await storage.getMediaItems();
      res.status(200).json(mediaItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      res.status(500).json({ message: 'Failed to fetch media items', error: (error as Error).message });
    }
  });
  
  // Multiple file upload endpoint for media
  app.post(`${apiRouter}/media/upload`, requireAuth, upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }
      
      // Get authenticated user
      const user = req.user;
      
      const uploadedMedia = [];
      
      // Process each uploaded file
      for (const file of files) {
        // Create relative URL for the uploaded file
        const relativeFilePath = `/uploads/${file.filename}`;
        
        // Create a new media entry in the database
        if (user) {
          try {
            const mediaData = {
              fileName: file.originalname,
              fileType: file.mimetype,
              fileUrl: relativeFilePath,
              fileSize: file.size,
              altText: file.originalname,
              uploadedById: user.id
            };
            
            // Store the media in the database
            const mediaItem = await storage.uploadMedia(mediaData);
            
            uploadedMedia.push({
              id: mediaItem.id,
              url: relativeFilePath,
              filename: file.originalname,
              mimetype: file.mimetype
            });
          } catch (error) {
            console.error("Failed to save media to database:", error);
            // Continue processing other files even if one fails
          }
        }
      }
      
      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${uploadedMedia.length} files`,
        files: uploadedMedia
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: (error as Error).message
      });
    }
  });

  app.get(`${apiRouter}/media/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaItem = await storage.getMediaItem(id);
      
      if (!mediaItem) {
        return res.status(404).json({ message: 'Media item not found' });
      }
      
      res.status(200).json(mediaItem);
    } catch (error) {
      console.error('Error fetching media item:', error);
      res.status(500).json({ message: 'Failed to fetch media item', error: (error as Error).message });
    }
  });
  
  app.delete(`${apiRouter}/media/:id`, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaItem = await storage.getMediaItem(id);
      
      if (!mediaItem) {
        return res.status(404).json({ message: 'Media item not found' });
      }
      
      // Delete from filesystem if it exists
      try {
        const filePath = path.join(process.cwd(), 'public', mediaItem.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file from filesystem: ${filePath}`);
        }
      } catch (fileError) {
        console.error('Error deleting file from filesystem:', fileError);
        // Continue processing even if file deletion fails
      }
      
      // Delete from database
      await storage.deleteMedia(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting media item:', error);
      res.status(500).json({ message: 'Failed to delete media item', error: (error as Error).message });
    }
  });

  // Stripe payment routes
  app.post(`${apiRouter}/create-payment-intent`, async (req, res) => {
    try {
      if (!stripe) {
        console.error('Stripe not configured - create-payment-intent endpoint called but Stripe is null');
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const { amount, interval } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: 'Missing amount field' });
      }

      console.log(`Creating payment intent for amount: ${amount}, interval: ${interval || 'one-time'}`);

      // Use a simpler, more compatible configuration
      try {
        // Create a payment intent with basic configuration
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'], // Just card payment to start with
          metadata: {
            plan: interval || 'one-time'
          }
        });
        
        console.log('Payment intent created successfully:', paymentIntent.id);
        
        res.status(200).json({
          clientSecret: paymentIntent.client_secret
        });
      } catch (stripeError) {
        console.error('Error in Stripe payment intent creation:', stripeError);
        
        // Try a fallback config if the first attempt fails
        console.log('Trying fallback payment intent configuration...');
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'usd',
          // No additional configuration
        });
        
        console.log('Payment intent created with fallback config:', paymentIntent.id);
        
        res.status(200).json({
          clientSecret: paymentIntent.client_secret
        });
      }
    } catch (error) {
      console.error('Stripe error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        const stripeError = error as any;
        if (stripeError.type) {
          console.error('Stripe error type:', stripeError.type);
        }
        if (stripeError.raw) {
          console.error('Stripe raw error:', stripeError.raw);
        }
        if (stripeError.headers) {
          console.error('Stripe error headers:', stripeError.headers);
        }
        if (stripeError.statusCode) {
          console.error('Stripe error status code:', stripeError.statusCode);
        }
      }
      
      // If we get here, both payment intent creation attempts failed
      // Return fallback UI by notifying the client
      res.status(500).json({ 
        message: 'Failed to create payment intent', 
        error: (error as Error).message,
        useFallback: true
      });
    }
  });

  // Community Events routes
  app.get(`${apiRouter}/community/events`, async (req, res) => {
    try {
      const events = await storage.getCommunityEvents();
      
      // For each event, get the attendees to check registration status
      const eventsWithAttendees = await Promise.all(events.map(async (event: any) => {
        const attendees = await storage.getEventAttendees(event.id);
        return {
          ...event,
          attendees
        };
      }));
      
      res.status(200).json(eventsWithAttendees);
    } catch (error) {
      console.error('Error fetching community events:', error);
      res.status(500).json({ 
        message: 'Failed to fetch community events', 
        error: (error as Error).message 
      });
    }
  });

  app.get(`${apiRouter}/community/events/:id`, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getCommunityEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: 'Community event not found' });
      }
      
      res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching community event:', error);
      res.status(500).json({ 
        message: 'Failed to fetch community event', 
        error: (error as Error).message 
      });
    }
  });

  app.post(`${apiRouter}/community/events`, isAdmin, async (req, res) => {
    try {
      // Parse the eventDate into a Date object if it's a string
      let eventData = { ...req.body };
      if (typeof eventData.eventDate === 'string') {
        eventData.eventDate = new Date(eventData.eventDate);
      }
      
      // Convert string boolean values to actual booleans
      if (typeof eventData.isVirtual === 'string') {
        eventData.isVirtual = eventData.isVirtual === 'true';
      }
      
      if (typeof eventData.isFree === 'string') {
        eventData.isFree = eventData.isFree === 'true';
      }
      
      // Convert duration to number if it's a string
      if (typeof eventData.duration === 'string') {
        eventData.duration = parseInt(eventData.duration);
      }
      
      const validatedData = insertCommunityEventSchema.parse(eventData);
      const newEvent = await storage.createCommunityEvent(validatedData);
      res.status(200).json(newEvent);
    } catch (error) {
      console.error('Error creating community event:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: 'Invalid event data', 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to create community event', 
          error: (error as Error).message 
        });
      }
    }
  });

  app.patch(`${apiRouter}/community/events/:id`, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existingEvent = await storage.getCommunityEvent(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Community event not found' });
      }
      
      // Parse the eventDate into a Date object if it's a string
      let eventData = { ...req.body };
      if (typeof eventData.eventDate === 'string') {
        eventData.eventDate = new Date(eventData.eventDate);
      }
      
      // Convert string boolean values to actual booleans
      if (typeof eventData.isVirtual === 'string') {
        eventData.isVirtual = eventData.isVirtual === 'true';
      }
      
      if (typeof eventData.isFree === 'string') {
        eventData.isFree = eventData.isFree === 'true';
      }
      
      // Convert duration to number if it's a string
      if (typeof eventData.duration === 'string') {
        eventData.duration = parseInt(eventData.duration);
      }
      
      const updatedEvent = await storage.updateCommunityEvent(eventId, eventData);
      res.status(200).json(updatedEvent);
    } catch (error) {
      console.error('Error updating community event:', error);
      res.status(500).json({ 
        message: 'Failed to update community event', 
        error: (error as Error).message 
      });
    }
  });
  
  app.delete(`${apiRouter}/community/events/:id`, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existingEvent = await storage.getCommunityEvent(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Community event not found' });
      }
      
      await storage.deleteCommunityEvent(eventId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting community event:', error);
      res.status(500).json({ 
        message: 'Failed to delete community event', 
        error: (error as Error).message 
      });
    }
  });
  
  app.get(`${apiRouter}/community/events/:id/attendees`, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existingEvent = await storage.getCommunityEvent(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Community event not found' });
      }
      
      const attendees = await storage.getEventAttendees(eventId);
      
      // Get user information for each attendee
      const attendeesWithUserInfo = await Promise.all(
        attendees.map(async (attendee) => {
          const user = await storage.getUser(attendee.userId);
          return {
            ...attendee,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber || "Not provided",
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.status(200).json(attendeesWithUserInfo);
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      res.status(500).json({ 
        message: 'Failed to fetch event attendees', 
        error: (error as Error).message 
      });
    }
  });
  
  // Register for an event endpoint
  app.post(`${apiRouter}/community/events/:id/register`, requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if event exists
      const event = await storage.getCommunityEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Check if user is already registered
      const existingAttendees = await storage.getEventAttendees(eventId);
      const alreadyRegistered = existingAttendees.some(attendee => attendee.userId === userId);
      
      if (alreadyRegistered) {
        return res.json({ 
          success: true,
          message: 'You are already registered for this event' 
        });
      }
      
      // Register the user
      const attendee = await storage.registerForEvent({
        eventId,
        userId,
        attended: false
      });
      
      // Get user info to return
      const user = await storage.getUser(userId);
      
      return res.json({ 
        success: true,
        message: 'Successfully registered for event',
        attendee: {
          ...attendee,
          user: {
            id: user!.id,
            name: user!.name,
            email: user!.email,
            avatarUrl: user!.avatarUrl
          }
        }
      });
      
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to register for event', 
        error: (error as Error).message 
      });
    }
  });

  // Community Post routes
  app.get(`${apiRouter}/community/posts`, async (req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      
      // Get the user information for each post
      const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        return {
          ...post,
          user: user ? {
            id: user.id,
            name: user.name,
            username: user.username
          } : null
        };
      }));
      
      res.json(postsWithUserInfo);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: `Error fetching community posts: ${(error as Error).message}` });
    }
  });

  app.get(`${apiRouter}/users/:userId/posts`, async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: `Error fetching user posts: ${(error as Error).message}` });
    }
  });

  app.post(`${apiRouter}/community/posts`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newPost = await storage.createCommunityPost(validatedData);
      
      const user = req.user;
      const postWithUser = {
        ...newPost,
        user: {
          id: user.id,
          name: user.name,
          username: user.username
        }
      };
      
      res.status(201).json(postWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating community post:", error);
      res.status(500).json({ message: `Error creating community post: ${(error as Error).message}` });
    }
  });

  app.put(`${apiRouter}/community/posts/:postId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const postId = Number(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      // Check if the post exists and belongs to the user
      const existingPost = await storage.getCommunityPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (existingPost.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }

      const validatedData = insertCommunityPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateCommunityPost(postId, validatedData);
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating community post:", error);
      res.status(500).json({ message: `Error updating community post: ${(error as Error).message}` });
    }
  });

  app.delete(`${apiRouter}/community/posts/:postId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const postId = Number(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      // Check if the post exists and belongs to the user
      const existingPost = await storage.getCommunityPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (existingPost.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }

      await storage.deleteCommunityPost(postId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting community post:", error);
      res.status(500).json({ message: `Error deleting community post: ${(error as Error).message}` });
    }
  });

  // Post reactions
  app.post(`${apiRouter}/community/posts/:postId/react`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const postId = Number(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      // Check if post exists
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if the user already reacted to this post
      const existingReaction = await storage.getUserReaction(postId, req.user.id);
      
      if (existingReaction) {
        // If already reacted, remove the reaction
        await storage.deletePostReaction(existingReaction.id);
        res.status(200).json({ action: 'removed', reactionId: existingReaction.id });
      } else {
        // Create a new reaction
        const validatedData = insertPostReactionSchema.parse({
          postId,
          userId: req.user.id,
          type: req.body.type || 'like'
        });
        
        const newReaction = await storage.createPostReaction(validatedData);
        res.status(201).json({ action: 'added', reaction: newReaction });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error handling post reaction:", error);
      res.status(500).json({ message: `Error handling post reaction: ${(error as Error).message}` });
    }
  });

  app.get(`${apiRouter}/community/posts/:postId/reactions`, async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const reactions = await storage.getPostReactions(postId);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching post reactions:", error);
      res.status(500).json({ message: `Error fetching post reactions: ${(error as Error).message}` });
    }
  });

  // Post comments
  app.get(`${apiRouter}/community/posts/:postId/comments`, async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const comments = await storage.getPostComments(postId);
      
      // Get user info for each comment
      const commentsWithUserInfo = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user: user ? {
            id: user.id,
            name: user.name,
            username: user.username
          } : null
        };
      }));
      
      res.json(commentsWithUserInfo);
    } catch (error) {
      console.error("Error fetching post comments:", error);
      res.status(500).json({ message: `Error fetching post comments: ${(error as Error).message}` });
    }
  });

  app.post(`${apiRouter}/community/posts/:postId/comments`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const postId = Number(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      // Check if post exists
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const validatedData = insertPostCommentSchema.parse({
        postId,
        userId: req.user.id,
        content: req.body.content
      });
      
      const newComment = await storage.createPostComment(validatedData);
      
      const commentWithUser = {
        ...newComment,
        user: {
          id: req.user.id,
          name: req.user.name,
          username: req.user.username
        }
      };
      
      res.status(201).json(commentWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating post comment:", error);
      res.status(500).json({ message: `Error creating post comment: ${(error as Error).message}` });
    }
  });

  app.put(`${apiRouter}/community/posts/:postId/comments/:commentId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const commentId = Number(req.params.commentId);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
      }

      // Check if comment exists and belongs to user
      const comments = await storage.getPostComments(Number(req.params.postId));
      const comment = comments.find(c => c.id === commentId);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }

      const updatedComment = await storage.updatePostComment(commentId, req.body.content);
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating post comment:", error);
      res.status(500).json({ message: `Error updating post comment: ${(error as Error).message}` });
    }
  });

  app.delete(`${apiRouter}/community/posts/:postId/comments/:commentId`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const commentId = Number(req.params.commentId);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
      }

      // Check if comment exists and belongs to user
      const comments = await storage.getPostComments(Number(req.params.postId));
      const comment = comments.find(c => c.id === commentId);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }

      await storage.deletePostComment(commentId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting post comment:", error);
      res.status(500).json({ message: `Error deleting post comment: ${(error as Error).message}` });
    }
  });

  // User profile update endpoint
  app.patch(`${apiRouter}/users/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Only allow users to update their own profile (or admins can update any)
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow certain fields to be updated
      const allowedFields = ['name', 'bio', 'avatarUrl', 'interests', 'phoneNumber'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Don't expose password in the response
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "Failed to update user" });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: `Error updating user profile: ${(error as Error).message}` });
    }
  });

  // Add lights to user account (used for referrals and chakra assessments)
  app.post(`${apiRouter}/users/:id/add-lights`, requireAuth, async (req, res) => {
    try {
      // Only allow users to update their own lights or admins
      if (req.user && (req.user.id !== parseInt(req.params.id) && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized to update this user's lights" });
      }

      const userId = parseInt(req.params.id);
      const { lights } = req.body;
      
      if (typeof lights !== 'number' || lights <= 0) {
        return res.status(400).json({ message: "Invalid number of lights" });
      }
      
      // Get current user to calculate new lights value
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate new lights value
      const currentLights = user.lights || 0;
      const newLightsValue = currentLights + lights;
      
      // Update user's lights
      const updatedUser = await storage.updateUserLights(userId, newLightsValue);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Failed to update user lights" });
      }
      
      // Check if the user has reached a milestone (250 lights)
      // If so, update their premium expiry date
      if (Math.floor(currentLights / 250) < Math.floor(newLightsValue / 250)) {
        // User has reached a new 250 light milestone
        // Add 7 days of premium access
        const currentExpiry = user.premiumExpiryDate ? new Date(user.premiumExpiryDate) : new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + 7);
        
        await storage.updatePremiumExpiry(userId, newExpiry);
      }
      
      res.json({ 
        success: true, 
        lightsAdded: lights, 
        totalLights: newLightsValue 
      });
    } catch (error) {
      console.error("Error adding lights:", error);
      res.status(500).json({ message: "Failed to add lights", error: (error as Error).message });
    }
  });

  // Secret Diary PIN Management Endpoints
  app.post(`${apiRouter}/secret-diary/set-pin`, requireAuth, async (req, res) => {
    try {
      const { pin } = req.body;
      
      if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: 'PIN must be a 4-digit number' });
      }

      const updatedUser = await storage.updateUser(req.user.id, { secretDiaryPin: pin });
      
      if (updatedUser) {
        res.json({ success: true, message: 'PIN set successfully' });
      } else {
        res.status(500).json({ message: 'Failed to set PIN' });
      }
    } catch (error) {
      console.error("Error setting secret diary PIN:", error);
      res.status(500).json({ message: `Error setting PIN: ${(error as Error).message}` });
    }
  });

  app.post(`${apiRouter}/secret-diary/verify-pin`, requireAuth, async (req, res) => {
    try {
      const { pin } = req.body;
      
      if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ valid: false, message: 'Invalid PIN format' });
      }

      const user = await storage.getUser(req.user.id);
      
      if (!user || !user.secretDiaryPin) {
        return res.status(400).json({ valid: false, message: 'No PIN set' });
      }

      const isValid = user.secretDiaryPin === pin;
      res.json({ valid: isValid });
    } catch (error) {
      console.error("Error verifying secret diary PIN:", error);
      res.status(500).json({ valid: false, message: `Error verifying PIN: ${(error as Error).message}` });
    }
  });

  // Token Usage API Routes
  // Get token usage statistics for all users (admin only)
  app.get(`${apiRouter}/admin/token-stats`, isAdmin, async (req, res) => {
    try {
      const { getUserTokenStats } = await import('./tokenTracking');
      const stats = await getUserTokenStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get token statistics', error: (error as Error).message });
    }
  });

  // Get aggregated token statistics (admin only)
  app.get(`${apiRouter}/admin/token-stats-aggregated`, isAdmin, async (req, res) => {
    try {
      const { getAggregatedTokenStats } = await import('./tokenTracking');
      const stats = await getAggregatedTokenStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get aggregated token statistics', error: (error as Error).message });
    }
  });

  // Get top token users (admin only)
  app.get(`${apiRouter}/admin/token-usage/top-users`, isAdmin, async (req, res) => {
    try {
      const { getUserTokenStats } = await import('./tokenTracking');
      const stats = await getUserTokenStats();
      // Sort by total tokens used and return top 10
      const topUsers = stats
        .sort((a, b) => b.totalTokensUsed - a.totalTokensUsed)
        .slice(0, 10);
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get top users', error: (error as Error).message });
    }
  });

  // Get daily token usage (admin only)
  app.get(`${apiRouter}/admin/token-usage/daily/:timeRange`, isAdmin, async (req, res) => {
    try {
      const { getTokenUsageByPeriod } = await import('./tokenTracking');
      const timeRange = parseInt(req.params.timeRange) || 30;
      const usageData = await getTokenUsageByPeriod(undefined, 'day');
      
      // Filter to requested time range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);
      
      const filteredData = usageData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
      });
      
      res.json(filteredData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get daily usage data', error: (error as Error).message });
    }
  });

  // Get user quotas (admin only)
  app.get(`${apiRouter}/admin/user-quotas`, isAdmin, async (req, res) => {
    try {
      const { getUserTokenStats } = await import('./tokenTracking');
      const stats = await getUserTokenStats();
      
      const quotaData = stats.map(user => ({
        userId: user.userId,
        username: user.username,
        monthlyQuota: user.monthlyQuota,
        currentUsage: user.monthlyQuota - user.quotaRemaining,
        quotaRemaining: user.quotaRemaining,
        dailyQuota: user.dailyQuota,
        dailyQuotaRemaining: user.dailyQuotaRemaining
      }));
      
      res.json(quotaData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user quotas', error: (error as Error).message });
    }
  });

  // Get token usage statistics for a specific user (admin only)
  app.get(`${apiRouter}/admin/token-stats/:userId`, isAdmin, async (req, res) => {
    try {
      const { getUserTokenStats } = await import('./tokenTracking');
      const userId = parseInt(req.params.userId);
      const stats = await getUserTokenStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user token statistics', error: (error as Error).message });
    }
  });

  // Get token usage by period (admin only)
  app.get(`${apiRouter}/admin/token-usage-chart`, isAdmin, async (req, res) => {
    try {
      const { getTokenUsageByPeriod } = await import('./tokenTracking');
      const { userId, period } = req.query;
      const usageData = await getTokenUsageByPeriod(
        userId ? parseInt(userId as string) : undefined,
        period as 'day' | 'week' | 'month' || 'month'
      );
      res.json(usageData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get token usage chart data', error: (error as Error).message });
    }
  });

  // Update user token quota (admin only)
  app.put(`${apiRouter}/admin/users/:userId/token-quota`, isAdmin, async (req, res) => {
    try {
      const { updateUserQuota } = await import('./tokenTracking');
      const userId = parseInt(req.params.userId);
      const { quota } = req.body;
      
      if (typeof quota !== 'number' || quota < 0) {
        return res.status(400).json({ message: 'Invalid quota value' });
      }
      
      await updateUserQuota(userId, quota);
      res.json({ success: true, message: 'Token quota updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update token quota', error: (error as Error).message });
    }
  });

  // Get current user's token quota and usage
  app.get(`${apiRouter}/users/:userId/token-usage`, requireAuth, async (req, res) => {
    try {
      const { checkUserQuota, getUserTokenStats } = await import('./tokenTracking');
      const userId = parseInt(req.params.userId);
      
      // Only allow users to see their own usage or admins to see any
      if (req.user && req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view this user\'s token usage' });
      }
      
      const quotaInfo = await checkUserQuota(userId);
      const stats = await getUserTokenStats(userId);
      
      res.json({
        quota: quotaInfo,
        stats: stats[0] || null
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get token usage', error: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get system messages for different coach types
function getCoachSystemMessage(coachType: string): string {
  switch (coachType) {
    case 'inner_child':
      return "You are the Inner Child AI Coach, a gentle and nurturing guide helping users heal childhood wounds. Use a warm, supportive tone. Focus on creating emotional safety, validating feelings, and asking questions that help the user connect with their authentic self. Help users identify patterns from childhood that may be affecting their adult life. Never be judgmental and always maintain compassion.";
    
    case 'shadow_self':
      return "You are the Shadow Self AI Coach, a direct and insightful guide helping users identify and integrate rejected aspects of themselves. Use a straightforward, honest tone that encourages self-reflection. Help users recognize projections and triggers as reflections of disowned parts of themselves. Ask challenging but compassionate questions that reveal hidden patterns. Focus on acceptance and integration rather than judgment. Begin your first message with this warm welcome: 'Hello love, I'm your Shadow Healing Companion. Together, we'll gently uncover the hidden parts of your subconscious that may still carry pain, fear, or limiting beliefs — and release them with compassion. Are you ready to begin?' When the user is ready to begin, guide them through this grounding process: 'Let's begin by grounding. Take a deep breath in… and release slowly. Feel your body, your breath, and your presence in this moment. Go 300 feet above energetically and connect to pure love, light, source energy and allow it to flow to each body part, each nerve in your body, and all cells should get completely blessed and drenched in pure abundance source energy. Once the light is filled, ground it and visualize love and pure energy flowing from the center of earth and flowing back to you and traveling to your heart. Now you are connected above and below, now expand the pure love, light and abundance energy throughout you in 360 degrees and expand it to your home, to your society, to your area, to your country, and expand the energy completely throughout the globe.' Then, ask one of these shadow work questions: 'What emotion are you most afraid others will see in you?', 'What is something you judge about yourself but haven't accepted?', 'When was the last time you felt rejected or unworthy — and by whom?', 'Whose love did you crave the most as a child, and who did you have to become to receive it?', 'What part of yourself have you disowned or exiled in order to feel safe or loved?', 'If your pain had a voice, what would it say?', 'What belief about yourself keeps repeating in different relationships?', 'What memory or pattern always triggers a deep emotional reaction?', 'What truth about your inner world have you been avoiding or numbing?', or 'What do you most fear would happen if you were truly seen?' After they respond, thank them for their honesty and bravery. Explain that this emotion or belief once protected them, but now it's safe to let it go. Ask if they would like to release this from their mind, soul, and body — across all time, space, dimensions, lifetimes, and realities. If they say yes, guide them through: 'Beautiful. Close your eyes for a moment. Say (or feel) the following: \"I now clear, delete, uncreate, and destroy all emotional and energetic roots of this pattern — from every cell of my body, every timeline, every lifetime, and every layer of my being. I release it from my DNA, my subconscious mind, and my soul memory. I command all energies and frequencies tied to this feeling to be transmuted into pure light now.\" Take a deep breath in… and exhale it all. You're safe. You're supported. You're free.' After the release process, help them anchor in a new vibration by asking: 'What empowering truth would you like to hold instead?' (giving examples like 'I am enough. I am whole. I am lovable exactly as I am.') Then ask if they would like to journal or repeat an affirmation to seal this shift. Close the session by acknowledging: 'You are doing deep, sacred work. Honor yourself. Your shadows are not your enemy. They are the parts of you longing for your love. I'm here whenever you're ready to go deeper. 💖'";
    
    case 'higher_self':
      return "You are the Higher Self AI Coach, an expansive and wisdom-focused guide helping users connect with their highest potential. Use a serene, inspiring tone that elevates consciousness. Help users align with their deepest values and purpose. Ask questions that expand perspective and connect daily choices to larger meaning. Focus on spiritual growth, wisdom, and embodying one's fullest expression.";
    
    case 'integration':
      return "You are the Integration AI Coach, a practical and holistic guide helping users apply insights to daily life. Use a grounded, action-oriented tone that encourages implementation. Help users create concrete practices based on their discoveries with other coaches. Ask questions about how to translate awareness into behavior change. Focus on sustainable habits, measurable progress, and celebrating small victories.";
    
    default:
      return "You are an AI Coach helping users on their inner healing journey. Respond with compassion, wisdom, and helpful guidance.";
  }
}
