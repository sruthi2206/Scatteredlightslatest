import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, format } from "date-fns";
import { Sparkles, Bookmark, ChevronRight, ChevronDown, Mic, MicOff, Star, BookOpen, Flame, CheckCircle, Trophy } from "lucide-react";

interface JournalEntryProps {
  entries?: any[];
  userId: number;
}

export default function JournalEntry({ entries = [], userId }: JournalEntryProps) {
  const [journalContent, setJournalContent] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation for creating a new journal entry
  const createJournalMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/journal-entries", {
        userId,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/journal-entries`] });
      setJournalContent("");
      toast({
        title: "Journal Entry Created",
        description: "Your thoughts have been recorded and analyzed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!journalContent.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something in your journal before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    createJournalMutation.mutate(journalContent);
  };
  
  // Toggle voice journaling
  const toggleVoiceJournaling = () => {
    setIsVoiceActive(!isVoiceActive);
    
    toast({
      title: isVoiceActive ? "Voice Recording Stopped" : "Voice Recording Started",
      description: isVoiceActive 
        ? "Your recording has been processed." 
        : "Speak clearly to record your journal entry.",
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Toggle entry expansion
  const toggleExpandEntry = (id: number) => {
    if (expandedEntry === id) {
      setExpandedEntry(null);
    } else {
      setExpandedEntry(id);
    }
  };
  
  // Journal prompts
  const journalPrompts = [
    "What emotions have been most present for you today?",
    "Describe a moment when you felt truly connected to yourself recently.",
    "What patterns have you noticed in your reactions this week?",
    "If your body could speak, what would it tell you right now?",
    "What's one thing you're holding onto that you could release?",
    "Describe a quality you admire in someone else. How might you cultivate this in yourself?",
    "What aspect of your shadow self emerged today? What might it be trying to teach you?",
    "What would your higher self advise you about your current situation?"
  ];
  
  // Random journal prompt
  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    setJournalContent(journalPrompts[randomIndex]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Guided Journaling</h2>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Express your thoughts and feelings with AI-powered insights to deepen your self-awareness.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Journal Entry Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>New Journal Entry</CardTitle>
                  <CardDescription>
                    Write or speak about your thoughts, emotions, and experiences
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={getRandomPrompt}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span>Prompt</span>
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Textarea
                  placeholder="How are you feeling today? What insights or challenges are you experiencing?"
                  className="min-h-[200px] resize-none"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant={isVoiceActive ? "destructive" : "outline"}
                  onClick={toggleVoiceJournaling}
                >
                  {isVoiceActive ? (
                    <>
                      <MicOff className="h-4 w-4 mr-1" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" />
                      <span>Voice Journal</span>
                    </>
                  )}
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#483D8B] hover:bg-opacity-90"
                  disabled={createJournalMutation.isPending}
                >
                  {createJournalMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        {/* Journal Prompts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reflective Prompts</CardTitle>
              <CardDescription>
                Deep questions to spark insight and awareness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {journalPrompts.slice(0, 5).map((prompt, index) => (
                  <li 
                    key={index} 
                    className="bg-neutral-50 p-3 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                    onClick={() => setJournalContent(prompt)}
                  >
                    <div className="flex items-start">
                      <Bookmark className="h-4 w-4 mt-0.5 mr-2 text-[#483D8B]" />
                      <p className="text-sm">{prompt}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Journal Insights Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <Sparkles className="h-5 w-5 mr-2" />
            Journal Insights
          </CardTitle>
          <CardDescription className="text-indigo-600">
            Your reflective journey at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium mt-4 mb-2 text-indigo-800">Begin Your Journey</h3>
              <p className="text-indigo-600 max-w-md mx-auto">
                Start journaling to unlock personalized insights and track your emotional growth.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Enhanced Streak Tracker */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-200 text-center">
                  <div className="text-2xl font-bold text-indigo-800">{entries.length}</div>
                  <div className="text-xs text-indigo-600">Total Entries</div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-200 text-center">
                  <div className="text-2xl font-bold text-indigo-800">
                    {entries.length > 0 
                      ? (entries.reduce((sum, entry) => sum + (entry.sentimentScore || 5), 0) / entries.length).toFixed(1)
                      : "0"}
                  </div>
                  <div className="text-xs text-indigo-600">Avg Mood</div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200 text-center relative">
                  <div className="flex items-center justify-center mb-1">
                    <Flame className="h-4 w-4 text-amber-600 mr-1" />
                    <div className="text-2xl font-bold text-amber-800">
                      {(() => {
                        if (!entries.length) return 0;
                        
                        // Calculate actual streak
                        const sortedEntries = entries
                          .map(entry => new Date(entry.createdAt))
                          .sort((a, b) => b.getTime() - a.getTime());
                        
                        let streak = 0;
                        let currentDate = new Date();
                        
                        // Check if journaled today
                        const hasJournaledToday = sortedEntries.some(date => 
                          isSameDay(date, currentDate)
                        );
                        
                        if (hasJournaledToday) {
                          streak = 1;
                          currentDate.setDate(currentDate.getDate() - 1);
                          
                          // Count consecutive days
                          for (let i = 1; i < sortedEntries.length; i++) {
                            const entryDate = sortedEntries[i];
                            if (isSameDay(entryDate, currentDate)) {
                              streak++;
                              currentDate.setDate(currentDate.getDate() - 1);
                            } else {
                              break;
                            }
                          }
                        }
                        
                        return streak;
                      })()}
                    </div>
                  </div>
                  <div className="text-xs text-amber-600">Day Streak</div>
                  {(() => {
                    const hasJournaledToday = entries.some(entry => 
                      isSameDay(new Date(entry.createdAt), new Date())
                    );
                    return hasJournaledToday && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Consistency Indicator */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-800">This Month's Consistency</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {(() => {
                      const monthDays = eachDayOfInterval({
                        start: startOfMonth(new Date()),
                        end: endOfMonth(new Date())
                      });
                      const journaledDays = monthDays.filter(day => 
                        entries.some(entry => isSameDay(new Date(entry.createdAt), day))
                      ).length;
                      return Math.round((journaledDays / monthDays.length) * 100);
                    })()}%
                  </Badge>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(() => {
                        const monthDays = eachDayOfInterval({
                          start: startOfMonth(new Date()),
                          end: endOfMonth(new Date())
                        });
                        const journaledDays = monthDays.filter(day => 
                          entries.some(entry => isSameDay(new Date(entry.createdAt), day))
                        ).length;
                        return Math.round((journaledDays / monthDays.length) * 100);
                      })()}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                  {(() => {
                    const monthDays = eachDayOfInterval({
                      start: startOfMonth(new Date()),
                      end: endOfMonth(new Date())
                    });
                    const journaledDays = monthDays.filter(day => 
                      entries.some(entry => isSameDay(new Date(entry.createdAt), day))
                    ).length;
                    const percentage = Math.round((journaledDays / monthDays.length) * 100);
                    
                    return percentage >= 80 
                      ? "🌟 Amazing consistency! Keep it up!" 
                      : percentage >= 50 
                        ? "💪 Good progress! Try to journal more regularly" 
                        : "🎯 Let's build that habit! Every day counts";
                  })()}
                </p>
              </div>

              {/* Recent Insight */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-indigo-800">Latest Reflection</h4>
                  <span className="text-xs text-indigo-600">
                    {formatDistanceToNow(new Date(entries[0].createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-indigo-700 italic line-clamp-2">
                  "{entries[0].content.substring(0, 100)}{entries[0].content.length > 100 ? '...' : ''}"
                </p>
                
                {/* Emotion Tags */}
                {entries[0].emotionTags && entries[0].emotionTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {entries[0].emotionTags.slice(0, 4).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="bg-white/70 hover:bg-white border-indigo-200 text-indigo-700"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Continue Writing
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
