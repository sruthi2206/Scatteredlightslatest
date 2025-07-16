import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import ChakraVisualization from "@/components/ChakraVisualization";
import EmotionTracker from "@/components/EmotionTracker";
import JournalEntry from "@/components/JournalEntry";
import HealingRituals from "@/components/HealingRituals";
import DashboardOverview from "@/components/DashboardOverview";
import ProgressCharts from "@/components/ProgressCharts";
import ReferralSystem from "@/components/ReferralSystem";
import FloatingCTA from "@/components/FloatingCTA";
import EmotionAnalysisChart from "@/components/EmotionAnalysisChart";
import EmotionalJourneyLog from "@/components/EmotionalJourneyLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's chakra profile (priority 1)
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch user's journal entries (priority 2, delayed)
  const { data: journalEntries, isLoading: isLoadingJournalEntries } = useQuery({
    queryKey: ['/api/users', user?.id, 'journal-entries'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/journal-entries`);
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
    },
    enabled: !!user && !!chakraProfile,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Fetch user's emotion tracking (priority 3, only on specific tabs)
  const { data: emotionTrackings, isLoading: isLoadingEmotionTrackings } = useQuery({
    queryKey: ['/api/users', user?.id, 'emotion-tracking'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/emotion-tracking`);
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching emotion tracking:', error);
        return [];
      }
    },
    enabled: !!user && (activeTab === 'emotions' || activeTab === 'progress'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user's recommendations (priority 4, lazy load)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/users', user?.id, 'recommendations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/recommendations`);
        if (!res.ok) {
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    },
    enabled: !!user && (activeTab === 'rituals' || activeTab === 'overview'),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  const isLoading = isLoadingChakraProfile || isLoadingJournalEntries || 
                    isLoadingEmotionTrackings || isLoadingRecommendations;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/20 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            Welcome, {user.name}
          </h1>
          <p className="text-neutral-600">Track your healing journey and discover personalized insights</p>
        </motion.div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full justify-start overflow-x-auto rounded-none border-b border-neutral-200 bg-transparent p-0">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="chakra" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Chakra Balance
            </TabsTrigger>

            <TabsTrigger 
              value="journal" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Journal Insights
            </TabsTrigger>
          
           
            <TabsTrigger 
              value="emotions" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Emotional Journey
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-colors hover:text-neutral-900 data-[state=active]:border-[#483D8B] data-[state=active]:text-[#483D8B] data-[state=active]:shadow-none"
            >
              Progress
            </TabsTrigger>
          </TabsList>

          <div className="relative min-h-[60vh]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
              </div>
            ) : (
              <>
                <TabsContent value="overview" className="mt-0">
                  <DashboardOverview 
                    chakraProfile={chakraProfile} 
                    journalEntries={journalEntries} 
                    emotionTrackings={emotionTrackings}
                    recommendations={recommendations}
                  />
                </TabsContent>
                
                <TabsContent value="chakra" className="mt-0">
                  {/* Remove any wrapping Card component for ChakraVisualization */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <ChakraVisualization chakraProfile={chakraProfile} />
                  </div>
                </TabsContent>
                
                <TabsContent value="journal" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <JournalEntry entries={journalEntries} userId={user.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="rituals" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <HealingRituals 
                        recommendations={recommendations} 
                        chakraProfile={chakraProfile}
                        userId={user.id}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="emotions" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EmotionAnalysisChart />
                    <EmotionalJourneyLog />
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <ProgressCharts 
                        journalEntries={journalEntries} 
                        emotionTrackings={emotionTrackings}
                        chakraProfile={chakraProfile}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
        
        {/* Add motivational quote footer */}
        <div className="mt-12 text-center">
          <blockquote className="italic text-neutral-600 max-w-2xl mx-auto">
            "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it." - Rumi
          </blockquote>
          <div className="mt-4">
            <button 
              className="text-sm text-[#483D8B] hover:text-[#7c3aed] transition-colors"
              onClick={() => setLocation('/chakra-assessment')}
            >
              🧘 How do you feel today? <span className="underline">Open Chakra Check-In</span>
            </button>
          </div>
        </div>
        
        {/* Floating CTA button for chakra assessment */}
        <FloatingCTA />
      </div>
    </div>
  );
}
