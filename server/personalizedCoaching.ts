import OpenAI from "openai";
import { db } from "./db";
import { users, journalEntries, chakraProfiles, coachConversations } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { trackTokenUsage, checkDailyTokenLimit } from "./tokenTracking";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface PersonalizationContext {
  user: {
    name: string;
    membershipTier: string;
    joinedAt: Date;
    language?: string;
  };
  chakraProfile?: {
    primaryImbalance: string;
    strongestChakra: string;
    overallBalance: number;
  };
  journalInsights: {
    recentMood: string;
    dominantEmotions: string[];
    recurringThemes: string[];
    progressPatterns: string[];
  };
  conversationHistory: {
    sessionCount: number;
    lastTopics: string[];
    breakthroughs: string[];
    currentChallenges: string[];
  };
  healingJourney: {
    daysActive: number;
    consistencyScore: number;
    growthAreas: string[];
    achievements: string[];
  };
}

export async function buildPersonalizationContext(userId: number, coachType: string): Promise<PersonalizationContext> {
  try {
    // Fetch user basic info
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) throw new Error("User not found");

    // Fetch chakra profile
    const chakraProfile = await db.select()
      .from(chakraProfiles)
      .where(eq(chakraProfiles.userId, userId))
      .limit(1);

    // Fetch recent journal entries (last 30 days)
    const recentJournals = await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(10);

    // Fetch conversation history for this coach
    const conversations = await db.select()
      .from(coachConversations)
      .where(and(
        eq(coachConversations.userId, userId),
        eq(coachConversations.coachType, coachType)
      ))
      .orderBy(desc(coachConversations.updatedAt))
      .limit(5);

    // Analyze chakra data
    const chakraInsights = analyzeChakraProfile(chakraProfile[0]);
    
    // Analyze journal patterns
    const journalInsights = analyzeJournalPatterns(recentJournals);
    
    // Analyze conversation patterns
    const conversationInsights = analyzeConversationHistory(conversations);
    
    // Calculate healing journey metrics
    const healingJourneyData = calculateHealingJourney(user[0], recentJournals, conversations);

    return {
      user: {
        name: user[0].name || "Friend",
        membershipTier: "free", // Default tier since field doesn't exist in schema
        joinedAt: user[0].createdAt || new Date(),
        language: "english" // Default language since field doesn't exist in schema
      },
      chakraProfile: chakraInsights,
      journalInsights,
      conversationHistory: conversationInsights,
      healingJourney: healingJourneyData
    };
  } catch (error) {
    console.error("Error building personalization context:", error);
    // Return basic context if there's an error
    return {
      user: { name: "Friend", membershipTier: "free", joinedAt: new Date() },
      journalInsights: {
        recentMood: "neutral",
        dominantEmotions: [],
        recurringThemes: [],
        progressPatterns: []
      },
      conversationHistory: {
        sessionCount: 0,
        lastTopics: [],
        breakthroughs: [],
        currentChallenges: []
      },
      healingJourney: {
        daysActive: 0,
        consistencyScore: 0,
        growthAreas: [],
        achievements: []
      }
    };
  }
}

function analyzeChakraProfile(profile: any) {
  if (!profile) return undefined;

  const chakraValues: Record<string, number> = {
    root: profile.rootChakra,
    sacral: profile.sacralChakra,
    solarPlexus: profile.solarPlexusChakra,
    heart: profile.heartChakra,
    throat: profile.throatChakra,
    thirdEye: profile.thirdEyeChakra,
    crown: profile.crownChakra
  };

  const chakraNames: Record<string, string> = {
    root: "Root Chakra",
    sacral: "Sacral Chakra", 
    solarPlexus: "Solar Plexus Chakra",
    heart: "Heart Chakra",
    throat: "Throat Chakra",
    thirdEye: "Third Eye Chakra",
    crown: "Crown Chakra"
  };

  // Find strongest and weakest chakras
  const entries = Object.entries(chakraValues);
  const strongest = entries.reduce((a, b) => chakraValues[a[0]] > chakraValues[b[0]] ? a : b);
  const weakest = entries.reduce((a, b) => chakraValues[a[0]] < chakraValues[b[0]] ? a : b);
  
  const average = Object.values(chakraValues).reduce((a, b) => a + b, 0) / 7;

  return {
    primaryImbalance: chakraNames[weakest[0]],
    strongestChakra: chakraNames[strongest[0]],
    overallBalance: Math.round(average * 10)
  };
}

