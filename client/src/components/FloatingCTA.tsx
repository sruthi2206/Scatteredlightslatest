import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Sparkles, Star, Share2, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface FloatingCTAProps {
  text?: string;
  buttonText?: string;
  link?: string;
  icon?: React.ReactNode;
  className?: string;
}

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

export default function FloatingCTA({
  text = "Earn Free Lights!",
  buttonText = "Refer to friends to earn more light",
  link = "/dashboard",
  icon = <Sparkles className="h-4 w-4 mr-1" />,
  className = ""
}: FloatingCTAProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll to show/hide based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const visible = scrollPosition > currentScrollPos || currentScrollPos < 100;
      
      setIsVisible(visible);
      setScrollPosition(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  // Get the user's referral link
  const getReferralLink = () => {
    if (!user || !user.referralCode) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/join?ref=${user.referralCode}`;
  };
  
  // Copy the referral link to clipboard
  const copyToClipboard = () => {
    if (shareInputRef.current) {
      shareInputRef.current.select();
      document.execCommand('copy');
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied!",
        description: "Share it with your friends to earn more lights!",
        variant: "default",
      });
    }
  };
  
  // Share via native share API (mobile devices)
  const shareViaAPI = async () => {
    const referralLink = getReferralLink();
    
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join me on Scattered Lights!',
          text: 'I\'m using Scattered Lights for inner healing and growth. Join me using my referral link:',
          url: referralLink,
        });
        
        // Award lights after successful share
        awardLightsToUser();
        
      } catch (error) {
        console.error('Error sharing:', error);
        // If sharing was cancelled or failed, show the dialog
        setIsShareDialogOpen(true);
      }
    } else {
      // Fallback to copy dialog
      setIsShareDialogOpen(true);
    }
  };
  
  // Award lights to the user
  const awardLightsToUser = async () => {
    if (!user || !user.id) return;
    
    try {
      setIsLoading(true);
      
      // Add 25 lights to user account for sharing
      const response = await apiRequest('POST', `/api/users/${user.id}/add-lights`, { lights: 25 });
      
      if (!response.ok) {
        throw new Error('Failed to add lights');
      }
      
      // Show success toast
      toast({
        title: "✨ Lights Earned!",
        description: "You've earned 25 lights for sharing with friends!",
        variant: "default",
      });
      
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error adding lights:", error);
      setIsLoading(false);
      toast({
        title: "An error occurred",
        description: "Failed to add lights. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle the chakra assessment & referral connection
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      // If user is not logged in, redirect to auth page
      setLocation('/auth');
      return;
    }
    
    // Try to use native share API first
    if (typeof navigator.share === 'function') {
      shareViaAPI();
    } else {
      // Show share dialog as fallback
      setIsShareDialogOpen(true);
    }
  };

  return (
    <>
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share with friends & earn lights</DialogTitle>
            <DialogDescription>
              Share your referral link with friends. You'll both earn 25 lights when they join!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-4 mb-4">
            <div className="grid flex-1 gap-2">
              <input
                ref={shareInputRef}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={getReferralLink()}
                readOnly
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="px-3"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Or share directly:</p>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=Join%20me%20on%20Scattered%20Lights!%20${encodeURIComponent(getReferralLink())}`, '_blank');
                  awardLightsToUser();
                  setIsShareDialogOpen(false);
                }}
              >
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralLink())}`, '_blank');
                  awardLightsToUser();
                  setIsShareDialogOpen(false);
                }}
              >
                Facebook
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=Join%20me%20on%20Scattered%20Lights!%20${encodeURIComponent(getReferralLink())}`, '_blank');
                  awardLightsToUser();
                  setIsShareDialogOpen(false);
                }}
              >
                Twitter
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-[#483D8B] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#5a21cc]"
              onClick={() => {
                copyToClipboard();
                awardLightsToUser();
                setIsShareDialogOpen(false);
              }}
            >
              <AnimatedLightIcon />
              <span className="ml-1">Copy & Earn 25 Lights</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      <motion.div
        className={`fixed bottom-4 right-4 z-50 ${className}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : 100, 
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-lg p-3 flex flex-col items-start"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-sm font-medium text-[#483D8B] flex items-center mb-2">
            <span className="flex items-center">
              <motion.div
                className="mr-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                🌟
              </motion.div>
              {text}
            </span>
            <div className="ml-2 text-xs text-gray-600 dark:text-gray-400">
              Collect lights to unlock premium features
            </div>
          </div>
          <Button 
            className="bg-gradient-to-r from-[#483D8B] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#5a21cc] w-full"
            onClick={handleClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-1" />
                <span className="ml-1">{buttonText}</span>
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}