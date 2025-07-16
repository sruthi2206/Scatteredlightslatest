import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, BookOpen, MessageCircle, HeartHandshake, ArrowRight, Flame } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Define emotion thresholds for recommendations
const EMOTION_THRESHOLDS = {
  HIGH: 70,  // Above this is considered high intensity
  MEDIUM: 40, // Above this is medium intensity
  LOW: 20,    // Above this is low intensity
};

// Define coach recommendations for different emotions
const COACH_RECOMMENDATIONS = {
  joy: {
    coach: 'higher_self',
    message: 'Channel your positive energy with Higher Self guidance'
  },
  sadness: {
    coach: 'inner_child',
    message: 'Process grief and sadness with gentle Inner Child healing'
  },
  anger: {
    coach: 'shadow_self',
    message: 'Transform anger through Shadow Work integration'
  },
  fear: {
    coach: 'inner_child',
    message: 'Address fears with compassionate Inner Child dialogue'
  },
  love: {
    coach: 'higher_self',
    message: 'Expand your capacity for love with Higher Self wisdom'
  },
  surprise: {
    coach: 'higher_self',
    message: 'Explore unexpected insights with Higher Self guidance'
  },
  guilt: {
    coach: 'shadow_self',
    message: 'Release guilt through Shadow Work exploration'
  },
  shame: {
    coach: 'shadow_self',
    message: 'Transform shame with compassionate Shadow Work'
  },
  peace: {
    coach: 'higher_self',
    message: 'Deepen your inner peace with Higher Self connection'
  },
  confusion: {
    coach: 'higher_self',
    message: 'Find clarity with Higher Self guidance'
  }
};

// Define chakra associations with emotions
const CHAKRA_EMOTIONS = {
  rootChakra: ['fear'],
  sacralChakra: ['guilt', 'shame'],
  solarPlexusChakra: ['anger', 'confusion'],
  heartChakra: ['love', 'joy', 'sadness'],
  throatChakra: ['fear', 'surprise'],
  thirdEyeChakra: ['confusion', 'surprise'],
  crownChakra: ['peace']
};

// Helper function to get coach display name
const getCoachDisplayName = (coachType: string) => {
  switch(coachType) {
    case 'inner-child':
      return 'Inner Child Coach';
    case 'higher-self':
      return 'Higher Self Coach';
    case 'shadow-self':
      return 'Shadow Work Coach';
    default:
      return 'AI Coach';
  }
};

// Helper function to get coach icon
const getCoachIcon = (coachType: string) => {
  switch(coachType) {
    case 'inner-child':
      return <HeartHandshake className="h-5 w-5" />;
    case 'higher-self':
      return <Flame className="h-5 w-5" />;
    case 'shadow-self':
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <MessageCircle className="h-5 w-5" />;
  }
};

