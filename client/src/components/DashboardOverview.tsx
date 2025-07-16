import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import ChakraWheel from "@/components/ChakraWheel";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Calendar, CheckCircle, Info, ExternalLink, Activity, Sparkles, ClipboardList } from "lucide-react";
import WorkshopVideo from "@/components/WorkshopVideo";

interface DashboardOverviewProps {
  chakraProfile?: any;
  journalEntries?: any[];
  emotionTrackings?: any[];
  recommendations?: any[];
}

export default function DashboardOverview({ 
  chakraProfile, 
  journalEntries = [], 
  emotionTrackings = [],
  recommendations = []
}: DashboardOverviewProps) {
  const [, setLocation] = useLocation();

  // Check if profile is just a default one
  const isDefaultProfile = (profile: any) => {
    return profile && 
      profile.crownChakra === 5 && 
      profile.thirdEyeChakra === 5 && 
      profile.throatChakra === 5 && 
      profile.heartChakra === 5 && 
      profile.solarPlexusChakra === 5 && 
      profile.sacralChakra === 5 && 
      profile.rootChakra === 5;
  };

  // Calculate average chakra balance (1-10 scale)
  const getAverageChakraBalance = (profile: any) => {
    if (!profile) return 0;
    
    const values = [
      profile.crownChakra,
      profile.thirdEyeChakra,
      profile.throatChakra,
      profile.heartChakra,
      profile.solarPlexusChakra,
      profile.sacralChakra,
      profile.rootChakra
    ];
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };
  
  // Get chakra values for visualization
  const getChakraValues = () => {
    // Only provide values if this is not a default profile
    if (!chakraProfile || isDefaultProfile(chakraProfile)) return undefined;
    
    return {
      crown: chakraProfile.crownChakra,
      thirdEye: chakraProfile.thirdEyeChakra,
      throat: chakraProfile.throatChakra,
      heart: chakraProfile.heartChakra,
      solarPlexus: chakraProfile.solarPlexusChakra,
      sacral: chakraProfile.sacralChakra,
      root: chakraProfile.rootChakra
    };
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Get completed rituals count
  const getCompletedRitualsCount = () => {
    return recommendations.filter(rec => rec.completed).length;
  };
  
  // Get top emotion tags
  const getTopEmotionTags = () => {
    const tags: Record<string, number> = {};
    
    journalEntries.forEach(entry => {
      if (entry.emotionTags) {
        entry.emotionTags.forEach((tag: string) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* First Column - Chakra Overview */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-md p-4 bg-white rounded-2xl hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle>Chakra Balance</CardTitle>
              <CardDescription>
                Your energy centers visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <ChakraWheel size={180} values={getChakraValues()} animated={true} />
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">Overall Balance</span>
                  <span className="font-medium">
                    {chakraProfile && !isDefaultProfile(chakraProfile) ? 
                      Math.round(getAverageChakraBalance(chakraProfile) * 10) + "%" : 
                      "Not assessed"}
                  </span>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 shadow-md"
                  onClick={() => setLocation('/chakra-assessment')}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Start Chakra Assessment
                </Button>
                
                <div className="text-center">
                  <Link href="/chakra-report">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-[#483D8B] p-0 h-auto hover:text-[#7c3aed]"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Second Column - Healing Journey */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-md p-4 bg-white rounded-2xl hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Healing Journey</CardTitle>
                  <CardDescription>
                    Recent insights and progress
                  </CardDescription>
                </div>
                <Link href="/journal">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Journal
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <div className="space-y-4">
                  {journalEntries.slice(0, 2).map((entry) => (
                    <div 
                      key={entry.id}
                      className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-sm text-neutral-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(entry.createdAt)}</span>
                        </div>
                        <div className="text-xs">
                          Sentiment: <span className="font-medium">{entry.sentimentScore}/10</span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2 line-clamp-2">
                        {entry.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {entry.emotionTags?.slice(0, 3).map((tag: string, i: number) => (
                          <Badge key={`emotion-${i}`} variant="secondary" className="text-xs bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20">
                            {tag}
                          </Badge>
                        ))}
                        
                        {entry.chakraTags?.slice(0, 2).map((tag: string, i: number) => (
                          <Badge key={`chakra-${i}`} variant="secondary" className="text-xs bg-[#483D8B]/10 text-[#483D8B] hover:bg-[#483D8B]/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-neutral-500 mb-3">No journal entries yet</div>
                  <Link href="/journal">
                    <Button className="bg-[#483D8B] hover:bg-opacity-90">
                      Start Journaling
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-md p-4 bg-white rounded-2xl hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle>Healing Practice</CardTitle>
              <CardDescription>
                Today's recommended ritual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div>
                  {(() => {
                    // Get first incomplete recommendation
                    const recommendation = recommendations.find(r => !r.completed);
                    if (!recommendation) {
                      return (
                        <div className="text-center py-2">
                          <div className="mb-2">
                            <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                          </div>
                          <div className="text-sm text-neutral-500 mb-3">
                            All practices completed!
                          </div>
                          <Link href="/healing-rituals">
                            <Button 
                              size="sm" 
                              className="bg-[#483D8B] hover:bg-opacity-90"   onClick={() => setLocation('/healing-rituals')}
                              
                            >
                              Find More Practices
                            </Button>
                          </Link>
                        </div>
                      );
                    }
                    
                    const ritual = recommendation.ritual;
                    
                    return (
                      <div>
                        <h3 className="font-medium text-lg mb-1">{ritual.name}</h3>
                        <p className="text-sm text-neutral-600 mb-3">{ritual.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">
                            {ritual.type.replace('_', ' ')}
                          </Badge>
                          {ritual.targetChakra && (
                            <Badge variant="outline" className="bg-[#483D8B]/10 text-[#483D8B] border-[#483D8B]/20">
                              {ritual.targetChakra}
                            </Badge>
                          )}
                        </div>
                        
                        <Link href="/healing-rituals">
                          <Button 
                            className="w-full bg-[#483D8B] hover:bg-opacity-90" onClick={() => setLocation('/healing-rituals')}
                          >
      View Practice Details
                          </Button>
                        </Link>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-sm text-neutral-500 mb-3">No practices added yet</div>
                  <Link href="/healing-rituals">
                    <Button 
                      size="sm" 
                      className="bg-[#483D8B] hover:bg-opacity-90"
                    >
                      Discover Practices
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
       
      </div>
      
      {/* Third Column - User Stats and Rewards */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-md p-4 bg-white rounded-2xl hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle>Your Journey Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-lavender/30 to-blue-100/30 p-3 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-[#483D8B]">
                      {journalEntries.length}
                    </div>
                    <div className="text-xs text-neutral-600">Journal Entries</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-lavender/30 to-blue-100/30 p-3 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-[#008080]">
                      {emotionTrackings.length}
                    </div>
                    <div className="text-xs text-neutral-600">Emotions Tracked</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-lavender/30 to-blue-100/30 p-3 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-[#7DF9FF]">
                      {getCompletedRitualsCount()}
                    </div>
                    <div className="text-xs text-neutral-600">Rituals Completed</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-lavender/30 to-blue-100/30 p-3 rounded-xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-[#FF69B4]">
                      {getTopEmotionTags().length}
                    </div>
                    <div className="text-xs text-neutral-600">Emotions Processed</div>
                  </div>
                </div>
                
                {getTopEmotionTags().length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Top Emotions</div>
                    <div className="flex flex-wrap gap-1">
                      {getTopEmotionTags().map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4]/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link href="/dashboard?tab=progress">
                 
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
