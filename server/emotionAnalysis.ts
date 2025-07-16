import { OpenAI } from 'openai';
import { db } from './db';
import { asc, desc, eq, and, sql } from 'drizzle-orm';
import { journalEntries, coachConversations, chakraProfiles } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions
export interface EmotionData {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  love: number;
  surprise: number;
  guilt: number;
  shame: number;
  peace: number;
  confusion: number;
}

export interface EmotionEntry {
  id: string;
  date: string;
  source: 'journal' | 'chat' | 'chakra_assessment';
  content: string;
  emotions: EmotionData;
  userId: number;
}

// Function to analyze emotions from text content using OpenAI
export async function analyzeEmotions(content: string): Promise<EmotionData> {
  if (!content || content.trim().length === 0) {
    return {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      love: 0,
      surprise: 0,
      guilt: 0,
      shame: 0,
      peace: 0,
      confusion: 0,
    };
  }

  try {
    // Create a prompt for emotion analysis
    const prompt = `
    Analyze the following text for emotional tones. Score each emotion on a scale from 0 to 100, where 0 means the emotion is not present at all, and 100 means it's extremely intense.

    Text: "${content.replace(/"/g, '\\"')}"

    Return a valid JSON object with the following format:
    {
      "joy": number,
      "sadness": number,
      "anger": number,
      "fear": number,
      "love": number,
      "surprise": number,
      "guilt": number,
      "shame": number, 
      "peace": number,
      "confusion": number
    }
    Only return the JSON object, nothing else.
    `;

    // Call OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    // Parse and return the emotions
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      joy: result.joy || 0,
      sadness: result.sadness || 0,
      anger: result.anger || 0,
      fear: result.fear || 0,
      love: result.love || 0,
      surprise: result.surprise || 0,
      guilt: result.guilt || 0,
      shame: result.shame || 0,
      peace: result.peace || 0,
      confusion: result.confusion || 0,
    };
  } catch (error) {
    console.error("Error analyzing emotions:", error);
    // Return default values if analysis fails
    return {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      love: 0,
      surprise: 0,
      guilt: 0,
      shame: 0,
      peace: 0,
      confusion: 0,
    };
  }
}

// Function to fetch and process journal entries
async function processJournalEntries(userId: number): Promise<EmotionEntry[]> {
  // Fetch journal entries for the user
  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));

  // Process each entry
  const results: EmotionEntry[] = [];
  
  for (const entry of entries) {
    // Combine all text fields for analysis
    const contentToAnalyze = `
      ${entry.content || ''}
      ${entry.gratitude ? `Gratitude: ${entry.gratitude.join(', ')}` : ''}
      ${entry.affirmation || ''}
      ${entry.shortTermGoals ? `Goals: ${entry.shortTermGoals.join(', ')}` : ''}
      ${entry.longTermVision || ''}
    `;
    
    // Analyze emotions
    const emotions = await analyzeEmotions(contentToAnalyze);
    
    // Format the date (YYYY-MM-DD)
    const date = new Date(entry.createdAt || new Date()).toISOString().split('T')[0];
    
    // Add to results
    results.push({
      id: uuidv4(),
      date,
      source: 'journal',
      content: contentToAnalyze,
      emotions,
      userId,
    });
  }
  
  return results;
}

// Function to fetch and process coach conversations
async function processCoachConversations(userId: number): Promise<EmotionEntry[]> {
  // Fetch coach conversations for the user
  const conversations = await db
    .select()
    .from(coachConversations)
    .where(eq(coachConversations.userId, userId))
    .orderBy(desc(coachConversations.updatedAt));

  // Process each conversation
  const results: EmotionEntry[] = [];
  
  for (const conversation of conversations) {
    // Extract user messages from the conversation
    const messages = conversation.messages || [];
    let userMessages = '';
    
    if (Array.isArray(messages)) {
      userMessages = messages
        .filter((msg: any) => msg.role === 'user')
        .map((msg: any) => msg.content || '')
        .join('\n');
    }
    
    if (userMessages.trim().length === 0) continue;
    
    // Analyze emotions
    const emotions = await analyzeEmotions(userMessages);
    
    // Format the date (YYYY-MM-DD)
    const date = new Date(conversation.updatedAt || new Date()).toISOString().split('T')[0];
    
    // Add to results
    results.push({
      id: uuidv4(),
      date,
      source: 'chat',
      content: userMessages,
      emotions,
      userId,
    });
  }
  
  return results;
}