function analyzeJournalPatterns(journals: any[]) {
  if (!journals.length) {
    return {
      recentMood: "neutral",
      dominantEmotions: [],
      recurringThemes: [],
      progressPatterns: []
    };
  }

  // Analyze content for emotional patterns
  const allContent = journals.map(j => j.content || "").join(" ").toLowerCase();
  const allGratitude = journals.flatMap(j => j.gratitude || []).join(" ").toLowerCase();
  
  // Simple sentiment analysis
  const positiveWords = ["happy", "grateful", "peaceful", "joy", "love", "excited", "calm", "strong"];
  const negativeWords = ["sad", "angry", "frustrated", "anxious", "worried", "stressed", "overwhelmed"];
  const spiritualWords = ["meditation", "chakra", "energy", "spiritual", "healing", "growth", "awakening"];

  const positiveCount = positiveWords.filter(word => allContent.includes(word) || allGratitude.includes(word)).length;
  const negativeCount = negativeWords.filter(word => allContent.includes(word)).length;
  const spiritualCount = spiritualWords.filter(word => allContent.includes(word)).length;

  let recentMood = "neutral";
  if (positiveCount > negativeCount + 1) recentMood = "positive";
  else if (negativeCount > positiveCount + 1) recentMood = "challenging";

  const dominantEmotions = [];
  if (positiveCount > 2) dominantEmotions.push("gratitude", "joy");
  if (negativeCount > 2) dominantEmotions.push("processing challenges");
  if (spiritualCount > 1) dominantEmotions.push("spiritual seeking");

  const themes = [];
  if (allContent.includes("relationship")) themes.push("relationships");
  if (allContent.includes("work") || allContent.includes("job")) themes.push("career");
  if (allContent.includes("family")) themes.push("family dynamics");
  if (allContent.includes("goal") || allContent.includes("dream")) themes.push("personal goals");

  return {
    recentMood,
    dominantEmotions,
    recurringThemes: themes,
    progressPatterns: journals.length > 3 ? ["consistent journaling"] : ["building routine"]
  };
}

function analyzeConversationHistory(conversations: any[]) {
  const sessionCount = conversations.length;
  
  // Extract topics from conversation messages
  const allMessages = conversations.flatMap(conv => conv.messages || []);
  const userMessages = allMessages.filter(msg => msg.role === "user");
  
  const topics: string[] = [];
  const challenges: string[] = [];
  const breakthroughs: string[] = [];

  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    
    // Topic detection
    if (content.includes("childhood") || content.includes("inner child")) topics.push("inner child work");
    if (content.includes("shadow") || content.includes("trigger")) topics.push("shadow integration");
    if (content.includes("purpose") || content.includes("calling")) topics.push("life purpose");
    if (content.includes("relationship")) topics.push("relationships");
    
    // Challenge detection
    if (content.includes("stuck") || content.includes("struggle")) challenges.push("feeling stuck");
    if (content.includes("fear") || content.includes("afraid")) challenges.push("working with fear");
    
    // Breakthrough detection
    if (content.includes("insight") || content.includes("realized")) breakthroughs.push("new awareness");
    if (content.includes("better") || content.includes("improved")) breakthroughs.push("positive change");
  });

  return {
    sessionCount,
    lastTopics: Array.from(new Set(topics)).slice(0, 3),
    breakthroughs: Array.from(new Set(breakthroughs)).slice(0, 2),
    currentChallenges: Array.from(new Set(challenges)).slice(0, 2)
  };
}

function calculateHealingJourney(user: any, journals: any[], conversations: any[]) {
  const joinDate = new Date(user.createdAt);
  const now = new Date();
  const daysActive = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate consistency score based on recent activity
  const recentDays = 30;
  const expectedEntries = Math.min(daysActive, recentDays);
  const actualEntries = journals.length;
  const consistencyScore = Math.min(Math.round((actualEntries / Math.max(expectedEntries, 1)) * 100), 100);

  const growthAreas = [];
  const achievements = [];

  // Determine growth areas based on activity
  if (journals.length === 0) growthAreas.push("establishing journaling practice");
  if (conversations.length === 0) growthAreas.push("beginning coaching conversations");
  if (consistencyScore < 30) growthAreas.push("building consistency");

  // Recognize achievements
  if (journals.length > 5) achievements.push("committed journalist");
  if (conversations.length > 3) achievements.push("active in coaching");
  if (consistencyScore > 70) achievements.push("highly consistent practice");
  if (daysActive > 30) achievements.push("30+ days on healing journey");

  return {
    daysActive,
    consistencyScore,
    growthAreas: growthAreas.slice(0, 3),
    achievements: achievements.slice(0, 3)
  };
}

