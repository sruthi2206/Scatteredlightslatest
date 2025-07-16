import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chakras, getChakraStatus, getOverallChakraBalance, getChakraRecommendations } from "@/lib/chakras";
import { ChevronDown, ChevronUp, Download, FilePlus, FileText, ClipboardList } from "lucide-react";

interface ChakraVisualizationProps {
  chakraProfile?: any;
}

export default function ChakraVisualization({ chakraProfile }: ChakraVisualizationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [expandedChakra, setExpandedChakra] = useState<string | null>(null);
  
  // Create state for chakra values (initialize from profile only if exists)
  const [chakraValues, setChakraValues] = useState<Record<string, number>>(() => {
    // If no profile exists, we'll just use empty values and show assessment prompt
    if (!chakraProfile) return {
      crown: 0,
      thirdEye: 0,
      throat: 0,
      heart: 0,
      solarPlexus: 0,
      sacral: 0,
      root: 0
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
  
  // Mutation for updating chakra profile
  const updateChakraMutation = useMutation({
    mutationFn: async (values: Record<string, number>) => {
      const response = await apiRequest("PATCH", `/api/chakra-profiles/${chakraProfile?.id}`, {
        crownChakra: values.crown,
        thirdEyeChakra: values.thirdEye,
        throatChakra: values.throat,
        heartChakra: values.heart,
        solarPlexusChakra: values.solarPlexus,
        sacralChakra: values.sacral,
        rootChakra: values.root
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${chakraProfile?.userId}/chakra-profile`] });
      toast({
        title: "Chakra Profile Updated",
        description: "Your energy balance has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your chakra profile.",
        variant: "destructive",
      });
    }
  });
  
  // Handle chakra value changes
  const handleChakraChange = (chakra: string, value: number[]) => {
    setChakraValues(prev => ({ ...prev, [chakra]: value[0] }));
  };
  
  // Handle save button click
  const handleSave = () => {
    if (chakraProfile?.id) {
      updateChakraMutation.mutate(chakraValues);
    }
  };

  // Toggle expanded chakra details
  const toggleExpandChakra = (key: string) => {
    if (expandedChakra === key) {
      setExpandedChakra(null);
    } else {
      setExpandedChakra(key);
    }
  };

  // For new users, they might have a chakra profile with default values
  // We need to check if their profile is just the default one with all values set to 5
  const isDefaultProfile = chakraProfile && 
    chakraProfile.crownChakra === 5 && 
    chakraProfile.thirdEyeChakra === 5 && 
    chakraProfile.throatChakra === 5 && 
    chakraProfile.heartChakra === 5 && 
    chakraProfile.solarPlexusChakra === 5 && 
    chakraProfile.sacralChakra === 5 && 
    chakraProfile.rootChakra === 5;
    
  // We should only show assessment UI if they have actually completed an assessment
  // This means they have a profile AND it doesn't have just the default values
  const hasCompletedAssessment = chakraProfile !== null && 
                                 chakraProfile !== undefined && 
                                 !isDefaultProfile;
                                 
  // If user hasn't completed an assessment, use default text instead of score
  const overallBalance = hasCompletedAssessment 
    ? getOverallChakraBalance(chakraValues)
    : { score: 0, status: "Not Assessed", description: "You haven't completed a chakra assessment yet. Take your first assessment to discover your unique energy profile." };
  
  // Get personalized recommendations
  const recommendations = getChakraRecommendations(chakraValues);

  // Generate PDF report function
  const generatePdfReport = () => {
    toast({
      title: "Report Generated",
      description: "Your detailed chakra assessment report has been downloaded.",
    });
    // In a real implementation, this would generate and download a PDF
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Your Chakra Balance</h2>
        <p className="text-neutral-600 max-w-xl mx-auto mb-4">
          Explore your energy centers and receive personalized insights based on your unique chakra configuration.
        </p>
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg blur-lg opacity-70 animate-pulse"></div>
          <Button 
            onClick={() => setLocation('/chakra-assessment')}
            className="relative mx-auto bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg shadow-purple-200 transform hover:scale-105 transition-all"
            size="lg"
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Take Guided Chakra Assessment
          </Button>
        </div>
        <div className="mt-4 px-4 py-2 bg-purple-50 rounded-lg inline-block border border-purple-100">
          <p className="text-sm text-purple-800 font-medium">✨ Discover your complete energy profile with our in-depth assessment! ✨</p>
        </div>
      </div>
      
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="assessment">Detailed Assessment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Visualization</CardTitle>
                <CardDescription>
                  A visual representation of your chakra balance
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <div className="relative">
                  {/* Human body silhouette */}
                  <div className="absolute inset-0 flex justify-center pointer-events-none">
                    <div className="h-full w-1 bg-neutral-200"></div>
                  </div>
                  
                  {/* Chakra points on body */}
                  {chakras.map((chakra, index) => (
                    <motion.div
                      key={chakra.key}
                      className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                      style={{ 
                        top: `${(index * 14) + 5}%`, 
                        zIndex: 10 
                      }}
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ 
                        scale: [0.8, 1, 0.8], 
                        opacity: [0.7, chakraValues[chakra.key] / 10, 0.7] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div 
                        className="rounded-full shadow-md border-2 border-white"
                        style={{ 
                          width: `${(chakraValues[chakra.key] * 5) + 20}px`, 
                          height: `${(chakraValues[chakra.key] * 5) + 20}px`,
                          backgroundColor: chakra.color,
                        }}
                      ></div>
                    </motion.div>
                  ))}
                  
                  {/* Human figure outline - simplified */}
                  <svg 
                    className="h-[500px] w-auto opacity-20 pointer-events-none"
                    viewBox="0 0 100 300"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path d="M50,10 C60,10 70,20 70,35 C70,50 60,60 50,60 C40,60 30,50 30,35 C30,20 40,10 50,10 Z" fill="#888" /> {/* Head */}
                    <path d="M50,60 L50,130 M30,70 L70,70" fill="none" stroke="#888" strokeWidth="4" /> {/* Torso and shoulders */}
                    <path d="M30,70 L20,110 L25,110" fill="none" stroke="#888" strokeWidth="3" /> {/* Left arm */}
                    <path d="M70,70 L80,110 L75,110" fill="none" stroke="#888" strokeWidth="3" /> {/* Right arm */}
                    <path d="M50,130 L40,200 L40,270" fill="none" stroke="#888" strokeWidth="3" /> {/* Left leg */}
                    <path d="M50,130 L60,200 L60,270" fill="none" stroke="#888" strokeWidth="3" /> {/* Right leg */}
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-md blur opacity-60 animate-pulse"></div>
                  <Button 
                    onClick={() => setLocation('/chakra-assessment')}
                    className="w-full relative bg-[#7c3aed] hover:bg-opacity-90"
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Take Full Chakra Assessment
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {/* Chakra Sliders */}
            <Card>
              <CardHeader>
                <CardTitle>Adjust Your Chakras</CardTitle>
                <CardDescription>
                  Slide to match your current energy state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {chakras.map((chakra) => {
                    const status = getChakraStatus(chakraValues[chakra.key]);
                    return (
                      <div key={chakra.key}>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: chakra.color }}
                            ></div>
                            <span className="font-medium">{chakra.name}</span>
                          </div>
                          <span 
                            className="text-sm" 
                            style={{ color: chakra.color }}
                          >
                            {status.status}
                          </span>
                        </div>
                        <Slider
                          value={[chakraValues[chakra.key]]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) => handleChakraChange(chakra.key, value)}
                          className="mb-1"
                        />
                        <div className="text-xs text-neutral-500 flex justify-between">
                          <span>Blocked</span>
                          <span>Balanced</span>
                          <span>Overactive</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Button 
                    onClick={handleSave} 
                    className="w-full bg-[#483D8B] hover:bg-opacity-90 mt-4"
                    disabled={updateChakraMutation.isPending}
                  >
                    {updateChakraMutation.isPending ? "Saving..." : "Save Chakra Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Balance Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Chakra Balance</CardTitle>
              <CardDescription>
                {hasCompletedAssessment 
                  ? "Your unique energy pattern and overall balance assessment" 
                  : "Complete your first assessment to see your energy profile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCompletedAssessment ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-medium">{overallBalance.status}</h3>
                      <p className="text-sm text-neutral-600">Balance Score: {overallBalance.score} / 10</p>
                    </div>
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="3"
                          strokeDasharray={`${overallBalance.score * 10}, 100`}
                        />
                        <text x="18" y="20.5" textAnchor="middle" fill="#444" className="text-2xl font-semibold">
                          {overallBalance.score}
                        </text>
                      </svg>
                    </div>
                  </div>
                  <p className="text-neutral-700">{overallBalance.description}</p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-40 h-40 mb-6 rounded-full bg-purple-50 flex items-center justify-center">
                    <FilePlus className="h-16 w-16 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Assessment Yet</h3>
                  <p className="text-neutral-600 mb-6">You haven't completed a chakra assessment yet. Take your first assessment to discover your unique energy profile.</p>
                  <Button 
                    onClick={() => setLocation('/chakra-assessment')}
                    className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg"
                    size="lg"
                  >
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Start Chakra Assessment
                  </Button>
                </div>
              )}
            </CardContent>
            {hasCompletedAssessment && (
              <CardFooter>
                <div className="flex flex-col md:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setLocation('/chakra-assessment')}
                  >
                    Update Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setLocation('/chakra-report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Detailed Report
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="assessment" className="space-y-6">
          {/* Detailed Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Your Comprehensive Chakra Assessment</CardTitle>
              <CardDescription>
                Detailed analysis of each of your energy centers with personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {chakras.map((chakra) => {
                const status = getChakraStatus(chakraValues[chakra.key]);
                const isExpanded = expandedChakra === chakra.key;
                
                return (
                  <div key={chakra.key} className="border rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50"
                      onClick={() => toggleExpandChakra(chakra.key)}
                      style={{ borderLeft: `4px solid ${chakra.color}` }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full mr-3"
                          style={{ backgroundColor: chakra.color }}
                        ></div>
                        <div>
                          <h3 className="font-medium">{chakra.name} ({chakra.sanskritName})</h3>
                          <p className="text-xs text-neutral-500">{status.status} - {chakraValues[chakra.key]}/10</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-neutral-50 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">About this Chakra</h4>
                            <p className="text-sm mb-3">{chakra.detailedDescription}</p>
                            <h4 className="text-sm font-semibold mb-2">Physical Associations</h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {chakra.physicalAssociations.map((item, index) => (
                                <span key={index} className="text-xs bg-neutral-200 px-2 py-1 rounded-full">
                                  {item}
                                </span>
                              ))}
                            </div>
                            <h4 className="text-sm font-semibold mb-2">Psychological Associations</h4>
                            <div className="flex flex-wrap gap-1">
                              {chakra.psychologicalAssociations.map((item, index) => (
                                <span key={index} className="text-xs bg-neutral-200 px-2 py-1 rounded-full">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Your Current Status</h4>
                            <p className="text-sm mb-3">{status.description}</p>
                            
                            {status.level === "balanced" ? (
                              <>
                                <h4 className="text-sm font-semibold mb-2">Balanced Traits You May Experience</h4>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {chakra.balancedTraits.map((trait, index) => (
                                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      {trait}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm">{chakra.balancedState}</p>
                              </>
                            ) : status.level === "overactive" ? (
                              <>
                                <h4 className="text-sm font-semibold mb-2">Overactive Symptoms You May Experience</h4>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {chakra.overactiveSymptoms.map((symptom, index) => (
                                    <span key={index} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                                <h4 className="text-sm font-semibold mb-2">Healing Practices</h4>
                                <div className="flex flex-wrap gap-1">
                                  {chakra.healingPractices.slice(0, 4).map((practice, index) => (
                                    <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                      {practice}
                                    </span>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <>
                                <h4 className="text-sm font-semibold mb-2">Underactive Symptoms You May Experience</h4>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {chakra.underactiveSymptoms.map((symptom, index) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                                <h4 className="text-sm font-semibold mb-2">Healing Practices</h4>
                                <div className="flex flex-wrap gap-1">
                                  {chakra.healingPractices.slice(0, 4).map((practice, index) => (
                                    <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                      {practice}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t pt-3 mt-3">
                          <h4 className="text-sm font-semibold mb-2">Affirmations for {chakra.name}</h4>
                          <ul className="list-disc pl-5 text-sm">
                            {chakra.affirmations.map((affirmation, index) => (
                              <li key={index} className="mb-1">{affirmation}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Recommendations</CardTitle>
              <CardDescription>
                Based on your unique chakra assessment, we've created a personalized healing plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Focus Areas */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Priority Focus Areas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {recommendations.focusAreas.length > 0 ? (
                      recommendations.focusAreas.map((area, index) => (
                        <Card key={index} className="bg-neutral-50">
                          <CardContent className="p-4">
                            <p className="font-medium">{area}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-neutral-600">Complete the chakra assessment to receive personalized focus areas.</p>
                    )}
                  </div>
                </div>
                
                {/* Recommended Practices */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Recommended Healing Practices</h3>
                  <div className="space-y-2">
                    {recommendations.practices.length > 0 ? (
                      recommendations.practices.map((practice, index) => (
                        <div key={index} className="flex items-start p-3 border rounded-lg">
                          <div className="bg-purple-100 p-2 rounded-full mr-3">
                            <FilePlus className="w-5 h-5 text-purple-700" />
                          </div>
                          <div>
                            <p>{practice}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-neutral-600">Complete the chakra assessment to receive personalized healing practices.</p>
                    )}
                  </div>
                </div>
                
                {/* Personalized Insights */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Your Personalized Insights</h3>
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <FileText className="w-6 h-6 text-purple-700 mr-3 mt-1" />
                        <p>{recommendations.insights}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={generatePdfReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button 
                className="bg-[#483D8B] hover:bg-opacity-90"
                onClick={() => window.location.href = `/coach/integration`}
              >
                Book a Healing Session
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
