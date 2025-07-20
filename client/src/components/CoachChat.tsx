import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, MicOff, RefreshCw, Trash2, AlertTriangle, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface CoachChatProps {
  coachType: string;
  userId: number;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

// Coach configuration
const coachConfig: Record<string, {
  name: string;
  description: string;
  avatar: string;
  color: string;
  iconColor: string;
  greeting: string;
}> = {
  inner_child: {
    name: "Inner Child Coach",
    description: "Healing wounds from the past",
    avatar: "👶",
    color: "#7DF9FF",
    iconColor: "text-[#7DF9FF]",
    greeting: "Hello there! I'm your Inner Child Coach. I'm here to help you reconnect with your authentic self and heal childhood wounds. What would you like to explore today?"
  },
  shadow_self: {
    name: "Shadow Self Coach",
    description: "Embracing your whole self",
    avatar: "🌗",
    color: "#191970",
    iconColor: "text-[#191970]",
    greeting: "Hello love, I'm your Shadow Healing Companion. Together, we'll gently uncover the hidden parts of your subconscious that may still carry pain, fear, or limiting beliefs — and release them with compassion. Are you ready to begin?"
  },
  higher_self: {
    name: "Higher Self Coach",
    description: "Connecting to your essence",
    avatar: "✨",
    color: "#483D8B",
    iconColor: "text-[#483D8B]",
    greeting: "Greetings! I'm your Higher Self Coach. I'm here to help you connect with your highest potential and purpose. What's on your mind today that you'd like guidance with?"
  },
  integration: {
    name: "Integration Coach",
    description: "Unifying your journey",
    avatar: "🧩",
    color: "#008080",
    iconColor: "text-[#008080]",
    greeting: "Hi there! I'm your Integration Coach. I'm here to help you apply insights into practical actions and track your progress. What would you like to work on implementing today?"
  }
};

export default function CoachChat({ coachType, userId }: CoachChatProps) {
  const [message, setMessage] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Get coach config
  const coach = coachConfig[coachType] || coachConfig.integration;

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          
          if (recognitionRef.current) {
            // Detect mobile devices
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTablet = /iPad|Android|webOS|BlackBerry|PlayBook|Kindle/i.test(navigator.userAgent) && 
                            window.innerWidth >= 768;
            
            // Mobile-optimized settings
            recognitionRef.current.continuous = true; // Enable continuous for toggle functionality
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.maxAlternatives = 1;
            
            // Additional mobile-specific settings
            if (isMobile || isTablet) {
              // Set shorter timeout for mobile devices
              try {
                const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
                if (SpeechGrammarList) {
                  recognitionRef.current.grammars = new SpeechGrammarList();
                }
              } catch (error) {
                console.log('SpeechGrammarList not available on this device');
              }
            }
            
            recognitionRef.current.onstart = () => {
              console.log('Speech recognition started');
              setIsListening(true);
              // No auto-timeout - user controls when to stop
            };
            
            recognitionRef.current.onresult = (event: any) => {
              console.log('Speech recognition result:', event);
              let interimText = '';
              let finalText = '';
              
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                
                if (result.isFinal) {
                  // Clean up the final transcript
                  const cleanedTranscript = transcript
                    .trim()
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/^./, (match: string) => match.toUpperCase()) // Capitalize first letter
                    .trim();
                  
                  finalText += cleanedTranscript;
                  console.log('Final transcript:', cleanedTranscript);
                  
                  // Clear interim transcript when we get final result
                  setInterimTranscript('');
                } else {
                  // Show interim results for real-time feedback
                  interimText += transcript;
                  setInterimTranscript(interimText);
                }
              }
              
              // Update message with final transcript
              if (finalText.trim()) {
                setMessage(prev => {
                  const currentText = prev.trim();
                  const newText = finalText.trim();
                  return currentText ? `${currentText} ${newText}` : newText;
                });
              }
            };
            
            recognitionRef.current.onend = () => {
              console.log('Speech recognition ended');
              setIsListening(false);
              setInterimTranscript('');
              
              // Auto-restart if voice is still active (for continuous listening)
              if (isVoiceActive) {
                console.log('Auto-restarting speech recognition...');
                restartTimeoutRef.current = setTimeout(() => {
                  if (isVoiceActive && recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (error) {
                      console.error('Error restarting recognition:', error);
                    }
                  }
                }, 100); // Small delay to prevent rapid restarts
              } else {
                setIsVoiceActive(false);
              }
            };
            
            recognitionRef.current.onerror = (event: any) => {
              console.error('Speech recognition error:', event);
              setIsListening(false);
              setInterimTranscript('');
              
              // Only show error for serious issues, not for normal speech gaps
              if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
                setIsVoiceActive(false);
                
                let errorMessage = "Please try again.";
                switch (event.error) {
                  case 'not-allowed':
                    errorMessage = "Microphone access denied. Please allow microphone access.";
                    break;
                  case 'network':
                    errorMessage = "Network error. Please check your connection.";
                    break;
                  case 'service-not-allowed':
                    errorMessage = "Speech service not allowed. Please try again.";
                    break;
                }
                
                toast({
                  title: "Voice Recognition Error",
                  description: errorMessage,
                  variant: "destructive",
                });
              }
            };
          }
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
        }
      } else {
        console.log('Speech recognition not supported in this browser');
      }
    }
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [toast]);
  
  // Fetch previous conversations
  const { data: conversations, isLoading: isLoadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: [`/api/users/${userId}/coach-conversations`, { coachType }],
    queryFn: async ({ queryKey }) => {
      // Type assertion to help TypeScript understand the structure
      const baseUrl = queryKey[0] as string;
      const params = queryKey[1] as { coachType: string };
      const fullUrl = `${baseUrl}?coachType=${params.coachType}`;
      
      try {
        const response = await fetch(fullUrl, { credentials: "include" });
        if (!response.ok) {
          console.error(`Error fetching conversations: ${response.status}`);
          if (response.status === 400) {
            return []; // Return empty array if coachType parameter is missing
          }
          throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error in conversation fetch:", error);
        throw error;
      }
    },
    // Sort conversations by creation date to ensure newest is first
    select: (data) => {
      if (!Array.isArray(data)) return [];
      
      // Double-check that we're only getting conversations for this coach type
      const filteredData = data.filter(conversation => 
        conversation.coachType === coachType
      );
      
      return [...filteredData].sort((a, b) => {
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - 
               new Date(a.updatedAt || a.createdAt || 0).getTime();
      });
    }
  });
  
  // Set up initial messages when component loads
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      // Get the most recent conversation
      const latestConversation = conversations[0];
      setConversationId(latestConversation.id);
      // Filter out system messages from displaying
      const filteredMessages = Array.isArray(latestConversation.messages) 
        ? latestConversation.messages.filter((msg: any) => msg.role !== "system")
        : [];
      setMessages(filteredMessages);
    } else if (!isLoadingConversations) {
      // If no conversation exists, add greeting message
      setMessages([
        {
          role: "assistant",
          content: coach.greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [conversations, isLoadingConversations, coach.greeting]);
  
  // Scroll to bottom when messages change (only within chat container)
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/coach-chat", {
        userId,
        coachType,
        message: content,
        conversationId
      });
      
      if (!response.ok) {
        // Get the error message from the response if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update conversation ID if it's a new conversation
      if (!conversationId && data.conversation?.id) {
        setConversationId(data.conversation.id);
      }
      
      // Add AI response to messages
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: new Date()
        }
      ]);
      
      // Refresh the conversations list to keep it up to date
      refetchConversations();
    },
    onError: (error) => {
      // Keep the UI clean by removing the failed user message
      setMessages(prev => prev.slice(0, prev.length - 1));
      
      // Check if the error is related to coach type mismatch
      const isMismatchError = error.message.includes('coach type mismatch');
      
      toast({
        title: isMismatchError ? "Coach Type Mismatch" : "Connection Error",
        description: isMismatchError 
          ? "The conversation you tried to continue belongs to a different coach. Starting a new conversation."
          : `Unable to connect with your coach: ${error.message}`,
        variant: "destructive",
      });
      
      // If it's a coach type mismatch, automatically start a new conversation
      if (isMismatchError) {
        startNewConversation();
      }
    }
  });
  
  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(message);
    
    // Clear input
    setMessage("");
  };
  
  // Toggle voice input with enhanced mobile support
  const toggleVoiceInput = async () => {
    // Detect mobile/tablet devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android|webOS|BlackBerry|PlayBook|Kindle/i.test(navigator.userAgent) && 
                    window.innerWidth >= 768;
    
    // Check browser support with mobile-specific messaging
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const browserMessage = isMobile || isTablet 
        ? "Voice recognition is not supported on this mobile browser. Try Chrome or Safari on mobile."
        : "Voice recognition is not supported in this browser. Try Chrome, Edge, or Safari.";
      
      toast({
        title: "Voice Not Supported",
        description: browserMessage,
        variant: "destructive",
      });
      return;
    }

    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Error",
        description: "Voice recognition is not initialized. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (isVoiceActive || isListening) {
      // Stop recording
      try {
        recognitionRef.current.stop();
        setIsVoiceActive(false);
        setIsListening(false);
        setInterimTranscript('');
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsVoiceActive(false);
        setIsListening(false);
        setInterimTranscript('');
      }
    } else {
      // Start recording with mobile-optimized permission handling
      try {
        // Enhanced permission check for mobile devices
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            // Request audio permission with mobile-specific constraints
            const constraints = {
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                ...(isMobile && { 
                  sampleRate: 16000, // Lower sample rate for mobile
                  channelCount: 1     // Mono for mobile
                })
              }
            };
            
            await navigator.mediaDevices.getUserMedia(constraints);
            
            // Start speech recognition with mobile retry logic
            try {
              recognitionRef.current.start();
              setIsVoiceActive(true);
              
              // Show different messages for mobile vs desktop
              const successMessage = isMobile || isTablet
                ? "Tap the microphone button again when you're done speaking."
                : "Click the microphone button again when you're done speaking.";
              
              toast({
                title: "Voice Input Started", 
                description: successMessage,
              });
            } catch (recognitionError) {
              console.error('Error starting speech recognition:', recognitionError);
              toast({
                title: "Voice Recognition Error",
                description: "Unable to start voice recognition. Please try again.",
                variant: "destructive",
              });
            }
          } catch (permissionError) {
            console.error('Microphone permission denied:', permissionError);
            toast({
              title: "Microphone Access Required",
              description: "Please allow microphone access to use voice input, then try again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Microphone Not Available",
            description: "Your browser doesn't support microphone access.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error in voice input setup:', error);
        toast({
          title: "Voice Input Error",
          description: "Unable to set up voice input. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Start new conversation
  const startNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: coach.greeting,
        timestamp: new Date()
      }
    ]);
    
    toast({
      title: "New Conversation Started",
      description: `You're now in a fresh conversation with your ${coach.name}.`
    });
  };
  
  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/coach-conversations/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      return response.json();
    },
    onSuccess: () => {
      // Refresh conversation list
      refetchConversations();
      
      // Start a new conversation
      startNewConversation();
      
      toast({
        title: "Conversation History Deleted",
        description: "Your conversation history has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: `Unable to delete conversation: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle conversation deletion
  const handleDeleteConversation = () => {
    if (conversationId) {
      deleteConversationMutation.mutate(conversationId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback style={{ backgroundColor: coach.color }}>
              {coach.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{coach.name}</CardTitle>
            <CardDescription>{coach.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto pb-0">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.filter(msg => msg.role !== "system").map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-0.5 mx-2 flex-shrink-0">
                      <AvatarFallback style={{ backgroundColor: coach.color }}>
                        {coach.avatar}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {msg.role === "user" && (
                    <div className="h-8 w-8 mt-0.5 mx-2 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  
                  <div 
                    className={`p-3 rounded-lg ${
                      msg.role === 'assistant' 
                        ? `bg-${coach.color.replace('#', '')}/10` 
                        : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <div className="text-xs text-neutral-400 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-start max-w-[75%]">
                <Avatar className="h-8 w-8 mt-0.5 mx-2 flex-shrink-0">
                  <AvatarFallback style={{ backgroundColor: coach.color }}>
                    {coach.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className={`p-3 rounded-lg bg-${coach.color.replace('#', '')}/10`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-4">
        <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
          <Button
            type="button"
            size="icon"
            variant={isVoiceActive || isListening ? "destructive" : "outline"}
            onClick={toggleVoiceInput}
            onTouchStart={(e) => {
              // Prevent touch delay on mobile
              e.preventDefault();
              toggleVoiceInput();
            }}
            className={`flex-shrink-0 relative min-h-[44px] min-w-[44px] touch-manipulation ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''} md:min-h-[40px] md:min-w-[40px]`}
            title={isListening ? "Listening... Tap to stop" : "Start voice input"}
          >
            {isVoiceActive || isListening ? (
              <>
                <MicOff className="h-5 w-5 md:h-4 md:w-4 text-white" />
                {isListening && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                )}
              </>
            ) : (
              <Mic className="h-5 w-5 md:h-4 md:w-4" />
            )}
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={startNewConversation}
            className="flex-shrink-0"
            title="Start new conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {conversationId && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="flex-shrink-0"
                  title="Delete conversation history"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Delete Conversation History
                  </DialogTitle>
                  <DialogDescription>
                    Deleting your conversation history may impact the coach's ability to provide
                    accurate healing guidance based on your past interactions. Your coach learns
                    about your specific healing needs through your conversations.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                  <p className="font-medium">Important:</p>
                  <p className="mt-1">Your healing journey is progressive, and past conversations help your coach provide personalized guidance. Deleting history may reduce the effectiveness of future healing insights.</p>
                </div>
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteConversation}
                    disabled={deleteConversationMutation.isPending}
                  >
                    {deleteConversationMutation.isPending ? (
                      <>
                        <span className="mr-2">Deleting...</span>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Delete History'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <div className="relative flex-grow">
            <Input
              placeholder={isListening ? "Listening... Speak now" : `Message your ${coach.name}...`}
              value={message + (interimTranscript ? ` ${interimTranscript}` : '')}
              onChange={(e) => setMessage(e.target.value)}
              className={`pr-10 ${isListening ? 'border-red-300 bg-red-50' : ''}`}
              disabled={chatMutation.isPending || isListening}
            />
            {isListening && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            )}
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-neutral-400"
              disabled={!message.trim() || chatMutation.isPending || isListening}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </div>
  );
}
