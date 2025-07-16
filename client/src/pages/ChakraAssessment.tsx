import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { chakras, getChakraStatus } from "@/lib/chakras";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ChakraWheel from "@/components/ChakraWheel";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import EnhancedChakraQuiz from "@/components/EnhancedChakraQuiz";
import ChakraIntroduction from "@/components/ChakraIntroduction";

export default function ChakraAssessment() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("manual");
  const [completeStep, setCompleteStep] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  
  // Fetch user's chakra profile (only if authenticated)
  const { data: chakraProfile, isLoading: isLoadingChakraProfile } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/chakra-profile`);
        if (!res.ok) {
          if (res.status === 404) {
            return null;
          }
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
  
  // Create state for chakra values (initialize from profile or default)
  const [chakraValues, setChakraValues] = useState<Record<string, number>>(() => {
    if (!chakraProfile) return {
      crown: 5,
      thirdEye: 5,
      throat: 5,
      heart: 5,
      solarPlexus: 5,
      sacral: 5,
      root: 5
    };
    
    return {
      crown: chakraProfile.crownChakra,
      thirdEye: chakraProfile.thirdEyeChakra,
      throat: chakraProfile.throatChakra,
      heart: chakraProfile.heartChakra,
      solarPlexus: chakraProfile.solarPlexusChakra,
      sacral: chakraProfile.sacralChakra,
      root: chakraProfile.rootChakra
    };
  });
  
  // Handle chakra value changes in manual adjustment
  const handleChakraChange = (chakra: string, value: number[]) => {
    setChakraValues(prev => ({ ...prev, [chakra]: value[0] }));
  };
  
  // Handle quiz completion
  const handleQuizComplete = (quizValues: Record<string, number>) => {
    setChakraValues(quizValues);
    setCompleteStep(true);
  };
  
  // Mutation for saving chakra profile
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        // Round all values to integers to avoid floating point errors
        const roundedValues = {
          crown: Math.round(chakraValues.crown),
          thirdEye: Math.round(chakraValues.thirdEye),
          throat: Math.round(chakraValues.throat),
          heart: Math.round(chakraValues.heart),
          solarPlexus: Math.round(chakraValues.solarPlexus),
          sacral: Math.round(chakraValues.sacral),
          root: Math.round(chakraValues.root)
        };
        
        console.log("Original values:", chakraValues);
        console.log("Rounded values:", roundedValues);
        
        if (chakraProfile) {
          // Update existing profile
          console.log("Updating existing profile:", chakraProfile.id);
          
          const response = await apiRequest("PATCH", `/api/chakra-profiles/${chakraProfile.id}`, {
            crownChakra: roundedValues.crown,
            thirdEyeChakra: roundedValues.thirdEye,
            throatChakra: roundedValues.throat,
            heartChakra: roundedValues.heart,
            solarPlexusChakra: roundedValues.solarPlexus,
            sacralChakra: roundedValues.sacral,
            rootChakra: roundedValues.root
          });
          
          return await response.json();
        } else {
          // Create new profile
          console.log("Creating new profile for user:", user.id);
          
          const response = await apiRequest("POST", "/api/chakra-profiles", {
            userId: user.id,
            crownChakra: roundedValues.crown,
            thirdEyeChakra: roundedValues.thirdEye,
            throatChakra: roundedValues.throat,
            heartChakra: roundedValues.heart,
            solarPlexusChakra: roundedValues.solarPlexus,
            sacralChakra: roundedValues.sacral,
            rootChakra: roundedValues.root
          });
          
          return await response.json();
        }
      } catch (err) {
        console.error("Error in mutation function:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Profile saved successfully:", data);
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/chakra-profile`] });
        toast({
          title: "Chakra Profile Saved",
          description: "Your chakra assessment has been successfully saved.",
        });
        setTimeout(() => {
          window.location.href = "/chakra-report";
        }, 500);
      }
    },
    onError: (error) => {
      console.error("Error in saveProfileMutation:", error);
      toast({
        title: "Error Saving Profile",
        description: `There was a problem saving your chakra assessment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle completion for unauthenticated users
  const handleUnauthenticatedCompletion = () => {
    toast({
      title: "Assessment Complete!",
      description: "Please log in to save your results and get your personalized chakra report.",
    });
    setTimeout(() => {
      setLocation("/auth");
    }, 1500);
  };

  // Handle save button click
  const handleSave = () => {
    if (user) {
      saveProfileMutation.mutate();
    } else {
      handleUnauthenticatedCompletion();
    }
  };
  
  // For unauthenticated users, we'll handle completion differently
  
  if (isLoadingChakraProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            Chakra Assessment
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto mb-6">
            Evaluate your energy centers to receive personalized insights and healing recommendations
          </p>
          
          {!showIntroduction && (
            <div className="max-w-md mx-auto">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg blur-lg opacity-70 animate-pulse"></div>
                <Button 
                  onClick={() => {
                    // Show quiz directly without showing tabs
                    setActiveTab("quiz");
                    // Start a new quiz immediately
                    setCompleteStep(false);
                  }}
                  className="relative w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg shadow-purple-200 transform hover:scale-105 transition-all"
                  size="lg"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Start Guided Chakra Assessment
                </Button>
              </div>
              <div className="px-4 py-2 bg-purple-50 rounded-lg inline-block border border-purple-100">
                <p className="text-sm text-purple-800 font-medium">✨ Discover your complete energy profile with our in-depth assessment! ✨</p>
              </div>
            </div>
          )}
        </motion.div>
        
        {showIntroduction ? (
          <ChakraIntroduction onStartTest={() => setShowIntroduction(false)} />
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Always show either the quiz or its results */}
            {completeStep ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Check className="w-6 h-6 mr-2 text-green-500" />
                    Assessment Completed
                  </CardTitle>
                  <CardDescription>
                    Your chakra profile has been calculated based on your responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-center">
                      <ChakraWheel 
                        size={250} 
                        animated={true} 
                        values={chakraValues}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Chakra Results</h3>
                      <div className="space-y-3">
                        {chakras.map((chakra) => {
                          const status = getChakraStatus(chakraValues[chakra.key]);
                          return (
                            <div key={chakra.key} className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: chakra.color }}
                              ></div>
                              <span className="font-medium w-24">{chakra.name}:</span>
                              <div className="relative flex-1 h-3 bg-neutral-100 rounded">
                                <div 
                                  className="absolute top-0 left-0 h-full rounded"
                                  style={{ 
                                    width: `${chakraValues[chakra.key] * 10}%`,
                                    backgroundColor: chakra.color 
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium" style={{ color: chakra.color }}>
                                {chakraValues[chakra.key]}/10
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSave} 
                    className="w-full bg-[#483D8B] hover:bg-opacity-90"
                    disabled={saveProfileMutation.isPending}
                  >
                    {saveProfileMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {user ? "Save and Continue to Report" : "Complete Assessment"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <EnhancedChakraQuiz 
                onComplete={handleQuizComplete} 
                isSubmitting={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}