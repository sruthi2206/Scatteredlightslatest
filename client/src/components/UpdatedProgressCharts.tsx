import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from "recharts";
import { chakras } from "@/lib/chakras";
import { emotions, emotionColors } from "@/lib/emotions";
import EmotionalHealingRecommendations from "@/components/EmotionalHealingRecommendations";
import { format, subDays } from "date-fns";

interface ProgressChartsProps {
  journalEntries?: any[];
  emotionTrackings?: any[];
  chakraProfile?: any;
}

// Define emotion colors for consistency
const EMOTION_COLORS: Record<string, string> = {
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

export default function ProgressCharts({ journalEntries = [], emotionTrackings = [], chakraProfile }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const { user } = useAuth();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([
    'joy', 'sadness', 'anger', 'fear', 'love'
  ]);
  
  // Fetch advanced emotion data from API
  const { data: emotionAggregates, isLoading: loadingEmotionAggregates } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-aggregates', timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'],
    queryFn: async () => {
      if (!user) return [];
      const period = timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month';
      const res = await fetch(`/api/users/${user.id}/emotion-aggregates?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch emotion data');
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Fetch detailed emotion entries
  const { data: emotionEntries, isLoading: loadingEmotionEntries } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-data'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/emotion-data`);
      if (!res.ok) throw new Error('Failed to fetch emotion data');
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Generate dates for the selected time range
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    const daysToGoBack = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    
    for (let i = daysToGoBack - 1; i >= 0; i--) {
      const date = subDays(today, i);
      dates.push({
        date,
        formatted: format(date, timeRange === "year" ? "MMM" : "MMM dd"),
        key: format(date, "yyyy-MM-dd")
      });
    }
    
    return dates;
  };
  
  // Aggregate emotion data by date
  const getEmotionData = () => {
    const dates = getDates();
    const emotionsByDate: Record<string, { emotion: string; intensity: number }[]> = {};
    
    // Group emotions by date
    emotionTrackings.forEach(tracking => {
      const date = format(new Date(tracking.createdAt), "yyyy-MM-dd");
      if (!emotionsByDate[date]) {
        emotionsByDate[date] = [];
      }
      emotionsByDate[date].push({
        emotion: tracking.emotion,
        intensity: tracking.intensity
      });
    });
    
    // Map to expected data format
    return dates.map(date => {
      const dayEmotions = emotionsByDate[date.key] || [];
      const avgIntensity = dayEmotions.length > 0
        ? dayEmotions.reduce((sum, e) => sum + e.intensity, 0) / dayEmotions.length
        : 0;
      
      return {
        date: date.formatted,
        intensity: avgIntensity,
        // Most frequent emotion of the day
        primaryEmotion: dayEmotions.length > 0
          ? dayEmotions.reduce((acc: any, curr) => {
              const count = acc.emotions[curr.emotion] || 0;
              acc.emotions[curr.emotion] = count + 1;
              if (count + 1 > acc.maxCount) {
                acc.maxCount = count + 1;
                acc.maxEmotion = curr.emotion;
              }
              return acc;
            }, { emotions: {}, maxCount: 0, maxEmotion: "" }).maxEmotion
          : ""
      };
    });
  };
  
  // Get sentiment data from journal entries
  const getSentimentData = () => {
    const dates = getDates();
    const sentimentsByDate: Record<string, number[]> = {};
    
    // Group sentiments by date
    journalEntries.forEach(entry => {
      const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
      if (!sentimentsByDate[date]) {
        sentimentsByDate[date] = [];
      }
      sentimentsByDate[date].push(entry.sentimentScore);
    });
    
    // Map to expected data format
    return dates.map(date => {
      const daySentiments = sentimentsByDate[date.key] || [];
      const avgSentiment = daySentiments.length > 0
        ? daySentiments.reduce((sum, score) => sum + score, 0) / daySentiments.length
        : 0;
      
      return {
        date: date.formatted,
        sentiment: avgSentiment
      };
    });
  };
  
  // Get emotion distribution
  const getEmotionDistribution = () => {
    const emotionCount: Record<string, number> = {};
    
    emotionTrackings.forEach(tracking => {
      emotionCount[tracking.emotion] = (emotionCount[tracking.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCount).map(([emotion, count]) => ({
      name: emotion,
      value: count
    }));
  };
  
  // Get chakra data for radar chart
  const getChakraData = () => {
    if (!chakraProfile) return [];
    
    return [
      { subject: "Root", value: chakraProfile.rootChakra, fullMark: 10 },
      { subject: "Sacral", value: chakraProfile.sacralChakra, fullMark: 10 },
      { subject: "Solar Plexus", value: chakraProfile.solarPlexusChakra, fullMark: 10 },
      { subject: "Heart", value: chakraProfile.heartChakra, fullMark: 10 },
      { subject: "Throat", value: chakraProfile.throatChakra, fullMark: 10 },
      { subject: "Third Eye", value: chakraProfile.thirdEyeChakra, fullMark: 10 },
      { subject: "Crown", value: chakraProfile.crownChakra, fullMark: 10 }
    ];
  };
  
  // Get tags from journal entries
  const getJournalTags = () => {
    const emotionTags: Record<string, number> = {};
    const chakraTags: Record<string, number> = {};
    
    journalEntries.forEach(entry => {
      // Process emotion tags
      if (entry.emotionTags) {
        entry.emotionTags.forEach((tag: string) => {
          emotionTags[tag] = (emotionTags[tag] || 0) + 1;
        });
      }
      
      // Process chakra tags
      if (entry.chakraTags) {
        entry.chakraTags.forEach((tag: string) => {
          chakraTags[tag] = (chakraTags[tag] || 0) + 1;
        });
      }
    });
    
    return {
      emotionTags: Object.entries(emotionTags)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value })),
      chakraTags: Object.entries(chakraTags)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    };
  };
  
  // Chart data
  const emotionData = getEmotionData();
  const sentimentData = getSentimentData();
  const emotionDistribution = getEmotionDistribution();
  const chakraData = getChakraData();
  const { emotionTags, chakraTags } = getJournalTags();
  
  // Get chakra color by name
  const getChakraColor = (chakraName: string) => {
    const chakraKey = chakraName.toLowerCase();
    const chakra = chakras.find(c => c.key === chakraKey || c.name.toLowerCase() === chakraName.toLowerCase());
    return chakra?.color || "#888";
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!chakraProfile || journalEntries.length === 0 || emotionTrackings.length === 0) {
      return 0;
    }
    
    // Simple average of chakra values as one measure
    const chakraSum = [
      chakraProfile.rootChakra,
      chakraProfile.sacralChakra,
      chakraProfile.solarPlexusChakra,
      chakraProfile.heartChakra,
      chakraProfile.throatChakra,
      chakraProfile.thirdEyeChakra,
      chakraProfile.crownChakra
    ].reduce((sum, val) => sum + val, 0);
    
    const chakraAvg = chakraSum / 7;
    
    // Recent sentiment trend
    const recentSentiments = journalEntries
      .slice(0, 5)
      .map(entry => entry.sentimentScore)
      .reduce((sum, val) => sum + val, 0) / Math.min(5, journalEntries.length);
    
    // Combine for overall progress (simple algorithm)
    return Math.round(((chakraAvg / 10) * 0.5 + (recentSentiments / 10) * 0.5) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Your Healing Journey</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Visualize your progress and discover patterns in your emotional and spiritual development.
        </p>
      </div>
      
      {/* Time Range Selection */}
      <div className="flex justify-center mb-4">
        <Tabs defaultValue="week" value={timeRange} onValueChange={(value) => setTimeRange(value as "week" | "month" | "year")}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Your healing journey at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#483D8B"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * calculateOverallProgress()) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{calculateOverallProgress()}%</span>
                  </div>
                </div>
                <p className="mt-4 text-neutral-600">Overall Healing Progress</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Your Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Journal Entries</span>
                    <span className="font-medium">{journalEntries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Emotions Tracked</span>
                    <span className="font-medium">{emotionTrackings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Avg Sentiment</span>
                    <span className="font-medium">
                      {journalEntries.length > 0 
                        ? (journalEntries.reduce((sum, entry) => sum + entry.sentimentScore, 0) / journalEntries.length).toFixed(1)
                        : "N/A"}
                      /10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Chakra Balance</span>
                    <span className="font-medium">
                      {chakraProfile
                        ? (([
                            chakraProfile.rootChakra,
                            chakraProfile.sacralChakra,
                            chakraProfile.solarPlexusChakra,
                            chakraProfile.heartChakra,
                            chakraProfile.throatChakra,
                            chakraProfile.thirdEyeChakra,
                            chakraProfile.crownChakra
                          ].reduce((sum, val) => sum + val, 0) / 7).toFixed(1))
                        : "N/A"}
                      /10
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Areas of Growth</h3>
                <div className="space-y-2">
                  {chakraProfile && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600">Self-Awareness</span>
                          <span className="font-medium">+15%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#483D8B] rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600">Emotional Balance</span>
                          <span className="font-medium">+8%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#008080] rounded-full" style={{ width: "58%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600">Inner Peace</span>
                          <span className="font-medium">+12%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#7DF9FF] rounded-full" style={{ width: "72%" }}></div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!chakraProfile && (
                    <div className="text-sm text-neutral-500 text-center py-4">
                      Complete your chakra assessment to see growth areas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Journey Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Emotional Journey</CardTitle>
                  <CardDescription>
                    How your emotions have changed over time
                  </CardDescription>
                </div>
                <Tabs 
                  defaultValue="day" 
                  value={timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'} 
                  className="h-7"
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="day" className="text-xs h-7 px-2" onClick={() => setTimeRange('week')}>Daily</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs h-7 px-2" onClick={() => setTimeRange('month')}>Weekly</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs h-7 px-2" onClick={() => setTimeRange('year')}>Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loadingEmotionAggregates ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : emotionAggregates && emotionAggregates.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={emotionAggregates.map((item: any) => {
                      // Format date for display
                      const date = new Date(item.period);
                      const formattedDate = timeRange === 'week' 
                        ? format(date, 'MMM d') 
                        : timeRange === 'month' 
                          ? `Week ${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`
                          : format(date, 'MMM yyyy');
                      
                      // Create result object with all selected emotions
                      const result: any = { date: formattedDate };
                      selectedEmotions.forEach(emotion => {
                        result[emotion] = item.emotions[emotion] || 0;
                      });
                      
                      return result;
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 shadow-md rounded-md border border-neutral-200">
                              <p className="font-medium mb-2">{label}</p>
                              <div className="space-y-1.5">
                                {payload.map((entry: any) => (
                                  <div key={entry.name} className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-sm capitalize">{entry.name}:</span>
                                    <span className="text-sm font-medium">{entry.value}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      formatter={(value) => <span className="text-xs capitalize">{value}</span>} 
                      iconSize={8}
                    />
                    {selectedEmotions.map((emotion) => (
                      <Area
                        key={emotion}
                        type="monotone"
                        dataKey={emotion}
                        stroke={EMOTION_COLORS[emotion]}
                        fill={EMOTION_COLORS[emotion] + '30'}
                        activeDot={{ r: 6 }}
                        stackId="1"
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                  <p className="mb-2">No emotion data available</p>
                  <p className="text-sm text-center max-w-md mb-2">
                    Use the journal, chakra assessment, and AI coaches to build your emotional profile.
                  </p>
                </div>
              )}
            </CardContent>
            <div className="px-6 pb-4">
              <div className="text-sm font-medium mb-2">Filter Emotions:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                  <button
                    key={emotion}
                    onClick={() => {
                      if (selectedEmotions.includes(emotion)) {
                        // Don't allow removing all emotions
                        if (selectedEmotions.length > 1) {
                          setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
                        }
                      } else {
                        setSelectedEmotions([...selectedEmotions, emotion]);
                      }
                    }}
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
          </Card>
        </motion.div>
        
        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Chakra Balance</CardTitle>
              <CardDescription>
                Your energy centers and their current state
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chakraProfile ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getChakraData()}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#666" }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={{ fill: "#666" }} />
                    <Radar
                      name="Chakra Balance"
                      dataKey="value"
                      stroke="#7DF9FF"
                      fill="#7DF9FF"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                  <p className="mb-2">No chakra data available</p>
                  <Button variant="outline" size="sm">
                    Take Chakra Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Journal Sentiment Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Journal Sentiment</CardTitle>
              <CardDescription>
                Emotional tone of your journal entries over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {journalEntries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm">
                                Sentiment: <span className="font-medium">{Number(payload[0].value).toFixed(1)}</span>/10
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sentiment"
                      stroke="#008080"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#008080" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                  <p className="mb-2">No journal entries available</p>
                  <Button variant="outline" size="sm">
                    Start Journaling
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Journal Themes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Journal Themes</CardTitle>
              <CardDescription>
                Common themes identified in your journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Emotional Themes</h4>
                    {emotionTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {emotionTags.map((tag, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            {tag.name} ({tag.value})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">No emotion themes detected yet</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Chakra Themes</h4>
                    {chakraTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {chakraTags.map((tag, index) => {
                          const color = getChakraColor(tag.name);
                          return (
                            <div
                              key={index}
                              className="px-3 py-1 rounded-full text-xs"
                              style={{ backgroundColor: `${color}30`, color }}
                            >
                              {tag.name} ({tag.value})
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-neutral-500">No chakra themes detected yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[240px] flex items-center justify-center">
                  <p className="text-neutral-500">No journal entries available for analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Personalized Emotional Healing Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <EmotionalHealingRecommendations />
      </motion.div>
    </div>
  );
}