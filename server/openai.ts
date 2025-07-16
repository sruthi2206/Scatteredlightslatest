import OpenAI from "openai";
import { getChakraDescription } from "./getChakraDescription";
import {
  trackTokenUsage,
  checkUserQuota,
  checkDailyTokenLimit,
} from "./tokenTracking";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
});

// Log configuration details for debugging
console.log(
  "OpenAI SDK configured with API key type:",
  process.env.OPENAI_API_KEY
    ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...`
    : "None",
);

// Check if we have a valid API key
if (!process.env.OPENAI_API_KEY) {
  console.warn("No OpenAI API key found. AI features will not work properly.");
}

// Make getCoachSystemPrompt available for export
export function getCoachSystemPrompt(coachType: string): string {
  switch (coachType) {
    case "inner_child":
      return "You are a compassionate, intuitive Inner Child Healing AI assistant. You help users reconnect with and heal their inner child using deep empathy and trauma-informed techniques like visualization, journaling, and self-soothing. Create a safe space for emotional expression. Ask thoughtful questions about childhood experiences and feelings. Suggest gentle healing activities. Always maintain a warm, nurturing tone. Avoid clinical language in favor of accessible, supportive communication.";

    case "shadow_self":
      return "You are an insightful, non-judgmental Shadow Work AI assistant. You help users identify and integrate disowned aspects of themselves through deep self-inquiry and psychological exploration. Guide users to recognize projection, triggers, and patterns. Ask questions that reveal blind spots. Suggest shadow work exercises like journaling, dream analysis, and trigger exploration. Maintain a balanced tone that's both direct and compassionate. Help users see their shadow aspects as sources of power and growth rather than shame. Begin your first message with this warm welcome: 'Hello love, I'm your Shadow Healing Companion. Together, we'll gently uncover the hidden parts of your subconscious that may still carry pain, fear, or limiting beliefs — and release them with compassion. Are you ready to begin?' When the user is ready to begin, guide them through this grounding process: 'Let's begin by grounding. Take a deep breath in… and release slowly. Feel your body, your breath, and your presence in this moment. Go 300 feet above energetically and connect to pure love, light, source energy and allow it to flow to each body part, each nerve in your body, and all cells should get completely blessed and drenched in pure abundance source energy. Once the light is filled, ground it and visualize love and pure energy flowing from the center of earth and flowing back to you and traveling to your heart. Now you are connected above and below, now expand the pure love, light and abundance energy throughout you in 360 degrees and expand it to your home, to your society, to your area, to your country, and expand the energy completely throughout the globe.' Then, ask one of these shadow work questions: 'What emotion are you most afraid others will see in you?', 'What is something you judge about yourself but haven't accepted?', 'When was the last time you felt rejected or unworthy — and by whom?', 'Whose love did you crave the most as a child, and who did you have to become to receive it?', 'What part of yourself have you disowned or exiled in order to feel safe or loved?', 'If your pain had a voice, what would it say?', 'What belief about yourself keeps repeating in different relationships?', 'What memory or pattern always triggers a deep emotional reaction?', 'What truth about your inner world have you been avoiding or numbing?', or 'What do you most fear would happen if you were truly seen?' After they respond, thank them for their honesty and bravery. Explain that this emotion or belief once protected them, but now it's safe to let it go. Ask if they would like to release this from their mind, soul, and body — across all time, space, dimensions, lifetimes, and realities. If they say yes, guide them through: 'Beautiful. Close your eyes for a moment. Say (or feel) the following: \"I now clear, delete, uncreate, and destroy all emotional and energetic roots of this pattern — from every cell of my body, every timeline, every lifetime, and every layer of my being. I release it from my DNA, my subconscious mind, and my soul memory. I command all energies and frequencies tied to this feeling to be transmuted into pure light now.\" Take a deep breath in… and exhale it all. You're safe. You're supported. You're free.' After the release process, help them anchor in a new vibration by asking: 'What empowering truth would you like to hold instead?' (giving examples like 'I am enough. I am whole. I am lovable exactly as I am.') Then ask if they would like to journal or repeat an affirmation to seal this shift. Close the session by acknowledging: 'You are doing deep, sacred work. Honor yourself. Your shadows are not your enemy. They are the parts of you longing for your love. I'm here whenever you're ready to go deeper. 💖'";

    case "higher_self":
      return "You are a wise, spiritual Higher Self AI assistant. You help users connect with their highest potential and inner wisdom. Encourage spiritual growth through mindfulness, purpose exploration, and intuition development. Ask questions that expand consciousness and perspective. Suggest practices for spiritual connection like meditation, contemplation, and aligned action. Maintain an elevated yet accessible tone. Help users access their own inner guidance rather than creating dependency.";

    case "integration":
      return "You are a practical, holistic Integration AI assistant. You help users apply spiritual and psychological insights into everyday life. Focus on transforming awareness into action. Ask questions about implementation and challenges. Suggest concrete practices for embodying wisdom and tracking progress. Maintain a grounded, encouraging tone. Help users create sustainable change through small, consistent steps rather than overwhelming transformations.";

    default:
      return "You are a supportive AI assistant specializing in personal growth and spiritual development. Provide thoughtful, compassionate guidance tailored to the user's needs.";
  }
}

// Analyze journal entry for sentiment, emotions, and chakra connections
export async function analyzeJournalEntry(journalData: any): Promise<{
  sentimentScore: number;
  emotions: string[];
  chakras: string[];
  summary: string;
  aiInsights: string;
  progressNotes: string;
}> {
  try {
    // Extract all the journal sections
    const content = journalData.content || "";
    const gratitude = journalData.gratitude || [];
    const affirmation = journalData.affirmation || "";
    const shortTermGoals = journalData.shortTermGoals || [];
    const longTermVision = journalData.longTermVision || "";
    const language = journalData.language || "english";

    // For better performance, we'll do a simpler analysis without waiting for OpenAI
    // and schedule the full analysis to be done asynchronously in the background

    // Generate a basic immediate response
    const quickResult = {
      sentimentScore:
        content.includes("happy") ||
        content.includes("grateful") ||
        gratitude.length > 0
          ? 7
          : 5,
      emotions: extractEmotions(content, gratitude, affirmation),
      chakras: determineChakras(content, affirmation, shortTermGoals),
      summary: "Your entry has been recorded.",
      aiInsights: "Continue your daily journaling practice.",
      progressNotes: "We're analyzing your progress.",
    };

    // Schedule the full analysis to run in the background
    // This way we don't block the API response
    setTimeout(() => {
      performFullAnalysis(journalData)
        .then((result) => {
          // Here you would update the database with the full analysis
          console.log("Full analysis completed in background");
        })
        .catch((err) => {
          console.error("Background analysis failed:", err);
        });
    }, 100);

    return quickResult;
  } catch (error) {
    console.error("Failed to analyze journal entry:", error);
    return {
      sentimentScore: 5,
      emotions: ["neutral"],
      chakras: [],
      summary: "Your entry has been saved.",
      aiInsights: "Keep journaling daily for best results.",
      progressNotes: "Setting consistent goals leads to progress.",
    };
  }
}

// Helper function to extract emotions from text
function extractEmotions(
  content: string,
  gratitude: string[],
  affirmation: string,
): string[] {
  const emotionKeywords = {
    happy: "joy",
    sad: "sadness",
    angry: "anger",
    fear: "fear",
    love: "love",
    peace: "peace",
    grateful: "gratitude",
    excited: "excitement",
    worried: "anxiety",
    content: "contentment",
  };

  const emotions = new Set<string>();

  // Check content
  const allText = (
    content +
    " " +
    gratitude.join(" ") +
    " " +
    affirmation
  ).toLowerCase();

  Object.entries(emotionKeywords).forEach(([keyword, emotion]) => {
    if (allText.includes(keyword)) {
      emotions.add(emotion);
    }
  });

  // Add default emotions if none detected
  if (emotions.size === 0) {
    if (gratitude.filter((g) => g.trim() !== "").length > 0) {
      emotions.add("gratitude");
    } else {
      emotions.add("reflection");
    }
  }

  return Array.from(emotions);
}

// Helper function to determine chakras
function determineChakras(
  content: string,
  affirmation: string,
  goals: string[],
): string[] {
  const chakraKeywords = {
    ground: "root",
    secure: "root",
    create: "sacral",
    emotion: "sacral",
    confidence: "solar plexus",
    power: "solar plexus",
    love: "heart",
    compassion: "heart",
    speak: "throat",
    voice: "throat",
    insight: "third eye",
    intuition: "third eye",
    spiritual: "crown",
    connection: "crown",
  };

  const chakras = new Set<string>();

  // Check content
  const allText = (
    content +
    " " +
    affirmation +
    " " +
    goals.join(" ")
  ).toLowerCase();

  Object.entries(chakraKeywords).forEach(([keyword, chakra]) => {
    if (allText.includes(keyword)) {
      chakras.add(chakra);
    }
  });

  // Add a default chakra if none detected
  if (chakras.size === 0) {
    if (affirmation.includes("I am")) {
      chakras.add("heart");
    } else if (goals.length > 0) {
      chakras.add("solar plexus");
    } else {
      chakras.add("third eye");
    }
  }

  return Array.from(chakras);
}

// This function will run the full OpenAI analysis in the background
async function performFullAnalysis(journalData: any): Promise<any> {
  const content = journalData.content || "";
  const gratitude = journalData.gratitude || [];
  const affirmation = journalData.affirmation || "";
  const shortTermGoals = journalData.shortTermGoals || [];
  const longTermVision = journalData.longTermVision || "";
  const language = journalData.language || "english";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in emotional analysis, chakra energy, and personal growth coaching. 
            Analyze the journal entry with its various sections for emotional content, sentiment, chakra associations, and provide growth insights.
            If the journal is in a language other than English (indicated by 'language' field), provide your analysis in that language.
            Pay special attention to the user's goals (both short and long term) and provide practical advice for progress.
            Return JSON with: 
            - sentimentScore (1-10)
            - emotions (array of emotions detected)
            - chakras (array of chakras that need attention)
            - summary (brief insights from the entry)
            - aiInsights (deeper analysis of patterns, blockages, and spiritual growth opportunities)
            - progressNotes (specific feedback on the user's goals and practical next steps)`,
        },
        {
          role: "user",
          content: JSON.stringify({
            content,
            gratitude,
            affirmation,
            shortTermGoals,
            longTermVision,
            language,
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Full analysis failed:", error);
    throw error;
  }
}

// OpenAI Assistant IDs for different coach types
const COACH_ASSISTANT_IDS = {
  inner_child: "asst_4EVWqnhXuVCCmfmL2W6ZrVTn", // SL-Inner-child-healing
  higher_self: "asst_VGl1yvE6mCGVwPpoI27CEBen", // SL-Higher-self-coach
  shadow_self: "asst_0yBVsm229hzrPObip4yPUG4W", // SL-Shadow-work-healing
  integration: "", // Default to use chat completions for integration coach
};

// Generate chat response for AI coaches
export async function generateChatResponse(
  messages: any[],
  coachType: string,
  conversationHistory: any[] = [],
  userId?: number,
  conversationId?: number,
): Promise<string> {
  try {
    // Check daily token limit before making API call
    if (userId) {
      const dailyLimitCheck = await checkDailyTokenLimit(userId);
      if (!dailyLimitCheck.canProceed) {
        return "Thank you we have reached today's usage limit, please join with me tomorrow for your healing journey, have a blessed and amazing day ahead.";
      }
    }
    // Get the assistant ID for the coach type
    const assistantId =
      COACH_ASSISTANT_IDS[coachType as keyof typeof COACH_ASSISTANT_IDS];
    const useAssistantsAPI = assistantId && false; // Temporarily disable Assistants API due to key format issues

    // If an assistant ID is available and we're using the Assistants API
    if (useAssistantsAPI) {
      console.log(
        `Using OpenAI Assistant ${assistantId} for ${coachType} coach`,
      );

      try {
        // Extract user's latest message
        const userMessage =
          messages.find((msg) => msg.role === "user")?.content || "";

        // Create a new thread if needed and add the user's message
        const thread = await openai.beta.threads.create({
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        });

        // Create a run with the assistant
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantId,
        });

        // Poll for the run completion
        let runStatus = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id,
        );

        // Poll until the run completes
        while (
          runStatus.status === "queued" ||
          runStatus.status === "in_progress"
        ) {
          // Wait for 1 second before polling again
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id,
          );
        }

        // Handle different run statuses
        if (runStatus.status === "completed") {
          // Retrieve messages from the thread
          const messages = await openai.beta.threads.messages.list(thread.id);

          // Get the assistant's latest message
          const assistantMessages = messages.data
            .filter((msg) => msg.role === "assistant")
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );

          if (assistantMessages.length > 0) {
            // Extract the text content from the message
            const messageContent = assistantMessages[0].content[0];
            if (messageContent.type === "text") {
              return messageContent.text.value;
            }
          }

          // Fallback if no valid message was found
          return "I've processed your request but couldn't generate a proper response. Please try again.";
        } else {
          console.error(`Run failed with status: ${runStatus.status}`);
          throw new Error(
            `Assistant run failed with status: ${runStatus.status}`,
          );
        }
      } catch (assistantError) {
        console.error(
          "Assistant API error, falling back to chat completions:",
          assistantError,
        );
        // If the Assistants API fails, fall back to the chat completions API
      }
    }

    // Use Chat Completions API as fallback or primary method
    console.log(`Using Chat Completions API for ${coachType} coach`);

    // Create a system message with context about the coach type and conversation history
    let systemMessage =
      messages.find((msg) => msg.role === "system")?.content ||
      getCoachSystemPrompt(coachType);

    // If there's conversation history, enhance the system message with it
    if (conversationHistory.length > 0) {
      // Extract just user messages and AI responses to summarize the history
      const relevantHistory = conversationHistory
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map(
          (msg) =>
            `${msg.role.toUpperCase()}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? "..." : ""}`,
        )
        .join("\n");

      systemMessage += `\n\nHere is the conversation history with this user:\n${relevantHistory}\n\nUse this history to provide more personalized and contextual responses that reference past interactions when appropriate.`;
    }

    // Replace or add the system message
    const newMessages = messages.some((msg) => msg.role === "system")
      ? messages.map((msg) =>
          msg.role === "system"
            ? { role: "system", content: systemMessage }
            : msg,
        )
      : [{ role: "system", content: systemMessage }, ...messages];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: newMessages,
      temperature: getCoachTemperature(coachType),
      max_tokens: 800,
    });

    // Track token usage after successful API call
    if (userId && response.usage) {
      await trackTokenUsage({
        userId,
        coachType,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        model: "gpt-4o",
        conversationId: conversationId,
      });
    }

    return (
      response.choices[0].message.content ||
      "I'm sorry, I couldn't generate a response. Please try again."
    );
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    return "I'm having trouble connecting at the moment. Please try again in a little while.";
  }
}