// Component to recommend healing paths based on emotional analysis
export default function EmotionalHealingRecommendations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch emotion data
  const { data: emotionData, isLoading: loadingEmotions } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-data'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/emotion-data`);
      if (!res.ok) throw new Error('Failed to fetch emotion data');
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Fetch chakra profile
  const { data: chakraProfile, isLoading: loadingChakra } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/chakra-profile`);
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error('Failed to fetch chakra profile');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching chakra profile:', error);
        return null;
      }
    },
    enabled: !!user,
  });
  
  // Determine dominant emotions and appropriate coaching recommendations
  const getDominantEmotions = () => {
    if (!emotionData || !Array.isArray(emotionData) || emotionData.length === 0) return [];
    
    // Use the most recent 5 entries for analysis
    const recentEntries = emotionData.slice(0, 5);
    
    // Aggregate emotions across recent entries
    const aggregatedEmotions: Record<string, number> = {};
    let totalEntries = 0;
    
    recentEntries.forEach(entry => {
      totalEntries++;
      // Safely handle the emotions object
      if (entry.emotions && typeof entry.emotions === 'object') {
        // Type assertion to Record<string, number>
        const emotions = entry.emotions as Record<string, number>;
        Object.keys(emotions).forEach(emotion => {
          if (!aggregatedEmotions[emotion]) aggregatedEmotions[emotion] = 0;
          aggregatedEmotions[emotion] += emotions[emotion] || 0;
        });
      }
    });
    
    // Calculate average for each emotion
    Object.keys(aggregatedEmotions).forEach(emotion => {
      aggregatedEmotions[emotion] = Math.round(aggregatedEmotions[emotion] / totalEntries);
    });
    
    // Sort emotions by intensity and get top emotions
    return Object.entries(aggregatedEmotions)
      .filter(([_, value]) => value >= EMOTION_THRESHOLDS.MEDIUM) // Only include significant emotions
      .sort((a, b) => b[1] - a[1]) // Sort by intensity
      .slice(0, 3) // Take top 3
      .map(([emotion, value]) => ({ 
        name: emotion, 
        value: value,
        coachType: COACH_RECOMMENDATIONS[emotion as keyof typeof COACH_RECOMMENDATIONS]?.coach || 'higher-self',
        message: COACH_RECOMMENDATIONS[emotion as keyof typeof COACH_RECOMMENDATIONS]?.message || 'Explore your emotions with guidance'
      }));
  };
  
  // Determine chakra focus areas based on emotions and chakra profile
  const getChakraRecommendations = () => {
    if (!chakraProfile || !emotionData || !Array.isArray(emotionData) || emotionData.length === 0) return [];
    
    // Get dominant emotions
    const dominantEmotions = getDominantEmotions().map(e => e.name);
    
    // Calculate chakra recommendations based on emotions and current chakra values
    const recommendations: { chakra: string, value: number, priority: number, emotions: string[] }[] = [];
    
    // Map chakra profile to recommendations
    const chakraValues = {
      rootChakra: chakraProfile.rootChakra,
      sacralChakra: chakraProfile.sacralChakra,
      solarPlexusChakra: chakraProfile.solarPlexusChakra,
      heartChakra: chakraProfile.heartChakra,
      throatChakra: chakraProfile.throatChakra,
      thirdEyeChakra: chakraProfile.thirdEyeChakra,
      crownChakra: chakraProfile.crownChakra,
    };
    
    // Generate recommendations based on:
    // 1. Low chakra values (below 6 is considered in need of attention)
    // 2. Connection to dominant emotions
    Object.entries(chakraValues).forEach(([chakra, value]) => {
      const priority = 10 - Math.min(value, 10); // Invert scale: lower value = higher priority
      
      // Get emotions associated with this chakra
      const associatedEmotions = CHAKRA_EMOTIONS[chakra as keyof typeof CHAKRA_EMOTIONS] || [];
      
      // Check if any dominant emotions are associated with this chakra
      const matchingEmotions = associatedEmotions.filter(emotion => dominantEmotions.includes(emotion));
      
      // Add to recommendations if:
      // - Chakra value is low (< 6) OR
      // - Chakra is associated with current dominant emotions
      if (value < 6 || matchingEmotions.length > 0) {
        recommendations.push({
          chakra,
          value, 
          priority: priority + (matchingEmotions.length * 2), // Boost priority if emotions match
          emotions: matchingEmotions
        });
      }
    });
    
    // Sort by priority (highest first) and take top 2
    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 2);
  };
  
  // Format chakra display name
  const formatChakraName = (chakraKey: string) => {
    if (chakraKey === 'rootChakra') return 'Root Chakra';
    if (chakraKey === 'sacralChakra') return 'Sacral Chakra';
    if (chakraKey === 'solarPlexusChakra') return 'Solar Plexus Chakra';
    if (chakraKey === 'heartChakra') return 'Heart Chakra';
    if (chakraKey === 'throatChakra') return 'Throat Chakra';
    if (chakraKey === 'thirdEyeChakra') return 'Third Eye Chakra';
    if (chakraKey === 'crownChakra') return 'Crown Chakra';
    return chakraKey;
  };
  
  // Get chakra color
  const getChakraColor = (chakraKey: string) => {
    if (chakraKey === 'rootChakra') return 'bg-red-500';
    if (chakraKey === 'sacralChakra') return 'bg-orange-500';
    if (chakraKey === 'solarPlexusChakra') return 'bg-yellow-500';
    if (chakraKey === 'heartChakra') return 'bg-green-500';
    if (chakraKey === 'throatChakra') return 'bg-blue-400';
    if (chakraKey === 'thirdEyeChakra') return 'bg-indigo-500';
    if (chakraKey === 'crownChakra') return 'bg-purple-500';
    return 'bg-gray-500';
  };
  
  // Loading state
  if (loadingEmotions || loadingChakra) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Healing Recommendations</CardTitle>
          <CardDescription>Loading personalized guidance based on your emotional patterns...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  // No data yet state
  if (!emotionData || !Array.isArray(emotionData) || emotionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Healing Recommendations</CardTitle>
          <CardDescription>Personalized guidance based on your emotional patterns</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            Complete more activities to receive personalized healing recommendations based on your emotional patterns.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setLocation('/journal')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Journal
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setLocation('/chakra-assessment')}
            >
              <Flame className="h-4 w-4 mr-2" />
              Chakra Assessment
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // Choose a coach type based on most recent emotion data if available
                // or default to a random coach to provide variety
                const coaches = ['inner_child', 'higher_self', 'shadow_self'];
                const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
                setLocation(`/coach/${randomCoach}`);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Coaches
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get recommendations
  const dominantEmotions = getDominantEmotions();
  const chakraRecommendations = getChakraRecommendations();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Healing Recommendations</CardTitle>
        <CardDescription>Personalized guidance based on your emotional patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coach Recommendations Based on Emotions */}
        <div>
          <h3 className="text-lg font-medium mb-3">Recommended Coaching</h3>
          <div className="space-y-4">
            {dominantEmotions.map((emotion, idx) => (
              <div key={idx} className="flex gap-3 items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-primary/10">
                  {getCoachIcon(emotion.coachType)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{getCoachDisplayName(emotion.coachType)}</h4>
                    <Badge variant="outline" className="text-xs ml-1">
                      {emotion.name}: {emotion.value}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{emotion.message}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-primary" 
                  onClick={() => setLocation(`/coach/${emotion.coachType}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chakra Focus Areas */}
        {chakraRecommendations.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-3">Chakra Focus Areas</h3>
              <div className="space-y-3">
                {chakraRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getChakraColor(rec.chakra)} text-white font-medium`}>
                      {rec.value}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{formatChakraName(rec.chakra)}</h4>
                      <div className="text-sm text-muted-foreground">
                        {rec.emotions.length > 0 
                          ? `Associated with ${rec.emotions.join(', ')}`
                          : 'Needs balancing'}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-primary" 
                      onClick={() => setLocation('/healing-rituals')}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Journal Reflection Prompt */}
        <Separator />
        <div>
          <h3 className="text-lg font-medium mb-2">Journal Reflection</h3>
          <Card className="bg-muted/50 border-muted">
            <CardContent className="p-4">
              <p className="italic text-sm text-muted-foreground mb-3">
                {dominantEmotions.length > 0 
                  ? `Recent analysis shows ${dominantEmotions[0].name} is present in your emotional landscape. Reflect on how this might be influencing your daily experience.`
                  : 'Take time to reflect on your emotional journey and note any patterns emerging.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/journal')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Open Journal
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}