import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Filter, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RitualCard } from "@/components/RitualCard";

// Chakra colors for visual association
const chakraColors: Record<string, { color: string, bg: string, icon: string }> = {
  crown: { color: "#7B68EE", bg: "#7B68EE20", icon: "👑" },
  third_eye: { color: "#9370DB", bg: "#9370DB20", icon: "👁️" },
  throat: { color: "#00BFFF", bg: "#00BFFF20", icon: "🗣️" },
  heart: { color: "#3CB371", bg: "#3CB37120", icon: "💚" },
  solar_plexus: { color: "#FFD700", bg: "#FFD70020", icon: "☀️" },
  sacral: { color: "#FF7F50", bg: "#FF7F5020", icon: "🧡" },
  root: { color: "#DC143C", bg: "#DC143C20", icon: "🔴" },
  all: { color: "#9C27B0", bg: "#9C27B020", icon: "✨" }
};

// Emotion categories
const emotionColors: Record<string, { color: string, bg: string }> = {
  anxiety: { color: "#E91E63", bg: "#E91E6320" },
  depression: { color: "#673AB7", bg: "#673AB720" },
  anger: { color: "#F44336", bg: "#F4433620" },
  fear: { color: "#9C27B0", bg: "#9C27B020" },
  grief: { color: "#607D8B", bg: "#607D8B20" },
  shame: { color: "#795548", bg: "#79554820" },
  guilt: { color: "#FF5722", bg: "#FF572220" },
  confusion: { color: "#FF9800", bg: "#FF980020" },
  doubt: { color: "#9E9E9E", bg: "#9E9E9E20" },
  joy: { color: "#4CAF50", bg: "#4CAF5020" },
  all: { color: "#2196F3", bg: "#2196F320" }
};

// Type definitions
type HealingRitual = {
  id: number;
  name: string;
  type: string;
  description: string;
  instructions: string;
  targetChakra: string | null;
  targetEmotion: string | null;
  thumbnailUrl?: string;
  mainImageUrl?: string;
  courseUrl?: string;
  videoUrl?: string;
  duration?: string;
};

type UserRecommendation = {
  id: number;
  userId: number;
  ritualId: number;
  completed: boolean;
  createdAt: string;
  ritual?: HealingRitual;
};

