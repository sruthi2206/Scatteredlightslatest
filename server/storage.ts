import {
  User, InsertUser,
  ChakraProfile, InsertChakraProfile,
  JournalEntry, InsertJournalEntry,
  EmotionTracking, InsertEmotionTracking,
  CoachConversation, InsertCoachConversation,
  HealingRitual, InsertHealingRitual,
  UserRecommendation, InsertUserRecommendation
} from "@shared/schema";

import session from "express-session";

export interface IStorage {
  // Session storage for authentication
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserLights(userId: number, lights: number): Promise<User | undefined>;
  updatePremiumExpiry(userId: number, premiumExpiryDate: Date): Promise<User | undefined>;

  // Chakra profile operations
  getChakraProfile(userId: number): Promise<ChakraProfile | undefined>;
  getChakraProfileById(id: number): Promise<ChakraProfile | undefined>;
  createChakraProfile(profile: InsertChakraProfile): Promise<ChakraProfile>;
  updateChakraProfile(id: number, profile: Partial<InsertChakraProfile>): Promise<ChakraProfile | undefined>;

  // Journal entry operations
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  // Emotion tracking operations
  getEmotionTrackings(userId: number): Promise<EmotionTracking[]>;
  createEmotionTracking(tracking: InsertEmotionTracking): Promise<EmotionTracking>;

  // Coach conversation operations
  getCoachConversations(userId: number, coachType?: string): Promise<CoachConversation[]>;
  getCoachConversation(id: number): Promise<CoachConversation | undefined>;
  createCoachConversation(conversation: InsertCoachConversation): Promise<CoachConversation>;
  updateCoachConversation(id: number, messages: any): Promise<CoachConversation | undefined>;
  deleteCoachConversation(id: number): Promise<void>;

  // Healing ritual operations
  getHealingRituals(): Promise<HealingRitual[]>;
  getHealingRitual(id: number): Promise<HealingRitual | undefined>;
  getHealingRitualsByTarget(targetChakra?: string, targetEmotion?: string): Promise<HealingRitual[]>;
  createHealingRitual(ritual: InsertHealingRitual): Promise<HealingRitual>;
  updateHealingRitual(id: number, ritual: InsertHealingRitual): Promise<HealingRitual | undefined>;
  deleteHealingRitual(id: number): Promise<void>;

  // User recommendation operations
  getUserRecommendations(userId: number): Promise<UserRecommendation[]>;
  createUserRecommendation(recommendation: InsertUserRecommendation): Promise<UserRecommendation>;
  updateUserRecommendation(id: number, completed: boolean): Promise<UserRecommendation | undefined>;
  
