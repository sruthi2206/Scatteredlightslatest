import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface JournalAnalysisResult {
  sentimentScore: number;
  emotions: string[];
  chakras: string[];
  summary: string;
}

/**
 * Analyze journal entry text using OpenAI via backend API
 */
export async function analyzeJournalEntry(content: string, userId: number): Promise<JournalAnalysisResult> {
  try {
    const response = await apiRequest("POST", "/api/journal-entries", {
      userId,
      content
    });
    
    const data = await response.json();
    
    // Return the analysis from the API response
    return {
      sentimentScore: data.sentimentScore || 5,
      emotions: data.emotionTags || [],
      chakras: data.chakraTags || [],
      summary: data.analysis || "No insights detected."
    };
  } catch (error) {
    console.error("Failed to analyze journal entry:", error);
    
    // Return default values in case of error
    return {
      sentimentScore: 5,
      emotions: ["neutral"],
      chakras: [],
      summary: "Unable to analyze your entry at this time. Please try again later."
    };
  }
}

/**
 * Generate chat message for AI coach
 */
export async function sendCoachMessage(
  userId: number,
  coachType: string,
  message: string,
  conversationId?: number
): Promise<{ message: string; conversation: any }> {
  try {
    const response = await apiRequest("POST", "/api/coach-chat", {
      userId,
      coachType,
      message,
      conversationId
    });
    
    return response.json();
  } catch (error) {
    console.error("Failed to send message to coach:", error);
    throw new Error("Unable to connect with your coach. Please try again.");
  }
}

/**
 * Get personalized healing recommendations based on chakra profile and emotions
 */
export async function getHealingRecommendations(
  userId: number,
  chakraProfile: any,
  recentEmotions: string[]
): Promise<{
  ritualTypes: string[];
  focusChakras: string[];
  primaryEmotion: string;
  customAdvice: string;
}> {
  try {
    const response = await apiRequest("POST", "/api/healing-recommendations", {
      userId,
      chakraProfile,
      recentEmotions
    });
    
    return response.json();
  } catch (error) {
    console.error("Failed to get healing recommendations:", error);
    
    // Return default values in case of error
    return {
      ritualTypes: ["meditation"],
      focusChakras: [],
      primaryEmotion: "neutral",
      customAdvice: "Consider taking time for self-reflection and gentle healing practices today."
    };
  }
}