export async function generatePersonalizedCoachPrompt(
  coachType: string,
  context: PersonalizationContext,
  userMessage: string,
  conversationHistory: any[] = []
): Promise<string> {
  
  const basePrompt = getBaseCoachPrompt(coachType);
  
  const personalizedElements = [
    `User Profile: ${context.user.name} has been on their healing journey for ${context.healingJourney.daysActive} days with a ${context.healingJourney.consistencyScore}% consistency score.`,
    
    context.chakraProfile ? 
      `Chakra Insights: Primary growth area is ${context.chakraProfile.primaryImbalance}, strongest energy in ${context.chakraProfile.strongestChakra}. Overall balance: ${context.chakraProfile.overallBalance}%.` : 
      "",
    
    `Current Emotional State: ${context.journalInsights.recentMood} mood with dominant themes of ${context.journalInsights.dominantEmotions.join(", ") || "general exploration"}.`,
    
    context.journalInsights.recurringThemes.length > 0 ?
      `Recurring Life Themes: ${context.journalInsights.recurringThemes.join(", ")}.` :
      "",
    
    context.conversationHistory.sessionCount > 0 ?
      `Previous Sessions: ${context.conversationHistory.sessionCount} conversations, recent topics: ${context.conversationHistory.lastTopics.join(", ") || "initial exploration"}.` :
      "",
    
    context.conversationHistory.breakthroughs.length > 0 ?
      `Recent Breakthroughs: ${context.conversationHistory.breakthroughs.join(", ")}.` :
      "",
    
    context.conversationHistory.currentChallenges.length > 0 ?
      `Current Challenges: ${context.conversationHistory.currentChallenges.join(", ")}.` :
      "",
    
    context.healingJourney.achievements.length > 0 ?
      `Achievements: ${context.healingJourney.achievements.join(", ")}.` :
      "",
    
    context.healingJourney.growthAreas.length > 0 ?
      `Growth Areas: ${context.healingJourney.growthAreas.join(", ")}.` :
      ""
  ].filter(Boolean).join("\n");

  const adaptiveInstructions = generateAdaptiveInstructions(coachType, context);
  
  const fullPrompt = `${basePrompt}

PERSONALIZATION CONTEXT:
${personalizedElements}

ADAPTIVE COACHING APPROACH:
${adaptiveInstructions}

CONVERSATION GUIDELINES:
- Reference their journey stage and progress naturally
- Connect new insights to their recurring themes when relevant
- Acknowledge their achievements and growth
- Tailor depth and complexity to their experience level
- Use their preferred communication style (observed from history)
- Build on previous breakthroughs and address ongoing challenges
- Suggest practices aligned with their chakra profile when appropriate

Current user message: "${userMessage}"

Respond as their personalized ${coachType.replace('_', ' ')} coach, incorporating this context naturally and compassionately.`;

  return fullPrompt;
}

function getBaseCoachPrompt(coachType: string): string {
  switch (coachType) {
    case 'inner_child':
      return "You are a deeply compassionate Inner Child Healing coach. You create a safe, nurturing space for exploring childhood wounds and reconnecting with authentic self-expression. Use trauma-informed approaches and emphasize self-compassion.";
    
    case 'shadow_self':
      return "You are a wise Shadow Work coach who helps users integrate disowned aspects with compassion. You guide deep self-inquiry while maintaining safety and non-judgment. You understand that shadow work requires courage and patience.";
    
    case 'higher_self':
      return "You are an enlightened Higher Self coach who connects users to their highest wisdom and potential. You facilitate access to inner knowing and help align actions with soul purpose. Your approach is spiritually grounded yet practical.";
    
    case 'integration':
      return "You are a skilled Integration coach who bridges spiritual insights with daily life. You help transform awareness into sustainable practices and track meaningful progress. Your approach is holistic and action-oriented.";
    
    default:
      return "You are a supportive personal growth coach.";
  }
}