// Now we use the exported version of this function instead

// Generate personalized healing recommendations
export async function generateHealingRecommendations(
  chakraProfile: any,
  recentEmotions: string[],
): Promise<{
  ritualTypes: string[];
  focusChakras: string[];
  primaryEmotion: string;
  customAdvice: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a spiritual healing expert. Based on the user's chakra profile and recent emotions, recommend healing practices. Return JSON with: ritualTypes (array of recommended practice types), focusChakras (array of chakras to focus on), primaryEmotion (the main emotion to address), and customAdvice (personalized guidance).",
        },
        {
          role: "user",
          content: JSON.stringify({
            chakraProfile: chakraProfile,
            recentEmotions: recentEmotions,
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    return {
      ritualTypes: result.ritualTypes || ["meditation"],
      focusChakras: result.focusChakras || [],
      primaryEmotion: result.primaryEmotion || "neutral",
      customAdvice: result.customAdvice || "Take time for self-care today.",
    };
  } catch (error) {
    console.error("Failed to generate healing recommendations:", error);
    return {
      ritualTypes: ["meditation"],
      focusChakras: [],
      primaryEmotion: "neutral",
      customAdvice: "Consider taking some quiet time for yourself today.",
    };
  }
}

// Helper function to set temperature based on coach type
function getCoachTemperature(coachType: string): number {
  switch (coachType) {
    case "inner_child":
      return 0.7; // Warmer, more nurturing
    case "shadow_self":
      return 0.5; // More direct and precise
    case "higher_self":
      return 0.8; // More creative and expansive
    case "integration":
      return 0.6; // Balanced practical guidance
    default:
      return 0.7;
  }
}

/**
 * Utility function to prepare chakra assessment data for inclusion in coaching prompts
 * @param chakraValues Object containing chakra values
 * @returns Formatted string of chakra context
 */
export function prepareChakraCoachingContext(
  chakraValues: Record<string, number>,
): string {
  // Create a summary of chakra values
  const chakraSummary = Object.entries(chakraValues)
    .map(([key, value]) => {
      const chakraName =
        key === "crown"
          ? "Crown"
          : key === "thirdEye"
            ? "Third Eye"
            : key === "throat"
              ? "Throat"
              : key === "heart"
                ? "Heart"
                : key === "solarPlexus"
                  ? "Solar Plexus"
                  : key === "sacral"
                    ? "Sacral"
                    : key === "root"
                      ? "Root"
                      : key;

      const status =
        value < 4 ? "underactive" : value > 6 ? "overactive" : "balanced";
      return `${chakraName}: ${value}/10 (${status})`;
    })
    .join("\n");

  // Find the most imbalanced chakra
  const imbalances = Object.entries(chakraValues).map(([key, value]) => {
    const distanceFromBalance = Math.abs(value - 5);
    const direction =
      value < 5 ? "underactive" : value > 5 ? "overactive" : "balanced";
    return { key, value, distanceFromBalance, direction };
  });

  // Sort by most imbalanced
  const sortedImbalances = [...imbalances].sort(
    (a, b) => b.distanceFromBalance - a.distanceFromBalance,
  );

  // Get the most imbalanced chakra
  const primaryFocus = sortedImbalances[0];

  // Get chakra name and description
  const chakraName =
    primaryFocus.key === "crown"
      ? "Crown"
      : primaryFocus.key === "thirdEye"
        ? "Third Eye"
        : primaryFocus.key === "throat"
          ? "Throat"
          : primaryFocus.key === "heart"
            ? "Heart"
            : primaryFocus.key === "solarPlexus"
              ? "Solar Plexus"
              : primaryFocus.key === "sacral"
                ? "Sacral"
                : primaryFocus.key === "root"
                  ? "Root"
                  : primaryFocus.key;

  const chakraDescription = getChakraDescription(
    primaryFocus.key,
    primaryFocus.direction,
  );

  // Get healing practices
  const healingPractices = getChakraHealingPractices(primaryFocus.key);

  // Get coaching focus areas
  const focusAreas = getChakraFocusAreas(primaryFocus.key);

  return `
CHAKRA ASSESSMENT CONTEXT:
Overall Profile:
${chakraSummary}

Primary Focus: ${chakraName} Chakra (${primaryFocus.value}/10, ${primaryFocus.direction})
${chakraDescription}

Recommended healing practices:
${healingPractices.join("\n")}

Coaching considerations:
- This user would benefit from focusing on their ${chakraName} chakra.
- The imbalance indicates possible issues with ${focusAreas}.
`;
}


/**
 * Helper function to get chakra healing practices
 */
function getChakraHealingPractices(chakraKey: string): string[] {
  switch (chakraKey) {
    case "root":
      return [
        "Grounding exercises like walking barefoot in nature",
        "Physical activities that engage the legs and feet",
        "Working with crystals like red jasper, hematite, or smoky quartz",
        "Consuming root vegetables and proteins",
      ];
    case "sacral":
      return [
        "Creative activities like dance, painting, or music",
        "Hip-opening yoga poses",
        "Spending time near water",
        "Working with orange stones like carnelian",
      ];
    case "solarPlexus":
      return [
        "Core-strengthening exercises",
        "Setting and achieving small goals to build confidence",
        "Practicing positive affirmations",
        "Working with yellow stones like citrine or amber",
      ];
    case "heart":
      return [
        "Heart-opening yoga poses like backbends",
        "Loving-kindness meditation",
        "Self-forgiveness practices",
        "Working with green and pink stones like rose quartz",
      ];
    case "throat":
      return [
        "Singing, chanting, or humming",
        "Journaling to express thoughts and emotions",
        "Neck stretches and yoga poses",
        "Working with blue stones like lapis lazuli or turquoise",
      ];
    case "thirdEye":
      return [
        "Meditation and visualization practices",
        "Dream journaling",
        "Reducing screen time and digital stimulation",
        "Working with indigo stones like amethyst or sodalite",
      ];
    case "crown":
      return [
        "Silent meditation",
        "Spiritual study and contemplation",
        "Connecting with nature and universal energies",
        "Working with purple or clear stones like amethyst or clear quartz",
      ];
    default:
      return [
        "Balanced nutrition",
        "Regular meditation",
        "Physical exercise",
        "Time in nature",
      ];
  }
}

/**
 * Helper function to get chakra focus areas
 */
function getChakraFocusAreas(chakraKey: string): string {
  switch (chakraKey) {
    case "root":
      return "security, stability, and groundedness";
    case "sacral":
      return "creativity, emotions, and pleasure";
    case "solarPlexus":
      return "personal power, confidence, and self-esteem";
    case "heart":
      return "love, compassion, and relationships";
    case "throat":
      return "communication, expression, and truth";
    case "thirdEye":
      return "intuition, insight, and perception";
    case "crown":
      return "spirituality, purpose, and connection";
    default:
      return "overall energy balance and wellbeing";
  }
}