export default function HealingRitualsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("recommended");
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [selectedRitual, setSelectedRitual] = useState<HealingRitual | null>(null);
  const [filterChakra, setFilterChakra] = useState<string | null>(null);
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all healing rituals
  const { data: healingRituals = [], isLoading: isLoadingRituals } = useQuery({
    queryKey: ['/api/healing-rituals', filterChakra, filterEmotion],
    queryFn: async ({ queryKey }) => {
      if (!user) return [];
      
      const baseUrl = '/api/healing-rituals';
      let url = baseUrl;
      const params = new URLSearchParams();
      
      if (filterChakra) {
        params.append('targetChakra', filterChakra);
      }
      
      if (filterEmotion) {
        params.append('targetEmotion', filterEmotion);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch healing rituals');
        return await res.json();
      } catch (error) {
        console.error('Error fetching healing rituals:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch user recommendations
  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/users', user?.id, 'recommendations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/recommendations`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        return await res.json();
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Create recommendation mutation
  const createRecommendationMutation = useMutation({
    mutationFn: async (ritualId: number) => {
      const response = await apiRequest("POST", "/api/user-recommendations", {
        userId: user?.id,
        ritualId
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to add to your practices');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Added to your practices",
      });
      // Invalidate recommendations cache
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'recommendations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete recommendation mutation
  const completeRecommendationMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/user-recommendations/${id}`, {
        completed
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update practice');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Practice status updated",
      });
      // Invalidate recommendations cache
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'recommendations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle add to practices
  const handleAddToPractices = (ritual: HealingRitual) => {
    createRecommendationMutation.mutate(ritual.id);
  };

  // Handle complete practice
  const handleCompletePractice = (recommendation: UserRecommendation) => {
    completeRecommendationMutation.mutate({
      id: recommendation.id,
      completed: !recommendation.completed
    });
  };

  // Handle opening ritual details
  const handleOpenRitual = (ritual: HealingRitual) => {
    // Always direct to the course page format, even if courseUrl is not set
    setLocation(`/courses/${ritual.id}`);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilterChakra(null);
    setFilterEmotion(null);
  };

  // Determine if ritual is already in user's recommendations
  const isInRecommendations = (ritualId: number) => {
    return recommendations.some((rec: UserRecommendation) => rec.ritualId === ritualId);
  };

  // Get recommendation for a ritual if it exists
  const getRecommendation = (ritualId: number) => {
    return recommendations.find((rec: UserRecommendation) => rec.ritualId === ritualId);
  };
  
  // Get thumbnail image for a ritual
  const getThumbnailImage = (ritual: HealingRitual) => {
    if (ritual.thumbnailUrl) return ritual.thumbnailUrl;
    
    // Try to use the uploaded image if available
    if (ritual.id) {
      const potentialPath = `/uploads/${ritual.id}_thumbnail.jpg`;
      return potentialPath; // The error handler in RitualCard will manage fallbacks
    }
    
    return "/images/placeholder-ritual.jpg";
  };

  // Map chakra name to image path
  const getChakraImagePath = (chakraName: string | null) => {
    if (!chakraName) return "/images/chakra_balance.jpg";
    
    const chakraName_lower = chakraName.toLowerCase();
    if (chakraName_lower.includes('crown')) return "/images/crown_chakra.jpg";
    if (chakraName_lower.includes('third eye')) return "/images/third_eye.jpg";
    if (chakraName_lower.includes('throat')) return "/images/throat_chakra.jpg";
    if (chakraName_lower.includes('heart')) return "/images/heart_chakra.jpg";
    if (chakraName_lower.includes('solar plexus')) return "/images/solar_plexus.jpg";
    if (chakraName_lower.includes('sacral')) return "/images/sacral_chakra.jpg";
    if (chakraName_lower.includes('root')) return "/images/root_chakra.jpg";
    
    return "/images/chakra_balance.jpg";
  };

  // Loading state
  const isLoading = isLoadingRituals || isLoadingRecommendations;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Coming Soon Overlay */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔮</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Healing Rituals
              </h2>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <span className="text-sm font-semibold text-purple-700">Coming Soon</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're crafting personalized healing rituals and practices to support your spiritual journey. This feature will be available soon!
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => setShowComingSoon(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Preview Current Content
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      )}
   
      <header className="sticky top-0 z-10 border-b bg-white py-3 shadow-sm">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Healing Rituals</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                  {(filterChakra || filterEmotion) && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                      <span className="sr-only">Active filters</span>
                      {(filterChakra && filterEmotion) ? 2 : 1}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chakra Focus</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries({ all: { name: "All Chakras" }, ...{
                  crown: { name: "Crown Chakra" },
                  third_eye: { name: "Third Eye Chakra" },
                  throat: { name: "Throat Chakra" },
                  heart: { name: "Heart Chakra" },
                  solar_plexus: { name: "Solar Plexus Chakra" },
                  sacral: { name: "Sacral Chakra" },
                  root: { name: "Root Chakra" }
                }}).map(([key, { name }]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => setFilterChakra(key === 'all' ? null : key)}
                    className="flex items-center gap-2"
                  >
                    {key !== 'all' && (
                      <span 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: chakraColors[key]?.color || '#ccc' }}
                      />
                    )}
                    <span>{name}</span>
                    {filterChakra === key || (key === 'all' && !filterChakra) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Emotional Support</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries({ all: { name: "All Emotions" }, ...{
                  anxiety: { name: "Anxiety" },
                  depression: { name: "Depression" },
                  anger: { name: "Anger" },
                  fear: { name: "Fear" },
                  grief: { name: "Grief" },
                  shame: { name: "Shame" },
                  guilt: { name: "Guilt" },
                  confusion: { name: "Confusion" },
                  doubt: { name: "Doubt" },
                  joy: { name: "Joy" }
                }}).map(([key, { name }]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => setFilterEmotion(key === 'all' ? null : key)}
                    className="flex items-center gap-2"
                  >
                    {key !== 'all' && (
                      <span 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: emotionColors[key]?.color || '#ccc' }}
                      />
                    )}
                    <span>{name}</span>
                    {filterEmotion === key || (key === 'all' && !filterEmotion) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
                
                {(filterChakra || filterEmotion) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleClearFilters}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear All Filters</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Filter indicators */}
        {(filterChakra || filterEmotion) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filterChakra && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <span 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chakraColors[filterChakra]?.color || '#ccc' }}
                />
                {filterChakra.replace('_', ' ')} Chakra
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setFilterChakra(null)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )}
            
            {filterEmotion && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <span 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: emotionColors[filterEmotion]?.color || '#ccc' }}
                />
                {filterEmotion} support
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setFilterEmotion(null)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Tabs for different ritual lists */}
        <Tabs
          defaultValue="recommended"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommended">Your Practices</TabsTrigger>
            <TabsTrigger value="all">All Rituals</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Your Recommendations Tab */}
              <TabsContent value="recommended" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Your Healing Practices</h2>
                {recommendations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
                    <h3 className="font-medium mb-2">No practices yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore the rituals tab to add healing practices to your journey
                    </p>
                    <Button 
                      onClick={() => setActiveTab("all")} 
                      variant="outline"
                    >
                      Explore Rituals
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-5xl mx-auto">
                    {recommendations.map((recommendation: UserRecommendation) => {
                      const ritual = recommendation.ritual;
                      if (!ritual) return null;
                      
                      return (
                        <motion.div
                          key={recommendation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RitualCard
                            title={ritual.name}
                            description={ritual.description}
                            chakraType={ritual.targetChakra}
                            isCompleted={recommendation.completed}
                            mainImageUrl={getChakraImagePath(ritual.targetChakra)}
                            thumbnailUrl={getThumbnailImage(ritual)}
                            onDetails={() => handleOpenRitual(ritual)}
                            onAction={() => handleCompletePractice(recommendation)}
                            actionLabel={recommendation.completed ? "Completed" : "Mark Complete"}
                            showCompletedBadge={true}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              {/* All Available Rituals */}
              <TabsContent value="all" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Explore All Rituals</h2>
                <div className="space-y-8 max-w-5xl mx-auto">
                  {healingRituals.length > 0 ? (
                    healingRituals.map((ritual: any) => {
                      const recommendation = getRecommendation(ritual.id);
                      const isRecommended = !!recommendation;
                      
                      return (
                        <motion.div
                          key={ritual.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RitualCard
                            title={ritual.name}
                            description={ritual.description}
                            chakraType={ritual.targetChakra}
                            isCompleted={recommendation?.completed}
                            mainImageUrl={ritual.mainImageUrl || getChakraImagePath(ritual.targetChakra)}
                            thumbnailUrl={getThumbnailImage(ritual)}
                            onDetails={() => handleOpenRitual(ritual)}
                            onAction={() => handleAddToPractices(ritual)}
                            actionLabel="Add to Practice"
                            showCompletedBadge={isRecommended}
                          />
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
                      <h3 className="font-medium mb-2">No rituals found</h3>
                      <p className="text-muted-foreground">
                        {filterChakra || filterEmotion
                          ? "Try adjusting your filters to see more rituals."
                          : "There are no healing rituals available at the moment."}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      
      {/* Ritual Details Dialog */}
      {selectedRitual && (
        <Dialog open={!!selectedRitual} onOpenChange={(open) => !open && setSelectedRitual(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedRitual.name}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 mt-2">
                {selectedRitual.targetChakra && (
                  <Badge 
                    variant="outline"
                    style={{
                      borderColor: chakraColors[selectedRitual.targetChakra]?.color + '50',
                      backgroundColor: chakraColors[selectedRitual.targetChakra]?.bg,
                      color: chakraColors[selectedRitual.targetChakra]?.color
                    }}
                  >
                    {selectedRitual.targetChakra}
                  </Badge>
                )}
                {selectedRitual.targetEmotion && (
                  <Badge 
                    variant="outline"
                    style={{
                      borderColor: emotionColors[selectedRitual.targetEmotion]?.color + '50',
                      backgroundColor: emotionColors[selectedRitual.targetEmotion]?.bg,
                      color: emotionColors[selectedRitual.targetEmotion]?.color
                    }}
                  >
                    {selectedRitual.targetEmotion}
                  </Badge>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Description</h3>
                <p className="text-gray-700">{selectedRitual.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Instructions</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {selectedRitual.instructions}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setSelectedRitual(null)}
              >
                Close
              </Button>
              
              {!isInRecommendations(selectedRitual.id) ? (
                <Button onClick={() => {
                  handleAddToPractices(selectedRitual);
                  setSelectedRitual(null);
                }}>
                  Add to My Practices
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700" 
                  disabled
                >
                  Already in Your Practices
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}