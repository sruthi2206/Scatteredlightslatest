import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon, BookOpen, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Emotion colors
const EMOTION_COLORS = {
  joy: '#38b583',       // Green
  sadness: '#5875dc',   // Blue
  anger: '#f43f5e',     // Red
  fear: '#8b5cf6',      // Purple
  love: '#ec4899',      // Pink
  surprise: '#f59e0b',  // Amber
  guilt: '#6b7280',     // Gray
  shame: '#64748b',     // Slate
  peace: '#0ea5e9',     // Sky
  confusion: '#a16207', // Yellow/Brown
};

// Types
interface EmotionData {
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

interface EmotionEntry {
  id: string;
  date: string;
  source: 'journal' | 'chat' | 'chakra_assessment';
  content: string;
  emotions: EmotionData;
  userId: number;
}

// Helper function to format date 
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

// Helper function to get source icon
const getSourceIcon = (source: string) => {
  switch (source) {
    case 'journal':
      return <BookOpen className="h-4 w-4" />;
    case 'chat':
      return <MessageCircle className="h-4 w-4" />;
    case 'chakra_assessment':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <CalendarIcon className="h-4 w-4" />;
  }
};

// Helper function to get source label
const getSourceLabel = (source: string) => {
  switch (source) {
    case 'journal':
      return 'Journal Entry';
    case 'chat':
      return 'Coach Conversation';
    case 'chakra_assessment':
      return 'Chakra Assessment';
    default:
      return 'Unknown Source';
  }
};

// Helper to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Component to display emotion intensity badges
const EmotionBadges = ({ emotions }: { emotions: EmotionData }) => {
  // Get top 3 emotions
  const topEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, value]) => value > 10); // Only show if intensity > 10%
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {topEmotions.map(([emotion, value]) => (
        <Badge 
          key={emotion}
          variant="outline"
          className="text-xs px-2 py-0"
          style={{ 
            borderColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS],
            color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS],
          }}
        >
          {emotion}: {value}%
        </Badge>
      ))}
    </div>
  );
};

export default function EmotionalJourneyLog() {
  const { user } = useAuth();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  
  // Fetch emotion data 
  const { data: emotionEntries, isLoading, error } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-data'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/emotion-data`);
      if (!res.ok) throw new Error('Failed to fetch emotion data');
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Filter entries by source
  const filteredEntries = selectedSource 
    ? emotionEntries?.filter((entry: EmotionEntry) => entry.source === selectedSource)
    : emotionEntries;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emotion Journey Log</CardTitle>
          <CardDescription>Your emotional insights from journal entries, assessments, and coaching</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emotion Journey Log</CardTitle>
          <CardDescription>Your emotional insights from journal entries, assessments, and coaching</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">
            We couldn't load your emotion logs at this time.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!emotionEntries || emotionEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emotion Journey Log</CardTitle>
          <CardDescription>Your emotional insights from journal entries, assessments, and coaching</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground mb-2">
            No emotion logs available yet. Continue using the journal, chakra assessment, and AI coaches to build your emotional profile.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Journey Log</CardTitle>
        <CardDescription>Your emotional insights from journal entries, assessments, and coaching</CardDescription>
        
        <div className="flex mt-2 space-x-2">
          <Button 
            variant={selectedSource === null ? "default" : "outline"}
            size="sm" 
            onClick={() => setSelectedSource(null)}
          >
            All
          </Button>
          <Button 
            variant={selectedSource === 'journal' ? "default" : "outline"}
            size="sm" 
            onClick={() => setSelectedSource('journal')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Journal
          </Button>
          <Button 
            variant={selectedSource === 'chat' ? "default" : "outline"}
            size="sm" 
            onClick={() => setSelectedSource('chat')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Coaching
          </Button>
          <Button 
            variant={selectedSource === 'chakra_assessment' ? "default" : "outline"}
            size="sm" 
            onClick={() => setSelectedSource('chakra_assessment')}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Chakra
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[400px] overflow-y-auto pr-2">
        <div className="space-y-4">
          {filteredEntries?.slice(0, 20).map((entry: EmotionEntry) => (
            <div 
              key={entry.id} 
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {getSourceIcon(entry.source)}
                  </div>
                  <div>
                    <div className="font-medium">{getSourceLabel(entry.source)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(entry.date)}</div>
                    <EmotionBadges emotions={entry.emotions} />
                  </div>
                </div>
              </div>
              
              {expandedEntry === entry.id && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm mb-3 whitespace-pre-wrap">
                    {entry.content}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Emotion Analysis:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(entry.emotions)
                        .sort((a, b) => b[1] - a[1])
                        .map(([emotion, value]) => (
                          <div key={emotion} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] }}
                            ></div>
                            <div className="text-xs">{emotion}</div>
                            <div className="ml-auto text-xs font-medium">{value}%</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}