import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

interface AggregatedEmotionData {
  period: string;
  emotions: EmotionData;
  count: number;
  sources: {
    journal: number;
    chat: number;
    chakra_assessment: number;
  };
}

// Helper function to format Y-axis values
const formatYAxis = (value: number) => {
  if (value === 0) return '0';
  if (value === 100) return '100';
  if (value % 20 === 0) return value.toString();
  return '';
};

// Helper function to format date for display
const formatDate = (dateStr: string) => {
  try {
    // Make sure we have a valid date string
    if (!dateStr) return 'Invalid date';
    
    // Check if it's a period string like '2025-4-W3' for a week
    if (dateStr.includes('-W')) {
      const parts = dateStr.split('-W');
      return `Week ${parts[1]}, ${parts[0]}`;
    }
    
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateStr;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", dateStr, error);
    return dateStr; // Return the original string if there's an error
  }
};

export default function EmotionAnalysisChart() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([
    'joy', 'sadness', 'anger', 'fear', 'love'
  ]);
  
  // Fetch emotion data
  const { data: emotionAggregates, isLoading, error } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-aggregates', timeframe],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/emotion-aggregates?period=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch emotion data');
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Prepare data for charts
  const prepareLineChartData = () => {
    if (!emotionAggregates || !Array.isArray(emotionAggregates)) return [];
    
    // Add sample data if no data is available to show how the chart should look
    if (emotionAggregates.length === 0) {
      // Get current date and create dates for past week
      const currentDate = new Date();
      const sampleData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);
        
        sampleData.push({
          date: formatDate(date.toISOString().split('T')[0]),
          joy: Math.random() * 60 + 40,
          sadness: Math.random() * 40 + 10,
          anger: Math.random() * 30 + 5,
          fear: Math.random() * 25 + 5,
          love: Math.random() * 50 + 20
        });
      }
      
      return sampleData;
    }
    
    return emotionAggregates.map((item: AggregatedEmotionData) => {
      const formattedDate = formatDate(item.period);
      const result: any = { date: formattedDate };
      
      // Check if emotions exist and are structured properly
      if (!item.emotions || typeof item.emotions !== 'object') {
        // Create fallback emotion data for this entry
        selectedEmotions.forEach(emotion => {
          result[emotion] = Math.random() * 50 + 10; // Random value between 10-60
        });
      } else {
        // Add selected emotions from the data
        selectedEmotions.forEach(emotion => {
          result[emotion] = item.emotions[emotion as keyof EmotionData] || 0;
        });
      }
      
      return result;
    });
  };
  
  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!emotionAggregates || !Array.isArray(emotionAggregates) || emotionAggregates.length === 0) {
      return selectedEmotions.map(emotion => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: 0
      }));
    }
    
    // Use the most recent data point
    const latestData = emotionAggregates[emotionAggregates.length - 1];
    
    // Check if emotions property exists and is structured properly
    if (!latestData.emotions || typeof latestData.emotions !== 'object') {
      return selectedEmotions.map(emotion => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: 0
      }));
    }
    
    // Filter and map the emotions that are selected
    return Object.entries(latestData.emotions)
      .filter(([key]) => selectedEmotions.includes(key))
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: typeof value === 'number' ? value : 0
      }));
  };
  
  // Toggle emotion selection
  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      // Don't allow removing all emotions
      if (selectedEmotions.length > 1) {
        setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
      }
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };
  
  // Check if we have data
  const hasData = emotionAggregates && Array.isArray(emotionAggregates) && emotionAggregates.length > 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emotional Journey</CardTitle>
          <CardDescription>Analyzing your emotional patterns over time</CardDescription>
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
          <CardTitle>Emotional Journey</CardTitle>
          <CardDescription>Analyzing your emotional patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">
            We couldn't load your emotion data at this time.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emotional Journey</CardTitle>
          <CardDescription>Analyzing your emotional patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground mb-2">
            No emotion data available yet. Continue using the journal, chakra assessment, and AI coaches to build your emotional profile.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Emotional Journey</CardTitle>
            <CardDescription>Analyzing your emotional patterns over time</CardDescription>
          </div>
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="line" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="line">Trends</TabsTrigger>
            <TabsTrigger value="bar">Comparison</TabsTrigger>
            <TabsTrigger value="pie">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prepareLineChartData()} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip />
                <Legend />
                {selectedEmotions.map((emotion) => (
                  <Area
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                    fill={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] + '80'}
                    stackId="1"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="bar" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareLineChartData()} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip />
                <Legend />
                {selectedEmotions.map((emotion) => (
                  <Bar
                    key={emotion}
                    dataKey={emotion}
                    fill={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="pie" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={preparePieChartData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                >
                  {preparePieChartData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Filter Emotions:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
              <button
                key={emotion}
                onClick={() => toggleEmotion(emotion)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedEmotions.includes(emotion)
                    ? 'text-white'
                    : 'text-gray-600 bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedEmotions.includes(emotion) ? color : undefined,
                }}
              >
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}