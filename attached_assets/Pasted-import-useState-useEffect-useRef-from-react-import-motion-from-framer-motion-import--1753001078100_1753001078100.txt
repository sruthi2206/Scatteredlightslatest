import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  BookOpen, 
  Sparkles, 
  MicOff, 
  Mic, 
  Bookmark, 
  Star, 
  ListTodo, 
  Rocket, 
  Target, 
  Languages, 
  MessageSquareText,
  XCircle,
  PlusCircle,
  Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SecretDiaryPinModal from "@/components/SecretDiaryPinModal";
import SecretDiaryCalendar from "@/components/SecretDiaryCalendar";

// Using language context imported from hooks/use-language.tsx

export default function Journal() {
  const { user } = useAuth();
  const { language, setLanguage, t, LANGUAGES } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [journalContent, setJournalContent] = useState("");
  const [gratitude, setGratitude] = useState<string[]>(["", "", ""]);
  const [affirmation, setAffirmation] = useState("");
  const [proudOfItems, setProudOfItems] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [forgivenessItems, setForgivenessItems] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [commitmentItems, setCommitmentItems] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [abundanceAffirmations, setAbundanceAffirmations] = useState<string[]>(["", "", ""]);
  
  // Secret Diary state
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDiaryCalendar, setShowDiaryCalendar] = useState(false);
  const [userPin, setUserPin] = useState<string | null>(null);

  // Helper functions for the new affirmation prompts
  const updateProudItem = (index: number, value: string) => {
    const newItems = [...proudOfItems];
    newItems[index] = value;
    setProudOfItems(newItems);
  };

  const updateForgivenessItem = (index: number, value: string) => {
    const newItems = [...forgivenessItems];
    newItems[index] = value;
    setForgivenessItems(newItems);
  };

  const updateCommitmentItem = (index: number, value: string) => {
    const newItems = [...commitmentItems];
    newItems[index] = value;
    setCommitmentItems(newItems);
  };

  const updateAbundanceAffirmation = (index: number, value: string) => {
    const newItems = [...abundanceAffirmations];
    newItems[index] = value;
    setAbundanceAffirmations(newItems);
  };
  const [shortTermGoals, setShortTermGoals] = useState<string[]>(["", "", ""]);
  const [longTermVision, setLongTermVision] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    console.log('Initializing speech recognition in Journal...');
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      console.log('Speech Recognition constructor available:', !!SpeechRecognition);
      
      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          console.log('Speech recognition instance created successfully');
          
          if (recognitionRef.current) {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.maxAlternatives = 3;
            
            recognitionRef.current.onstart = () => {
              console.log('Speech recognition started');
              setIsListening(true);
              // No auto-timeout - user controls when to stop
            };
            
            recognitionRef.current.onresult = (event: any) => {
              console.log('Speech recognition result:', event);
              let finalTranscript = '';
              
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                  // Get the best result from alternatives
                  let bestTranscript = result[0].transcript;
                  let bestConfidence = result[0].confidence || 0;
                  
                  // Check alternatives for better confidence
                  for (let j = 0; j < result.length; j++) {
                    const alternative = result[j];
                    if (alternative.confidence > bestConfidence) {
                      bestTranscript = alternative.transcript;
                      bestConfidence = alternative.confidence;
                    }
                  }
                  
                  // Clean up the transcript
                  const cleanedTranscript = bestTranscript
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/\b(kill|steel|deal)\b/gi, (match: string) => {
                      const text = bestTranscript.toLowerCase();
                      const corrections: { [key: string]: string } = {
                        'kill': text.includes('speech') || text.includes('text') ? 'create' : match,
                        'steel': 'still',
                        'deal': 'real'
                      };
                      return corrections[match.toLowerCase()] || match;
                    })
                    .replace(/^./, (match: string) => match.toUpperCase())
                    .replace(/\.$/, '')
                    .trim();
                  
                  finalTranscript += cleanedTranscript + ' ';
                  console.log('Final transcript:', cleanedTranscript, 'Confidence:', bestConfidence);
                }
              }
              
              if (finalTranscript.trim()) {
                // Update the appropriate field based on activeVoiceField
                if (activeVoiceField === 'general') {
                  setJournalContent(prev => {
                    const currentText = prev.trim();
                    const newText = finalTranscript.trim();
                    return currentText ? `${currentText} ${newText}` : newText;
                  });
                } else if (activeVoiceField === 'affirmation') {
                  setAffirmation(prev => {
                    const currentText = prev.trim();
                    const newText = finalTranscript.trim();
                    return currentText ? `${currentText} ${newText}` : newText;
                  });
                } else if (activeVoiceField === 'longTermVision') {
                  setLongTermVision(prev => {
                    const currentText = prev.trim();
                    const newText = finalTranscript.trim();
                    return currentText ? `${currentText} ${newText}` : newText;
                  });
                }
              }
            };
            
            recognitionRef.current.onend = () => {
              console.log('Speech recognition ended');
              setIsListening(false);
              setIsVoiceActive(false);
              setActiveVoiceField("");
            };
            
            recognitionRef.current.onerror = (event: any) => {
              console.error('Speech recognition error:', event);
              setIsListening(false);
              setIsVoiceActive(false);
              setActiveVoiceField("");
              toast({
                title: "Voice Recognition Error",
                description: `Error: ${event.error || 'Unknown error'}. Please try again.`,
                variant: "destructive",
              });
            };
          }
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
        }
      } else {
        console.log('Speech recognition not supported in this browser');
      }
    } else {
      console.log('Window object not available');
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [toast, isListening, activeVoiceField]);
  
  // Fetch user's journal entries
  const { data: journalEntries, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/journal-entries`],
    enabled: !!user,
  });

  // Check if user has a secret diary PIN
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user,
  });

  // Secret Diary PIN management functions
  const handleSecretDiaryClick = () => {
    setUserPin(userData?.secretDiaryPin || null);
    setShowPinModal(true);
  };

  const handleSetPin = async (pin: string) => {
    await apiRequest("POST", "/api/secret-diary/set-pin", { pin });
    setUserPin(pin);
  };

  const handleVerifyPin = async (pin: string) => {
    try {
      const response = await apiRequest("POST", "/api/secret-diary/verify-pin", { pin });
      const result = await response.json();
      return result.valid;
    } catch {
      return false;
    }
  };

  const handlePinSuccess = () => {
    setShowDiaryCalendar(true);
  };
  
  // Mutation for creating a new journal entry
  const createJournalMutation = useMutation({
    mutationFn: async () => {
      // Filter out empty strings from arrays
      const filteredGratitude = gratitude.filter(item => item.trim() !== "");
      const filteredShortTermGoals = shortTermGoals.filter(item => item.trim() !== "");
      
      // Always use "english" for language to ensure consistency
      const response = await apiRequest("POST", "/api/journal-entries", {
        userId: user?.id,
        content: journalContent,
        gratitude: filteredGratitude,
        affirmation,
        shortTermGoals: filteredShortTermGoals,
        longTermVision,
        language: "english" // Force English language for journal entries
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch journal entries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/journal-entries`] });
      
      // Reset all fields
      setJournalContent("");
      setGratitude(["", "", ""]);
      setAffirmation("");
      setShortTermGoals(["", "", ""]);
      setLongTermVision("");
      
      // No toast notification - save silently for better user experience
    },
    onError: (error) => {
      // Only show notification on errors
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
    
    // Check if any field has content
    const hasContent = 
      journalContent.trim() !== "" || 
      gratitude.some(g => g.trim() !== "") ||
      affirmation.trim() !== "" ||
      shortTermGoals.some(g => g.trim() !== "") ||
      longTermVision.trim() !== "";
    
    if (!hasContent) {
      toast({
        title: "Empty Journal",
        description: "Please fill at least one section of your journal before saving.",
        variant: "destructive",
      });
      return;
    }
    
    createJournalMutation.mutate();
  };
  
  // Toggle voice journaling
  const toggleVoiceJournaling = (fieldType: string = 'general') => {
    console.log('Voice recording button clicked', { fieldType, isVoiceActive, isListening });
    
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    console.log('Speech recognition support:', !!SpeechRecognition);
    
    if (!SpeechRecognition) {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not supported in this browser. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (!recognitionRef.current) {
      console.log('Recognition ref is null, attempting to initialize...');
      toast({
        title: "Voice Recognition Error",
        description: "Voice recognition is not initialized. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Recognition ref exists:', !!recognitionRef.current);

    if (isVoiceActive || isListening) {
      // Stop recording
      try {
        recognitionRef.current.stop();
        setIsVoiceActive(false);
        setIsListening(false);
        setActiveVoiceField("");
        
        toast({
          title: "Voice Input Stopped",
          description: "Your message has been captured.",
        });
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsVoiceActive(false);
        setIsListening(false);
        setActiveVoiceField("");
      }
    } else {
      // Start recording
      try {
        // Request microphone permission first
        navigator.mediaDevices?.getUserMedia({ audio: true })
          .then(() => {
            setActiveVoiceField(fieldType);
            recognitionRef.current.start();
            setIsVoiceActive(true);
            
            toast({
              title: "Voice Input Started", 
              description: `Speak freely. Click the button again when you're done recording.`,
            });
          })
          .catch((error) => {
            console.error('Microphone permission denied:', error);
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access to use voice input.",
              variant: "destructive",
            });
          });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Voice Recognition Error",
          description: "Unable to start voice input. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Update gratitude list items
  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...gratitude];
    newGratitude[index] = value;
    setGratitude(newGratitude);
  };
  
  // Update short-term goals list items
  const updateShortTermGoal = (index: number, value: string) => {
    const newGoals = [...shortTermGoals];
    newGoals[index] = value;
    setShortTermGoals(newGoals);
  };
  
  // Add new gratitude item
  const addGratitudeItem = () => {
    setGratitude([...gratitude, ""]);
  };
  
  // Remove gratitude item
  const removeGratitudeItem = (index: number) => {
    const newGratitude = [...gratitude];
    newGratitude.splice(index, 1);
    setGratitude(newGratitude);
  };
  
  // Add new short-term goal
  const addShortTermGoal = () => {
    setShortTermGoals([...shortTermGoals, ""]);
  };
  
  // Remove short-term goal
  const removeShortTermGoal = (index: number) => {
    const newGoals = [...shortTermGoals];
    newGoals.splice(index, 1);
    setShortTermGoals(newGoals);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            {t('title') || "Daily Alignment Journal"}
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            {t('subtitle') || "Record your thoughts, emotions, and goals with AI-powered insights to guide your healing journey"}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Journal Entry Form */}
          <motion.div 
            className="md:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>{t('newEntry') || "New Journal Entry"}</CardTitle>
                <CardDescription>
                  {t('newEntryDescription') || "Express your thoughts, emotions, and aspirations in this structured journal"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-5 mb-6">
                      <TabsTrigger value="general" className="flex items-center">
                        <MessageSquareText className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t('general') || "General"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="gratitude" className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t('gratitude') || "Gratitude"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="affirmation" className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t('affirmation') || "Affirmation"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="shortterm" className="flex items-center">
                        <ListTodo className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t('shortTerm') || "Short-Term"}</span>
                      </TabsTrigger>
                      <TabsTrigger value="longterm" className="flex items-center">
                        <Rocket className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t('longTerm') || "Long-Term"}</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{t('generalTitle') || "💭 General Reflections"}</h3>
                        <p className="text-sm text-neutral-600">
                          {t('generalDescription') || "Write freely about your thoughts, emotions, and experiences"}
                        </p>
                        <Textarea
                          placeholder={t('generalPlaceholder') || "How are you feeling today? What's on your mind?"}
                          className="min-h-[200px] resize-none"
                          value={journalContent}
                          onChange={(e) => setJournalContent(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="gratitude">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{t('gratitudeTitle') || "✨ I am grateful for..."}</h3>
                        <p className="text-sm text-neutral-600">
                          {t('gratitudeDescription') || "List things that brought you joy, peace, or inspiration today"}
                        </p>
                        
                        <div className="space-y-2">
                          {gratitude.map((item, index) => (
                            <div key={`gratitude-${index}`} className="flex gap-2">
                              <Input
                                placeholder={`${t('gratitudePlaceholder') || "Gratitude"} ${index + 1}`}
                                value={item}
                                onChange={(e) => updateGratitude(index, e.target.value)}
                                className="flex-grow"
                              />
                              {gratitude.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeGratitudeItem(index)}
                                >
                                  <XCircle className="h-4 w-4 text-neutral-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addGratitudeItem}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {t('addAnother') || "Add Another"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="affirmation">
                      <div className="space-y-8">
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-neutral-800">🌟 Affirmation Practice</h3>
                          <p className="text-sm text-neutral-600">
                            Complete these powerful affirmation exercises to align your energy and mindset
                          </p>
                        </div>

                        {/* I am proud of... */}
                        <div className="space-y-4 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
                          <h4 className="text-md font-semibold text-emerald-800 flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            I am proud of... (Write 7 things you're proud of yourself)
                          </h4>
                          <div className="space-y-2">
                            {proudOfItems.map((item, index) => (
                              <Input
                                key={`proud-${index}`}
                                placeholder={`${index + 1}. I am proud of...`}
                                value={item}
                                onChange={(e) => updateProudItem(index, e.target.value)}
                                className="bg-white"
                              />
                            ))}
                          </div>
                        </div>

                        {/* I am forgiving... */}
                        <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                          <h4 className="text-md font-semibold text-blue-800 flex items-center">
                            <MessageSquareText className="w-4 h-4 mr-2" />
                            I am forgiving myself or others... (Write 7 things you want to forgive)
                          </h4>
                          <div className="space-y-2">
                            {forgivenessItems.map((item, index) => (
                              <Input
                                key={`forgiveness-${index}`}
                                placeholder={`${index + 1}. I forgive myself/others for...`}
                                value={item}
                                onChange={(e) => updateForgivenessItem(index, e.target.value)}
                                className="bg-white"
                              />
                            ))}
                          </div>
                        </div>

                        {/* I am committing to... */}
                        <div className="space-y-4 bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                          <h4 className="text-md font-semibold text-purple-800 flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            I am committing to do... (Write 7 goals or things you want to commit to)
                          </h4>
                          <div className="space-y-2">
                            {commitmentItems.map((item, index) => (
                              <Input
                                key={`commitment-${index}`}
                                placeholder={`${index + 1}. I commit to...`}
                                value={item}
                                onChange={(e) => updateCommitmentItem(index, e.target.value)}
                                className="bg-white"
                              />
                            ))}
                          </div>
                        </div>

                        {/* I have... affirmations */}
                        <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                          <h4 className="text-md font-semibold text-amber-800 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2" />
                            I have... (Abundance affirmations)
                          </h4>
                          <p className="text-xs text-amber-700 mb-3">
                            Examples: "I have deep, loving relationships in my life" • "I have clarity and direction in my purpose" • "I have everything I need to thrive"
                          </p>
                          <div className="space-y-2">
                            {abundanceAffirmations.map((item, index) => (
                              <Input
                                key={`abundance-${index}`}
                                placeholder={`${index + 1}. I have...`}
                                value={item}
                                onChange={(e) => updateAbundanceAffirmation(index, e.target.value)}
                                className="bg-white"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Original simple affirmation field */}
                        <div className="space-y-4 bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-100">
                          <h4 className="text-md font-semibold text-rose-800 flex items-center">
                            <Rocket className="w-4 h-4 mr-2" />
                            Personal Affirmation
                          </h4>
                          <Input
                            placeholder="I am..."
                            value={affirmation}
                            onChange={(e) => setAffirmation(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      
                    </TabsContent>
                    
                    <TabsContent value="shortterm">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{t('shortTermTitle') || "🎯 Steps I will take today"}</h3>
                        <p className="text-sm text-neutral-600">
                          {t('shortTermDescription') || "What key actions will move you forward today?"}
                        </p>
                        
                        <div className="space-y-2">
                          {shortTermGoals.map((goal, index) => (
                            <div key={`goal-${index}`} className="flex gap-2">
                              <Input
                                placeholder={`${t('shortTermPlaceholder') || "Step"} ${index + 1}`}
                                value={goal}
                                onChange={(e) => updateShortTermGoal(index, e.target.value)}
                                className="flex-grow"
                              />
                              {shortTermGoals.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeShortTermGoal(index)}
                                >
                                  <XCircle className="h-4 w-4 text-neutral-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addShortTermGoal}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {t('addAnother') || "Add Another"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="longterm">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-800">{t('longTermTitle') || "🚀 Steps toward my long-term goals"}</h3>
                        <p className="text-sm text-neutral-600">
                          {t('longTermDescription') || "What aligned actions or habits will move you toward your vision?"}
                        </p>
                        <Textarea
                          placeholder={t('longTermPlaceholder') || "My long-term vision includes..."}
                          className="min-h-[150px] resize-none"
                          value={longTermVision}
                          onChange={(e) => setLongTermVision(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant={isVoiceActive || isListening ? "destructive" : "outline"}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Voice Journal button clicked!');
                      toggleVoiceJournaling('general');
                    }}
                    className={`relative ${isListening ? 'animate-pulse' : ''}`}
                    title={isListening ? "Listening... Click to stop" : "Start voice input"}
                  >
                    {isVoiceActive || isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-1 text-white" />
                        <span>{t('stopRecording') || "Stop Recording"}</span>
                        {isListening && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        )}
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-1" />
                        <span>{t('voiceJournal') || "Start Voice"}</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#483D8B] to-[#008080] text-white hover:opacity-90"
                    disabled={createJournalMutation.isPending}
                  >
                    {createJournalMutation.isPending ? "Saving..." : t('saveButton') || "Save Entry"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
          
          {/* Journal Insights Panel */}
          <motion.div 
            className="md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>{t('insightsTitle') || "Journal Insights"}</CardTitle>
                <CardDescription>
                  {t('insightsDescription') || "AI-generated insights from your journal entries"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
                  </div>
                ) : journalEntries && Array.isArray(journalEntries) && journalEntries.length > 0 ? (
                  <div className="space-y-6">
                    {/* Emotion Tracking */}
                    <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-rose-600" />
                        <span className="font-medium text-rose-800">{t('emotionPatterns') || "Emotion Patterns"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {language === "english" ? "joy" : language === "hindi" ? "आनंद" : language === "tamil" ? "மகிழ்ச்சி" : "joy"}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {language === "english" ? "gratitude" : language === "hindi" ? "कृतज्ञता" : language === "tamil" ? "நன்றி" : "gratitude"}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                          {language === "english" ? "reflection" : language === "hindi" ? "चिंतन" : language === "tamil" ? "பிரதிபலிப்பு" : "reflection"}
                        </Badge>
                      </div>
                      <p className="text-sm text-rose-700">
                        {language === "english" 
                          ? "Your emotional state has been positive recently, with a focus on reflection and gratitude."
                          : language === "hindi" 
                            ? "आपकी भावनात्मक स्थिति हाल ही में सकारात्मक रही है, जिसमें चिंतन और कृतज्ञता पर ध्यान केंद्रित है।"
                            : language === "tamil"
                              ? "உங்கள் உணர்ச்சி நிலை சமீபத்தில் நேர்மறையாக இருந்துள்ளது, பிரதிபலிப்பு மற்றும் நன்றியுணர்வை மையமாகக் கொண்டது."
                              : "Your emotional state has been positive recently, with a focus on reflection and gratitude."}
                      </p>
                    </div>
                    
                    {/* Chakra Focus */}
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                        <span className="font-medium text-indigo-800">{t('chakraBalance') || "Chakra Balance"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                          {language === "english" ? "throat chakra" : language === "hindi" ? "कंठ चक्र" : language === "tamil" ? "தொண்டை சக்கரம்" : "throat chakra"}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                          {language === "english" ? "heart chakra" : language === "hindi" ? "हृदय चक्र" : language === "tamil" ? "இதய சக்கரம்" : "heart chakra"}
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {language === "english" 
                          ? "Your journal entries show focus on expressing yourself (throat chakra) and processing emotions (heart chakra)."
                          : language === "hindi" 
                            ? "आपकी जर्नल प्रविष्टियां स्वयं को व्यक्त करने (कंठ चक्र) और भावनाओं को संसाधित करने (हृदय चक्र) पर ध्यान केंद्रित करती हैं।"
                            : language === "tamil"
                              ? "உங்கள் பதிவேடு உள்ளீடுகள் உங்களை வெளிப்படுத்துவதில் (தொண்டை சக்கரம்) மற்றும் உணர்வுகளை செயலாக்குவதில் (இதய சக்கரம்) கவனம் செலுத்துகின்றன."
                              : "Your journal entries show focus on expressing yourself (throat chakra) and processing emotions (heart chakra)."}
                      </p>
                    </div>
                    
                    {/* Goal Progress */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <Target className="h-5 w-5 mr-2 text-emerald-600" />
                        <span className="font-medium text-emerald-800">{t('goalProgress') || "Goal Progress"}</span>
                      </div>
                      <ul className="space-y-2 text-sm text-emerald-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-emerald-600 mr-2 mt-1.5"></div>
                          <span>
                            {language === "english" 
                              ? "You're making steady progress on your meditation practice consistency"
                              : language === "hindi" 
                                ? "आप अपने ध्यान अभ्यास की निरंतरता पर स्थिर प्रगति कर रहे हैं"
                                : language === "tamil"
                                  ? "நீங்கள் உங்கள் தியான பயிற்சி நிலைத்தன்மையில் நிலையான முன்னேற்றம் அடைகிறீர்கள்"
                                  : "You're making steady progress on your meditation practice consistency"}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-emerald-600 mr-2 mt-1.5"></div>
                          <span>
                            {language === "english" 
                              ? "Focus on completing one short-term goal each day for better results"
                              : language === "hindi" 
                                ? "बेहतर परिणामों के लिए प्रतिदिन एक अल्पकालिक लक्ष्य को पूरा करने पर ध्यान दें"
                                : language === "tamil"
                                  ? "சிறந்த முடிவுகளுக்கு ஒவ்வொரு நாளும் ஒரு குறுகிய கால இலக்கை நிறைவு செய்வதில் கவனம் செலுத்துங்கள்"
                                  : "Focus on completing one short-term goal each day for better results"}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Wisdom & Advice */}
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-amber-600" />
                        <span className="font-medium text-amber-800">{t('personalizedWisdom') || "Personalized Wisdom"}</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-2 italic">
                        {language === "english" 
                          ? "\"Your consistent journaling practice is building self-awareness. Consider adding a 5-minute meditation before journaling to deepen insights.\""
                          : language === "hindi" 
                            ? "\"आपका निरंतर जर्नलिंग अभ्यास आत्म-जागरूकता का निर्माण कर रहा है। अंतर्दृष्टि को गहरा करने के लिए जर्नलिंग से पहले 5-मिनट का ध्यान जोड़ने पर विचार करें।\""
                            : language === "tamil"
                              ? "\"உங்கள் தொடர்ச்சியான பதிவு செய்யும் பயிற்சி சுய விழிப்புணர்வை உருவாக்குகிறது. பதிவு செய்வதற்கு முன் 5-நிமிட தியானத்தைச் சேர்த்து நுண்ணறிவுகளை ஆழப்படுத்த முயற்சிக்கவும்.\""
                              : "\"Your consistent journaling practice is building self-awareness. Consider adding a 5-minute meditation before journaling to deepen insights.\""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>{t('noEntries') || "No journal entries yet"}</p>
                    <p className="text-sm mt-1">{t('startWriting') || "Start writing to see your insights here"}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Secret Diary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 border-purple-200 relative">
              
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-tr from-pink-200/40 to-purple-200/40 rounded-full translate-y-4 -translate-x-4 sm:translate-y-6 sm:-translate-x-6"></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center text-purple-800 text-base sm:text-lg font-semibold">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mr-2 sm:mr-3">
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base">Secret Diary</span>
                  </CardTitle>
                  <CardDescription className="text-purple-700 text-xs sm:text-sm leading-relaxed mt-2">
                    View your private journal entries in a secure calendar view
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 relative z-10">
                  <Button
                    onClick={handleSecretDiaryClick}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200 py-2 sm:py-3 text-xs sm:text-sm font-medium"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Open Secret Diary</span>
                    <span className="sm:hidden">Open Diary</span>
                  </Button>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-purple-200/50">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <div className="w-1 h-1 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-purple-700 text-center font-medium px-1">
                        {(userData as any)?.secretDiaryPin 
                          ? "Enter your PIN to access" 
                          : "Set up a PIN to secure your entries"
                        }
                      </p>
                      <div className="w-1 h-1 sm:w-2 sm:h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-2 sm:mt-3">
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-purple-600">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-500 rounded-full"></div>
                      <span className="text-xs">Calendar view</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-purple-600">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-pink-500 rounded-full"></div>
                      <span className="text-xs">PIN protected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Secret Diary PIN Modal */}
        <SecretDiaryPinModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
          hasExistingPin={!!(userData as any)?.secretDiaryPin}
          onSetPin={handleSetPin}
          onVerifyPin={handleVerifyPin}
        />

        {/* Secret Diary Calendar */}
        <SecretDiaryCalendar
          isOpen={showDiaryCalendar}
          onClose={() => setShowDiaryCalendar(false)}
          journalEntries={journalEntries || []}
        />
      </div>
    </div>
  );
}