function generateAdaptiveInstructions(coachType: string, context: PersonalizationContext): string {
  const instructions = [];
  
  // Adapt based on journey stage
  if (context.healingJourney.daysActive < 7) {
    instructions.push("- This is a new user - provide extra support and explanation of the process");
    instructions.push("- Focus on building trust and establishing safe practices");
  } else if (context.healingJourney.daysActive > 90) {
    instructions.push("- This is an experienced user - offer deeper, more advanced insights");
    instructions.push("- Reference their journey progression and celebrate long-term commitment");
  }
  
  // Adapt based on consistency
  if (context.healingJourney.consistencyScore < 30) {
    instructions.push("- Gently encourage more regular practice without judgment");
    instructions.push("- Suggest smaller, more manageable steps");
  } else if (context.healingJourney.consistencyScore > 80) {
    instructions.push("- Acknowledge their excellent consistency");
    instructions.push("- Offer more challenging or advanced practices");
  }
  
  // Adapt based on mood
  if (context.journalInsights.recentMood === "challenging") {
    instructions.push("- Provide extra emotional support and validation");
    instructions.push("- Focus on stabilizing practices and self-care");
  } else if (context.journalInsights.recentMood === "positive") {
    instructions.push("- Build on their positive momentum");
    instructions.push("- Introduce growth-oriented challenges");
  }
  
  // Coach-specific adaptations
  if (coachType === 'shadow_self' && context.conversationHistory.sessionCount === 0) {
    instructions.push("- Begin with the special grounding and release protocol");
  }
  
  if (coachType === 'integration' && context.conversationHistory.breakthroughs.length > 0) {
    instructions.push("- Help them create concrete action steps from their recent breakthroughs");
  }
  
  return instructions.join("\n");
}

export async function generatePersonalizedResponse(
  coachType: string,
  userId: number,
  userMessage: string,
  conversationHistory: any[] = [],
  conversationId?: number
): Promise<string> {
  try {
    // Check daily token limit before making API call
    const dailyLimitCheck = await checkDailyTokenLimit(userId);
    if (!dailyLimitCheck.canProceed) {
      return "Thank you we have reached today's usage limit, please join with me tomorrow for your healing journey, have a blessed and amazing day ahead.";
    }

    // Build personalization context
    const context = await buildPersonalizationContext(userId, coachType);
    
    // Generate personalized prompt
    const prompt = await generatePersonalizedCoachPrompt(coachType, context, userMessage, conversationHistory);
    
    // Get AI response with personalized context
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: prompt },
        ...conversationHistory.slice(-10), // Include recent conversation context
        { role: "user", content: userMessage }
      ],
      temperature: getCoachTemperature(coachType),
      max_tokens: 1000
    });

    // Track token usage after successful API call
    if (response.usage) {
      await trackTokenUsage({
        userId,
        coachType,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        model: "gpt-4o",
        conversationId: conversationId
      });
    }

    return response.choices[0].message.content || "I'm here to support you on your journey.";
    
  } catch (error) {
    console.error("Error generating personalized response:", error);
    // Fallback to basic response
    return generateFallbackResponse(coachType, userMessage);
  }
}

function getCoachTemperature(coachType: string): number {
  switch (coachType) {
    case 'inner_child': return 0.8; // More creative and nurturing
    case 'shadow_self': return 0.7; // Balanced insight and creativity
    case 'higher_self': return 0.6; // More wisdom-focused
    case 'integration': return 0.5; // More practical and structured
    default: return 0.7;
  }
}

function generateFallbackResponse(coachType: string, userMessage: string): string {
  const responses = {
    inner_child: "Thank you for sharing that with me. Your inner child's voice is important, and I'm here to listen with complete compassion. What feelings are coming up for you right now?",
    shadow_self: "I appreciate your courage in exploring these deeper aspects of yourself. Shadow work takes bravery, and you're taking meaningful steps. What would you like to examine more closely?",
    higher_self: "Your awareness and willingness to grow speaks to your higher wisdom. Trust the insights that are emerging within you. What guidance is your inner knowing offering you?",
    integration: "You're doing important work in bringing awareness into action. Each step forward matters. What feels like the most practical next step for you right now?"
  };
  
  return responses[coachType as keyof typeof responses] || "Thank you for sharing. I'm here to support your growth and healing journey.";
}