// Function to fetch and process chakra assessments
async function processChakraAssessments(userId: number): Promise<EmotionEntry[]> {
  // Fetch chakra profiles for the user (use updatedAt to track different assessments)
  const profiles = await db
    .select({
      id: chakraProfiles.id,
      userId: chakraProfiles.userId,
      crownChakra: chakraProfiles.crownChakra,
      thirdEyeChakra: chakraProfiles.thirdEyeChakra,
      throatChakra: chakraProfiles.throatChakra,
      heartChakra: chakraProfiles.heartChakra,
      solarPlexusChakra: chakraProfiles.solarPlexusChakra,
      sacralChakra: chakraProfiles.sacralChakra,
      rootChakra: chakraProfiles.rootChakra,
      createdAt: chakraProfiles.createdAt,
      updatedAt: chakraProfiles.updatedAt,
    })
    .from(chakraProfiles)
    .where(eq(chakraProfiles.userId, userId))
    .orderBy(desc(chakraProfiles.updatedAt));

  if (profiles.length === 0) {
    return [];
  }

  // Process the latest chakra assessment
  const results: EmotionEntry[] = [];
  
  for (const profile of profiles) {
    // Convert chakra values to a description
    const contentToAnalyze = `
      Crown Chakra: ${profile.crownChakra}/10
      Third Eye Chakra: ${profile.thirdEyeChakra}/10
      Throat Chakra: ${profile.throatChakra}/10
      Heart Chakra: ${profile.heartChakra}/10
      Solar Plexus Chakra: ${profile.solarPlexusChakra}/10
      Sacral Chakra: ${profile.sacralChakra}/10
      Root Chakra: ${profile.rootChakra}/10
    `;
    
    // Analyze emotions based on chakra values
    const emotions = await analyzeEmotions(contentToAnalyze);
    
    // Format the date (YYYY-MM-DD)
    const date = new Date(profile.updatedAt || new Date()).toISOString().split('T')[0];
    
    // Add to results
    results.push({
      id: uuidv4(),
      date,
      source: 'chakra_assessment',
      content: contentToAnalyze,
      emotions,
      userId,
    });
  }
  
  return results;
}

// Main function to aggregate all emotion data
export async function getUserEmotionData(userId: number): Promise<EmotionEntry[]> {
  try {
    // Process data from all sources
    const [journalData, chatData, chakraData] = await Promise.all([
      processJournalEntries(userId),
      processCoachConversations(userId),
      processChakraAssessments(userId),
    ]);
    
    // Combine all data
    const allData = [...journalData, ...chatData, ...chakraData];
    
    // Sort chronologically
    allData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return allData;
  } catch (error) {
    console.error("Error getting user emotion data:", error);
    return [];
  }
}

// Function to aggregate emotion data by day/week
export function aggregateEmotionsByPeriod(data: EmotionEntry[], period: 'day' | 'week' | 'month'): any[] {
  // Group data by time period
  const groupedData: { [key: string]: EmotionEntry[] } = {};
  
  data.forEach(entry => {
    let key = entry.date; // Default for 'day'
    
    if (period === 'week') {
      // Get the week number (approximate)
      const date = new Date(entry.date);
      const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
      key = `${date.getFullYear()}-${date.getMonth() + 1}-W${weekNumber}`;
    } else if (period === 'month') {
      // Get YYYY-MM
      key = entry.date.substring(0, 7);
    }
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    
    groupedData[key].push(entry);
  });
  
  // Calculate average emotions for each time period
  const result = Object.entries(groupedData).map(([timeKey, entries]) => {
    // Initialize average emotion values
    const avgEmotions: EmotionData = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      love: 0,
      surprise: 0,
      guilt: 0,
      shame: 0,
      peace: 0,
      confusion: 0,
    };
    
    // Sum up all emotion values
    entries.forEach(entry => {
      Object.keys(avgEmotions).forEach(emotion => {
        avgEmotions[emotion as keyof EmotionData] += entry.emotions[emotion as keyof EmotionData];
      });
    });
    
    // Calculate averages
    const entryCount = entries.length;
    Object.keys(avgEmotions).forEach(emotion => {
      avgEmotions[emotion as keyof EmotionData] = Math.round(avgEmotions[emotion as keyof EmotionData] / entryCount);
    });
    
    // Format result
    return {
      period: timeKey,
      emotions: avgEmotions,
      count: entryCount,
      sources: {
        journal: entries.filter(e => e.source === 'journal').length,
        chat: entries.filter(e => e.source === 'chat').length,
        chakra_assessment: entries.filter(e => e.source === 'chakra_assessment').length,
      }
    };
  });
  
  // Sort by time period
  result.sort((a, b) => {
    return a.period.localeCompare(b.period);
  });
  
  return result;
}