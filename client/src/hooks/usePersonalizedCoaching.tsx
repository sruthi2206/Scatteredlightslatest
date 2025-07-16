import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export interface PersonalizationData {
  userJourney: {
    daysActive: number;
    consistencyScore: number;
    achievements: string[];
    growthAreas: string[];
  };
  emotionalState: {
    recentMood: string;
    dominantEmotions: string[];
    recurringThemes: string[];
  };
  chakraInsights?: {
    primaryImbalance: string;
    strongestChakra: string;
    overallBalance: number;
  };
  conversationHistory: {
    sessionCount: number;
    lastTopics: string[];
    breakthroughs: string[];
    currentChallenges: string[];
  };
}

export function usePersonalizedCoaching(coachType: string) {
  const { user } = useAuth();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);

  // Fetch user's chakra profile
  const { data: chakraProfile } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetch(`/api/users/${user.id}/chakra-profile`);
      if (!res.ok) return null;
      return await res.json();
    },
    enabled: !!user,
  });

  // Fetch user's recent journal entries
  const { data: journalEntries } = useQuery({
    queryKey: ['/api/users', user?.id, 'journal-entries'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/journal-entries`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!user,
  });

  // Fetch coach conversations
  const { data: conversations } = useQuery({
    queryKey: [`/api/users/${user?.id}/coach-conversations`, { coachType }],
    queryFn: async ({ queryKey }) => {
      if (!user) return [];
      const baseUrl = queryKey[0] as string;
      const params = queryKey[1] as { coachType: string };
      const fullUrl = `${baseUrl}?coachType=${params.coachType}`;
      
      const response = await fetch(fullUrl, { credentials: "include" });
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!user,
  });

  // Process data into personalization insights
  useEffect(() => {
    if (!user) return;

    const calculateDaysActive = () => {
      const joinDate = new Date(user.createdAt || Date.now());
      const now = new Date();
      return Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const analyzeJournalData = () => {
      if (!journalEntries || journalEntries.length === 0) {
        return {
          recentMood: "neutral",
          dominantEmotions: [],
          recurringThemes: [],
          consistencyScore: 0
        };
      }

      // Analyze recent entries for emotional patterns
      const recentEntries = journalEntries.slice(0, 10);
      const allContent = recentEntries.map((entry: any) => entry.content || "").join(" ").toLowerCase();
      const allGratitude = recentEntries.flatMap((entry: any) => entry.gratitude || []).join(" ").toLowerCase();

      // Simple emotion detection
      const positiveWords = ["happy", "grateful", "peaceful", "joy", "love", "excited", "calm"];
      const challengingWords = ["sad", "angry", "frustrated", "anxious", "worried", "stressed"];
      
      const positiveCount = positiveWords.filter(word => 
        allContent.includes(word) || allGratitude.includes(word)
      ).length;
      const challengingCount = challengingWords.filter(word => allContent.includes(word)).length;

      let recentMood = "neutral";
      if (positiveCount > challengingCount + 1) recentMood = "positive";
      else if (challengingCount > positiveCount + 1) recentMood = "challenging";

      const dominantEmotions: string[] = [];
      if (positiveCount > 2) dominantEmotions.push("gratitude", "joy");
      if (challengingCount > 2) dominantEmotions.push("processing challenges");
      if (allContent.includes("meditation") || allContent.includes("spiritual")) {
        dominantEmotions.push("spiritual seeking");
      }

      // Theme analysis
      const themes: string[] = [];
      if (allContent.includes("relationship")) themes.push("relationships");
      if (allContent.includes("work") || allContent.includes("job")) themes.push("career");
      if (allContent.includes("family")) themes.push("family dynamics");
      if (allContent.includes("goal") || allContent.includes("dream")) themes.push("personal goals");

      // Consistency calculation
      const expectedEntries = Math.min(calculateDaysActive(), 30);
      const consistencyScore = Math.min(Math.round((journalEntries.length / Math.max(expectedEntries, 1)) * 100), 100);

      return {
        recentMood,
        dominantEmotions,
        recurringThemes: themes,
        consistencyScore
      };
    };

    const analyzeChakraData = () => {
      if (!chakraProfile) return undefined;

      const chakraValues = {
        root: chakraProfile.rootChakra,
        sacral: chakraProfile.sacralChakra,
        solarPlexus: chakraProfile.solarPlexusChakra,
        heart: chakraProfile.heartChakra,
        throat: chakraProfile.throatChakra,
        thirdEye: chakraProfile.thirdEyeChakra,
        crown: chakraProfile.crownChakra
      };

      const chakraNames = {
        root: "Root Chakra",
        sacral: "Sacral Chakra",
        solarPlexus: "Solar Plexus Chakra",
        heart: "Heart Chakra",
        throat: "Throat Chakra",
        thirdEye: "Third Eye Chakra",
        crown: "Crown Chakra"
      };

      const entries = Object.entries(chakraValues);
      const strongest = entries.reduce((a, b) => chakraValues[a[0] as keyof typeof chakraValues] > chakraValues[b[0] as keyof typeof chakraValues] ? a : b);
      const weakest = entries.reduce((a, b) => chakraValues[a[0] as keyof typeof chakraValues] < chakraValues[b[0] as keyof typeof chakraValues] ? a : b);
      
      const average = Object.values(chakraValues).reduce((a, b) => a + b, 0) / 7;

      return {
        primaryImbalance: chakraNames[weakest[0] as keyof typeof chakraNames],
        strongestChakra: chakraNames[strongest[0] as keyof typeof chakraNames],
        overallBalance: Math.round(average * 10)
      };
    };

    const analyzeConversationData = () => {
      if (!conversations || conversations.length === 0) {
        return {
          sessionCount: 0,
          lastTopics: [],
          breakthroughs: [],
          currentChallenges: []
        };
      }

      const sessionCount = conversations.length;
      const allMessages = conversations.flatMap((conv: any) => conv.messages || []);
      const userMessages = allMessages.filter((msg: any) => msg.role === "user");

      const topics: string[] = [];
      const challenges: string[] = [];
      const breakthroughs: string[] = [];

      userMessages.forEach((msg: any) => {
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
    };

    const journalAnalysis = analyzeJournalData();
    const chakraAnalysis = analyzeChakraData();
    const conversationAnalysis = analyzeConversationData();
    const daysActive = calculateDaysActive();

    // Generate achievements based on activity
    const achievements = [];
    if (journalEntries && journalEntries.length > 5) achievements.push("committed journalist");
    if (conversationAnalysis.sessionCount > 3) achievements.push("active in coaching");
    if (journalAnalysis.consistencyScore > 70) achievements.push("highly consistent practice");
    if (daysActive > 30) achievements.push("30+ days on healing journey");

    // Determine growth areas
    const growthAreas = [];
    if (!journalEntries || journalEntries.length === 0) growthAreas.push("establishing journaling practice");
    if (conversationAnalysis.sessionCount === 0) growthAreas.push("beginning coaching conversations");
    if (journalAnalysis.consistencyScore < 30) growthAreas.push("building consistency");

    setPersonalizationData({
      userJourney: {
        daysActive,
        consistencyScore: journalAnalysis.consistencyScore,
        achievements: achievements.slice(0, 3),
        growthAreas: growthAreas.slice(0, 3)
      },
      emotionalState: {
        recentMood: journalAnalysis.recentMood,
        dominantEmotions: journalAnalysis.dominantEmotions,
        recurringThemes: journalAnalysis.recurringThemes
      },
      chakraInsights: chakraAnalysis,
      conversationHistory: conversationAnalysis
    });

  }, [user, journalEntries, chakraProfile, conversations]);

  return {
    personalizationData,
    isLoading: !personalizationData,
    chakraProfile,
    journalEntries,
    conversations
  };
}