  // Community event operations
  getCommunityEvents(): Promise<CommunityEvent[]>;
  getCommunityEvent(id: number): Promise<CommunityEvent | undefined>;
  createCommunityEvent(event: InsertCommunityEvent): Promise<CommunityEvent>;
  updateCommunityEvent(id: number, event: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined>;
  deleteCommunityEvent(id: number): Promise<void>;
  
  // Event attendee operations
  getEventAttendees(eventId: number): Promise<EventAttendee[]>;
  getUserEventRegistrations(userId: number): Promise<EventAttendee[]>;
  registerForEvent(attendee: InsertEventAttendee): Promise<EventAttendee>;
  markAttendance(id: number, attended: boolean): Promise<EventAttendee | undefined>;
  
  // Media library operations
  getMediaItems(): Promise<MediaItem[]>;
  getMediaItem(id: number): Promise<MediaItem | undefined>;
  uploadMedia(media: InsertMediaItem): Promise<MediaItem>;
  deleteMedia(id: number): Promise<void>;
  
  // Community posts operations
  getCommunityPosts(): Promise<CommunityPost[]>;
  getUserPosts(userId: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: number): Promise<void>;
  
  // Post reactions operations
  getPostReactions(postId: number): Promise<PostReaction[]>;
  getUserReaction(postId: number, userId: number): Promise<PostReaction | undefined>;
  createPostReaction(reaction: InsertPostReaction): Promise<PostReaction>;
  deletePostReaction(id: number): Promise<void>;
  
  // Post comments operations
  getPostComments(postId: number): Promise<PostComment[]>;
  createPostComment(comment: InsertPostComment): Promise<PostComment>;
  updatePostComment(id: number, content: string): Promise<PostComment | undefined>;
  deletePostComment(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chakraProfiles: Map<number, ChakraProfile>;
  private journalEntries: Map<number, JournalEntry>;
  private emotionTrackings: Map<number, EmotionTracking>;
  private coachConversations: Map<number, CoachConversation>;
  private healingRituals: Map<number, HealingRitual>;
  private userRecommendations: Map<number, UserRecommendation>;
  
  private userIdCounter: number;
  private chakraProfileIdCounter: number;
  private journalEntryIdCounter: number;
  private emotionTrackingIdCounter: number;
  private coachConversationIdCounter: number;
  private healingRitualIdCounter: number;
  private userRecommendationIdCounter: number;
  
  // Session store for authentication
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.chakraProfiles = new Map();
    this.journalEntries = new Map();
    this.emotionTrackings = new Map();
    this.coachConversations = new Map();
    this.healingRituals = new Map();
    this.userRecommendations = new Map();
    
    this.userIdCounter = 1;
    this.chakraProfileIdCounter = 1;
    this.journalEntryIdCounter = 1;
    this.emotionTrackingIdCounter = 1;
    this.coachConversationIdCounter = 1;
    this.healingRitualIdCounter = 1;
    this.userRecommendationIdCounter = 1;
    
    // Create in-memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with default healing rituals
    this.initializeHealingRituals();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }
  
  async updateUserLights(userId: number, lights: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      lights
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updatePremiumExpiry(userId: number, premiumExpiryDate: Date): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      premiumExpiryDate
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin || false,
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }

  // Chakra profile operations
  async getChakraProfile(userId: number): Promise<ChakraProfile | undefined> {
    return Array.from(this.chakraProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async getChakraProfileById(id: number): Promise<ChakraProfile | undefined> {
    return this.chakraProfiles.get(id);
  }

  async createChakraProfile(insertProfile: InsertChakraProfile): Promise<ChakraProfile> {
    const id = this.chakraProfileIdCounter++;
    const timestamp = new Date();
    const profile: ChakraProfile = {
      ...insertProfile,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.chakraProfiles.set(id, profile);
    return profile;
  }

  async updateChakraProfile(id: number, profileUpdate: Partial<InsertChakraProfile>): Promise<ChakraProfile | undefined> {
    const profile = this.chakraProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile: ChakraProfile = {
      ...profile,
      ...profileUpdate,
      updatedAt: new Date()
    };
    
    this.chakraProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Journal entry operations
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalEntryIdCounter++;
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      createdAt: new Date()
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  // Emotion tracking operations
  async getEmotionTrackings(userId: number): Promise<EmotionTracking[]> {
    return Array.from(this.emotionTrackings.values())
      .filter(tracking => tracking.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createEmotionTracking(insertTracking: InsertEmotionTracking): Promise<EmotionTracking> {
    const id = this.emotionTrackingIdCounter++;
    const tracking: EmotionTracking = {
      ...insertTracking,
      id,
      createdAt: new Date()
    };
    this.emotionTrackings.set(id, tracking);
    return tracking;
  }

  // Coach conversation operations
  async getCoachConversations(userId: number, coachType?: string): Promise<CoachConversation[]> {
    try {
      // First filter by userId
      let conversations = Array.from(this.coachConversations.values())
        .filter(convo => convo.userId === userId);
      
      // Then strictly filter by coachType if specified
      if (coachType) {
        conversations = conversations.filter(convo => 
          convo.coachType === coachType
        );
      }
      
      // Sort by most recent
      return conversations.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA; // Descending order
      });
    } catch (error) {
      console.error("Error fetching coach conversations:", error);
      return [];
    }
  }

  async getCoachConversation(id: number): Promise<CoachConversation | undefined> {
    return this.coachConversations.get(id);
  }

  async createCoachConversation(insertConversation: InsertCoachConversation): Promise<CoachConversation> {
    const id = this.coachConversationIdCounter++;
    const timestamp = new Date();
    const conversation: CoachConversation = {
      ...insertConversation,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.coachConversations.set(id, conversation);
    return conversation;
  }

  async updateCoachConversation(id: number, messages: any): Promise<CoachConversation | undefined> {
    const conversation = this.coachConversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation: CoachConversation = {
      ...conversation,
      messages,
      updatedAt: new Date()
    };
    
    this.coachConversations.set(id, updatedConversation);
    return updatedConversation;
  }
  
  async deleteCoachConversation(id: number): Promise<void> {
    this.coachConversations.delete(id);
  }

  // Healing ritual operations
  async getHealingRituals(): Promise<HealingRitual[]> {
    return Array.from(this.healingRituals.values());
  }

  async getHealingRitual(id: number): Promise<HealingRitual | undefined> {
    return this.healingRituals.get(id);
  }

  async getHealingRitualsByTarget(targetChakra?: string, targetEmotion?: string): Promise<HealingRitual[]> {
    let rituals = Array.from(this.healingRituals.values());
    
    if (targetChakra) {
      rituals = rituals.filter(ritual => ritual.targetChakra === targetChakra);
    }
    
    if (targetEmotion) {
      rituals = rituals.filter(ritual => ritual.targetEmotion === targetEmotion);
    }
    
    return rituals;
  }

  async createHealingRitual(insertRitual: InsertHealingRitual): Promise<HealingRitual> {
    const id = this.healingRitualIdCounter++;
    const ritual: HealingRitual = {
      ...insertRitual,
      id
    };
    this.healingRituals.set(id, ritual);
    return ritual;
  }
  
  async updateHealingRitual(id: number, ritualUpdate: InsertHealingRitual): Promise<HealingRitual | undefined> {
    const ritual = this.healingRituals.get(id);
    if (!ritual) return undefined;
    
    const updatedRitual: HealingRitual = {
      ...ritual,
      ...ritualUpdate
    };
    
    this.healingRituals.set(id, updatedRitual);
    return updatedRitual;
  }
  
  async deleteHealingRitual(id: number): Promise<void> {
    this.healingRituals.delete(id);
  }

  // User recommendation operations
  async getUserRecommendations(userId: number): Promise<UserRecommendation[]> {
    return Array.from(this.userRecommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createUserRecommendation(insertRecommendation: InsertUserRecommendation): Promise<UserRecommendation> {
    const id = this.userRecommendationIdCounter++;
    const recommendation: UserRecommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date()
    };
    this.userRecommendations.set(id, recommendation);
    return recommendation;
  }

  async updateUserRecommendation(id: number, completed: boolean): Promise<UserRecommendation | undefined> {
    const recommendation = this.userRecommendations.get(id);
    if (!recommendation) return undefined;
    
    const updatedRecommendation: UserRecommendation = {
      ...recommendation,
      completed
    };
    
    this.userRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  // Initialize with default healing rituals
  private initializeHealingRituals() {
    const rituals: InsertHealingRitual[] = [
      {
        name: "Crown Chakra Visualization",
        description: "Connect with universal consciousness and expand your spiritual awareness",
        type: "visualization",
        targetChakra: "crown",
        targetEmotion: "confusion",
        instructions: "Find a quiet space, close your eyes, and visualize a violet light at the crown of your head. As you breathe deeply, imagine this light expanding and connecting you to universal wisdom."
      },
      {
        name: "Third Eye Meditation",
        description: "Enhance intuition and inner vision",
        type: "meditation",
        targetChakra: "third_eye",
        targetEmotion: "doubt",
        instructions: "Sit comfortably with eyes closed. Focus attention on the area between your eyebrows. Visualize an indigo light growing brighter with each breath, opening your inner eye to deeper insights."
      },
      {
        name: "Throat Chakra Sound Healing",
        description: "Release blocked expression and find your authentic voice",
        type: "sound_healing",
        targetChakra: "throat",
        targetEmotion: "fear",
        instructions: "Sit in a comfortable position and take deep breaths. Begin making the sound 'HAM' while focusing on your throat area. Feel the vibration releasing any blocks to your self-expression."
      },
      {
        name: "Heart-Opening Affirmations",
        description: "Nurture compassion and self-love",
        type: "affirmation",
        targetChakra: "heart",
        targetEmotion: "grief",
        instructions: "Place your hands over your heart. Breathe deeply and repeat: 'I am open to giving and receiving love. I deeply and completely love and accept myself.' Feel your heart space expanding with each repetition."
      },
      {
        name: "Solar Plexus Empowerment",
        description: "Build confidence and personal power",
        type: "visualization",
        targetChakra: "solar_plexus",
        targetEmotion: "shame",
        instructions: "Lie down comfortably. Place hands over your solar plexus (above navel). Visualize a bright yellow sun growing in this area with each breath, filling you with confidence and personal power."
      },
      {
        name: "Sacral Chakra Creativity Flow",
        description: "Unlock creative energy and emotional fluidity",
        type: "movement",
        targetChakra: "sacral",
        targetEmotion: "guilt",
        instructions: "Put on flowing music and allow your hips to sway gently. Focus on the area below your navel. Let movements become intuitive, expressing emotional release through free-form dance."
      },
      {
        name: "Root Chakra Grounding",
        description: "Establish safety and security within yourself",
        type: "somatic",
        targetChakra: "root",
        targetEmotion: "anxiety",
        instructions: "Stand barefoot on the earth if possible. Feel your feet connecting to the ground. Visualize roots growing from your feet deep into the earth, drawing up stability and security into your body."
      },
      {
        name: "Emotional Release Journaling",
        description: "Process and release difficult emotions through writing",
        type: "journaling",
        targetEmotion: "anger",
        instructions: "Take a blank page and write continuously without editing or judgment. Begin with 'I feel...' and allow all emotions to flow onto the page without restriction. When complete, you may destroy the page as a symbol of release."
      },
      {
        name: "Joy Activation Practice",
        description: "Cultivate and amplify feelings of joy and gratitude",
        type: "mindfulness",
        targetEmotion: "depression",
        instructions: "Recall a memory when you felt pure joy. Relive this moment with all your senses - what you saw, heard, felt. Allow the feeling to expand throughout your body. Place your hand on your heart and set an intention to carry this joy forward."
      },
      {
        name: "Full Chakra Balancing Meditation",
        description: "Harmonize all energy centers for complete alignment",
        type: "meditation",
        instructions: "Sit comfortably with spine straight. Visualize each chakra from root to crown, spending 1-2 minutes at each center. See each chakra as a spinning wheel of light in its respective color, clearing and balancing each one before moving upward."
      }
    ];
    
    rituals.forEach(ritual => {
      this.createHealingRitual(ritual);
    });
  }
}

// Import the database storage implementation
import { DatabaseStorage } from './storage-db';

// Use database storage for production use
export const storage = new DatabaseStorage();
