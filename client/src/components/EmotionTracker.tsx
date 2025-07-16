import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { emotions, emotionColors, emotionWheelStructure } from "@/lib/emotions";

interface EmotionTrackerProps {
  emotionTrackings?: any[];
  userId: number;
}

export default function EmotionTracker({ emotionTrackings = [], userId }: EmotionTrackerProps) {
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation for saving emotion tracking
  const saveEmotionMutation = useMutation({
    mutationFn: async (data: { emotion: string; intensity: number; note: string; userId: number }) => {
      const response = await apiRequest("POST", "/api/emotion-tracking", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/emotion-tracking`] });
      toast({
        title: "Emotion Recorded",
        description: "Your emotional state has been saved.",
      });
      setSelectedEmotion("");
      setIntensity(5);
      setNote("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your emotion. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle save emotion
  const handleSaveEmotion = () => {
    if (!selectedEmotion) {
      toast({
        title: "Select an Emotion",
        description: "Please select an emotion before saving.",
        variant: "destructive",
      });
      return;
    }
    
    saveEmotionMutation.mutate({
      emotion: selectedEmotion,
      intensity,
      note,
      userId
    });
  };
  
  // Process emotion data for charts
  const getEmotionDistributionData = () => {
    const emotionCounts: Record<string, number> = {};
    
    emotionTrackings.forEach(tracking => {
      emotionCounts[tracking.emotion] = (emotionCounts[tracking.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const getEmotionTimelineData = () => {
    const last7Trackings = [...emotionTrackings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7)
      .reverse();
    
    return last7Trackings.map(tracking => ({
      date: new Date(tracking.createdAt).toLocaleDateString(),
      intensity: tracking.intensity,
      emotion: tracking.emotion
    }));
  };
  
  const distributionData = getEmotionDistributionData();
  const timelineData = getEmotionTimelineData();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Emotional Mapping</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Track and visualize your emotional patterns to gain insights into your inner landscape.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotion Wheel */}
        <Card>
          <CardHeader>
            <CardTitle>Emotion Wheel</CardTitle>
            <CardDescription>
              Select the emotion you're experiencing right now
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="relative w-[320px] h-[320px]">
              {emotionWheelStructure.map((ring, ringIndex) => (
                <div key={`ring-${ringIndex}`} className="absolute inset-0">
                  {ring.emotions.map((emotion, index) => {
                    const segmentAngle = 360 / ring.emotions.length;
                    const startAngle = index * segmentAngle;
                    const endAngle = (index + 1) * segmentAngle;
                    const innerRadius = ring.level * 80; // Scale the rings
                    const outerRadius = (ring.level + 1) * 80;
                    
                    // Convert angles to radians for calculations
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);
                    const midRad = (startRad + endRad) / 2;
                    
                    // Calculate label position
                    const labelRadius = (innerRadius + outerRadius) / 2;
                    const labelX = 160 + labelRadius * Math.cos(midRad);
                    const labelY = 160 + labelRadius * Math.sin(midRad);
                    
                    // SVG path for the segment
                    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                    
                    const innerX1 = 160 + innerRadius * Math.cos(startRad);
                    const innerY1 = 160 + innerRadius * Math.sin(startRad);
                    const innerX2 = 160 + innerRadius * Math.cos(endRad);
                    const innerY2 = 160 + innerRadius * Math.sin(endRad);
                    
                    const outerX1 = 160 + outerRadius * Math.cos(startRad);
                    const outerY1 = 160 + outerRadius * Math.sin(startRad);
                    const outerX2 = 160 + outerRadius * Math.cos(endRad);
                    const outerY2 = 160 + outerRadius * Math.sin(endRad);
                    
                    const path = [
                      `M ${innerX1} ${innerY1}`,
                      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerX2} ${innerY2}`,
                      `L ${outerX2} ${outerY2}`,
                      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerX1} ${outerY1}`,
                      'Z'
                    ].join(' ');
                    
                    const isSelected = selectedEmotion === emotion;
                    const emotionColor = emotionColors[emotion] || "#888";

                    return (
                      <g key={`segment-${ringIndex}-${index}`}>
                        <motion.path
                          d={path}
                          fill={emotionColor}
                          opacity={isSelected ? 1 : 0.7}
                          whileHover={{ opacity: 0.9, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          style={{ transformOrigin: "center" }}
                          onClick={() => setSelectedEmotion(emotion)}
                          className="cursor-pointer"
                        />
                        {outerRadius - innerRadius > 30 && (
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="10"
                            className="pointer-events-none"
                            style={{ 
                              textShadow: "0px 0px 2px rgba(0,0,0,0.5)" 
                            }}
                          >
                            {emotion}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </div>
              ))}
              
              {/* Selected emotion indicator */}
              {selectedEmotion && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <span className="text-neutral-900 font-medium">{selectedEmotion}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Emotion Input */}
        <Card>
          <CardHeader>
            <CardTitle>Record Your Emotion</CardTitle>
            <CardDescription>
              How intensely are you feeling this emotion?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Selected Emotion</span>
                <span 
                  className="font-medium"
                  style={{ color: emotionColors[selectedEmotion] || "#888" }}
                >
                  {selectedEmotion || "None selected"}
                </span>
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Intensity</div>
                <Slider
                  value={[intensity]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setIntensity(value[0])}
                  className="mb-1"
                />
                <div className="text-xs text-neutral-500 flex justify-between">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Intense</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Notes (Optional)</div>
                <Textarea
                  placeholder="What triggered this emotion? How is it affecting you?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none h-32"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveEmotion} 
              className="w-full bg-[#483D8B] hover:bg-opacity-90"
              disabled={saveEmotionMutation.isPending}
            >
              {saveEmotionMutation.isPending ? "Saving..." : "Record Emotion"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Emotion Analytics */}
      {emotionTrackings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>Breakdown of your tracked emotions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={emotionColors[entry.name] || "#888"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} occurrences`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Emotion Intensity Timeline</CardTitle>
              <CardDescription>Track how your emotions change over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
                            <p className="font-medium">{data.date}</p>
                            <p className="text-sm">
                              {data.emotion}: <span className="font-medium">{data.intensity}/10</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#483D8B" 
                    strokeWidth={2}
                    dot={{ 
                      stroke: '#483D8B', 
                      strokeWidth: 2, 
                      r: 4, 
                      fill: 'white' 
                    }}
                    activeDot={{ 
                      stroke: '#483D8B', 
                      strokeWidth: 2, 
                      r: 6, 
                      fill: '#483D8B' 
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Empty state for no tracking data */}
      {emotionTrackings.length === 0 && (
        <Card className="bg-neutral-50 border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-200 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-neutral-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No Emotions Tracked Yet</h3>
            <p className="text-neutral-600 max-w-md mx-auto mb-6">
              Start tracking your emotions to visualize patterns and gain insights into your emotional well-being.
            </p>
            <p className="text-sm text-neutral-500">
              Use the emotion wheel above to record how you're feeling right now.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
