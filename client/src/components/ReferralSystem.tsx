import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Share2, Copy, Gift, Sparkles, Check, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animated light icon component
const AnimatedLightIcon = () => {
  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop"
        }}
        className="absolute inset-0"
      >
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
      </motion.div>
      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
    </div>
  );
};

const ReferralSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Progress calculation
  const maxLights = 250; // Lights needed for premium access
  const progress = user?.lights ? Math.min((user.lights / maxLights) * 100, 100) : 0;
  const referralLink = `${window.location.origin}/auth?ref=${user?.referralCode || ""}`;
  
  // Calculate time remaining if user has premium from lights
  const hasPremiumFromLights = user?.premiumExpiryDate && new Date(user.premiumExpiryDate as Date) > new Date();
  const daysRemaining = hasPremiumFromLights && user?.premiumExpiryDate
    ? Math.ceil((new Date(user.premiumExpiryDate as Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  // Celebrate when a user reaches each 250 lights milestone
  useEffect(() => {
    if (user?.lights && user.lights % 250 === 0 && user.lights > 0) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  }, [user?.lights]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with friends to earn 50 lights for each sign-up.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Scattered Lights",
        text: "Join me on Scattered Lights for personalized spiritual guidance and chakra healing. Use my referral link to sign up!",
        url: referralLink,
      })
        .then(() => {
          toast({
            title: "Shared successfully!",
            description: "Thanks for spreading the word!",
          });
        })
        .catch((error) => {
          console.error("Error sharing", error);
        });
    } else {
      handleCopyLink();
    }
  };
  
  if (!user) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-100 to-indigo-100">
        <CardTitle className="flex items-center">
          <div className="mr-2">
            <AnimatedLightIcon />
          </div>
          Referral Rewards
        </CardTitle>
        <CardDescription>
          Invite friends and earn 50 lights for each signup!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600">Referral Lights: {user.lights || 0}</span>
            <span className="text-sm font-medium text-purple-600">
              {hasPremiumFromLights 
                ? `Premium Access: ${daysRemaining} days remaining` 
                : `${user.lights || 0}/${maxLights} to unlock premium`}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-neutral-200" />
          <p className="text-xs text-neutral-500 mt-1">
            Every 250 lights unlocks 7 days of premium access to all features
          </p>
        </div>
        
        {/* Referral Link */}
        <div className="relative mb-4">
          <Input 
            value={referralLink}
            readOnly
            className="pr-24"
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute right-1 top-1 h-8"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gradient-to-r from-purple-50 to-indigo-50 border-t">
        <Button
          variant="outline"
          size="sm"
          className="text-sm"
          onClick={handleCopyLink}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="text-sm bg-purple-600 hover:bg-purple-700 text-white"
          onClick={shareLink}
        >
          <AnimatedLightIcon />
          <span className="ml-1">Share & Earn Lights</span>
        </Button>
      </CardFooter>
      
      {/* Celebration animation when milestone reached */}
      <AnimatePresence>
        {showAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-lg shadow-xl flex flex-col items-center"
            >
              <div className="relative h-16 w-16 mb-4">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Star className="h-16 w-16 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Congratulations!</h3>
              <p className="text-center text-gray-700 mb-2 max-w-xs">
                You've earned 250 lights and unlocked 7 days of premium access!
              </p>
              <div className="flex items-center text-sm mt-2 text-purple-600">
                <span>Share with more friends to earn more lights!</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ReferralSystem;