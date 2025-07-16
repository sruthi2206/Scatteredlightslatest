import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, CheckCircle2, Calendar, Users, Shield, BookOpen, Video, Infinity, ArrowRight, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Check if Stripe public key is available
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// Also trim the key to remove any extra whitespace
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey.trim()) : null;

// Log Stripe initialization status (for debugging)
if (stripePublicKey) {
  console.log('Stripe public key available, Stripe initialized');
} else {
  console.warn('Stripe public key not available, payments will not work');
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  savings?: number;
}

// Pricing plans
const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 25,
    interval: "month",
    features: [
      "Full access to all healing rituals",
      "Exclusive community content",
      "Member-only events",
      "Premium AI coaching sessions",
      "Advanced chakra analysis",
      "Specialized meditation guides"
    ]
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 120,
    interval: "year",
    features: [
      "All Monthly plan features",
      "Save $180 compared to monthly",
      "Priority access to new features",
      "Personal healing path consultation",
      "VIP access to premium workshops",
      "Extended support for your journey"
    ],
    popular: true,
    savings: 180
  }
];

// Compare plans table data
const comparePlansData = {
  categories: ["Community Features", "Healing Tools", "Personal Growth", "Learning Resources"],
  features: [
    { name: "Community Forums", free: true, paid: true },
    { name: "Direct Messaging", free: false, paid: true },
    { name: "Group Events", free: "Limited", paid: true },
    { name: "Exclusive Workshops", free: false, paid: true },
    { name: "Basic Chakra Assessment", free: true, paid: true },
    { name: "Advanced Chakra Analysis", free: false, paid: true },
    { name: "Personalized Healing Rituals", free: "Limited", paid: true },
    { name: "Custom Meditation Guides", free: false, paid: true },
    { name: "AI Coaching Sessions", free: "2/month", paid: "Unlimited" },
    { name: "Progress Tracking", free: "Basic", paid: "Advanced" },
    { name: "Shadow Work Tools", free: false, paid: true },
    { name: "Inner Child Healing", free: false, paid: true },
    { name: "Educational Articles", free: "Limited", paid: true },
    { name: "Video Courses", free: false, paid: true },
    { name: "Guided Practices Library", free: false, paid: true },
    { name: "Expert Interviews", free: false, paid: true }
  ]
};

// FAQ data
const faqData = [
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your current billing period."
  },
  {
    question: "What happens after I subscribe?",
    answer: "After subscribing, you'll get immediate access to all premium features. You'll receive a welcome email with instructions on how to access all the member resources."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! We offer a 30-day free trial for all new users. After your trial period ends, you'll need to subscribe to continue accessing premium features like AI Chat, Chakra Assessment, and Community Access. Basic features like Dashboard, Healing Rituals, and Journaling will remain accessible even without a subscription."
  },
  {
    question: "Can I switch between monthly and yearly plans?",
    answer: "Yes, you can switch from monthly to yearly (or vice versa) at any time. If you upgrade to yearly, you'll be charged the new rate immediately. If you switch to monthly, the change will take effect at your next billing cycle."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards, including Visa, Mastercard, American Express, and Discover."
  },
  {
    question: "How do I access the premium content after subscribing?",
    answer: "All premium content will be automatically unlocked throughout the platform immediately after your subscription is processed."
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah J.",
    content: "Since joining Scattered Lights, my spiritual practice has deepened in ways I never imagined. The community support and premium tools have been worth every penny!",
    avatar: ""
  },
  {
    id: 2,
    name: "Michael T.",
    content: "I was skeptical about paying for a spiritual platform, but the AI coaching alone has given me more insights than years of searching. The yearly plan is a no-brainer.",
    avatar: ""
  },
  {
    id: 3,
    name: "Emma R.",
    content: "The specialized healing rituals and member workshops have transformed my approach to shadow work. This community has become essential to my daily practice.",
    avatar: ""
  }
];

// Payment Components
const CheckoutForm = ({ plan }: { plan: PricingPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        toast({
          title: "Payment Successful",
          description: "Thank you for your subscription!",
        });
        setLocation("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Information</h3>
        <PaymentElement />
      </div>
      
      <div className="p-4 bg-neutral-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Plan</span>
          <span className="font-medium">{plan.name}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span className="font-medium">${plan.price}.00</span>
        </div>
        <div className="text-xs text-neutral-500">
          You'll be charged ${plan.price}.00 {plan.interval === "month" ? "every month" : "annually"}. You can cancel anytime.
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#483D8B] hover:bg-opacity-90"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? "Processing..." : `Subscribe - $${plan.price}/${plan.interval === "month" ? "mo" : "year"}`}
      </Button>
    </form>
  );
};

const CheckoutContainer = ({ plan }: { plan: PricingPlan }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();
  
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: plan.price,
          interval: plan.interval
        });
        
        // Check if response is ok
        if (!response.ok) {
          const errorData = await response.json();
          // If the server indicates we should use fallback UI
          if (errorData.useFallback) {
            return { useFallback: true };
          }
          throw new Error(errorData.message || "Failed to create payment intent");
        }
        
        return response.json();
      } catch (error) {
        console.error("Payment intent creation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Only set client secret if it exists
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        console.warn("No client secret in payment intent response");
      }
    },
    onError: (error) => {
      console.error("Payment mutation error:", error);
      toast({
        title: "Payment System Unavailable",
        description: "We're experiencing issues with our payment system. Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntentMutation.mutate();
  }, []);
  
  if (!clientSecret && createPaymentIntentMutation.isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-[#483D8B] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If there's an error or the API indicates to use fallback
  if ((!clientSecret && createPaymentIntentMutation.isError) || 
      (createPaymentIntentMutation.error && 
       typeof createPaymentIntentMutation.error === 'object' && 
       'useFallback' in (createPaymentIntentMutation.error as any))) {
    // Show the PaymentUnavailableMessage component instead
    return <PaymentUnavailableMessage />;
  }
  
  return (
    <div>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm plan={plan} />
        </Elements>
      )}
    </div>
  );
};

// Payment processing unavailable message
const PaymentUnavailableMessage = () => {
  return (
    <div className="p-8">
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl p-8 mb-6 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
        </div>
        <h3 className="text-2xl font-medium text-center text-amber-800 mb-4">We're Enhancing Our Payment System</h3>
        <p className="text-amber-700 text-center mb-4 max-w-md mx-auto">
          Our payment processing is currently being upgraded to provide you with a more secure and seamless experience.
        </p>
        <div className="bg-white bg-opacity-50 p-4 rounded-xl mb-6">
          <h4 className="font-medium text-amber-800 mb-2">Alternative Ways to Join:</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Contact us at <span className="font-medium">support@scattered-lights.com</span> to set up your membership</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Join our free <span className="font-medium">Community Preview</span> for limited access</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Leave your email below for a notification when payments are live</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/dashboard"}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            Return to Dashboard
          </Button>
          <Button 
            onClick={() => window.location.href = "/contact"}
            className="bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({ faq, isDefaultOpen = false }: { faq: { question: string, answer: string }, isDefaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  
  return (
    <div className="mb-4 overflow-hidden bg-white rounded-xl shadow-sm border border-neutral-100 transition-all duration-300 hover:shadow-md">
      <div 
        className={`px-6 py-4 flex justify-between items-center cursor-pointer ${isOpen ? 'bg-gradient-to-r from-purple-50 to-indigo-50' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className={`font-medium text-lg ${isOpen ? 'text-indigo-700' : 'text-neutral-700'}`}>
          {faq.question}
        </h3>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className={`h-5 w-5 ${isOpen ? 'text-indigo-500' : 'text-neutral-400'}`} />
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 border-t border-neutral-100 bg-white">
              <p className="text-neutral-600">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Membership() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [trialInfo, setTrialInfo] = useState<{ daysLeft: number; isTrialEnded: boolean } | null>(null);
  
  // Calculate trial period information when user data is available (30-day trial)
  useEffect(() => {
    if (user && user.createdAt) {
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const differenceInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, 30 - differenceInDays);
      
      setTrialInfo({
        daysLeft,
        isTrialEnded: differenceInDays > 30
      });
    }
  }, [user]);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to subscribe to a membership plan.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPlan(plan);
    setShowCheckout(true);
  };
  
  // For demo purposes - hardcode trial info for HNO22 user
  useEffect(() => {
    if (user && user.username === "HNO22") {
      setTrialInfo({
        daysLeft: 25,
        isTrialEnded: false
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Trial Period Banner - Only show if trial data is available */}
        {trialInfo && !trialInfo.isTrialEnded && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full p-2 mr-4">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Your Free Trial Period: {trialInfo.daysLeft} days remaining
                  </h3>
                  <p className="text-sm text-gray-600">
                    You're currently enjoying all premium features! Subscribe before your trial ends to continue.
                  </p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow"
                onClick={() => setBillingInterval("year")}
              >
                Subscribe Now
              </Button>
            </div>
          </div>
        )}
        
        {showCheckout ? (
          <div className="max-w-md mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setShowCheckout(false)} 
              className="mb-6"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Plans
            </Button>
            {selectedPlan && stripePromise ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Complete Your Purchase</CardTitle>
                  <CardDescription>
                    You're subscribing to the {selectedPlan.name} plan at ${selectedPlan.price}/{selectedPlan.interval}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckoutContainer plan={selectedPlan} />
                </CardContent>
              </Card>
            ) : (
              <PaymentUnavailableMessage />
            )}
          </div>
        ) : (
          <>
            {/* Trial Banner */}
            {trialInfo && (
              <motion.div
                className={`mb-8 p-4 rounded-xl shadow-md ${
                  trialInfo.isTrialEnded 
                    ? "bg-red-50 border border-red-100" 
                    : "bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100"
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    {trialInfo.isTrialEnded ? (
                      <AlertTriangle className="h-10 w-10 text-red-500 mr-4 flex-shrink-0" />
                    ) : (
                      <Star className="h-10 w-10 text-purple-500 mr-4 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className={`text-lg font-medium ${trialInfo.isTrialEnded ? "text-red-700" : "text-purple-700"}`}>
                        {trialInfo.isTrialEnded 
                          ? "Your Free Trial Has Ended" 
                          : `Your Free Trial: ${trialInfo.daysLeft} ${trialInfo.daysLeft === 1 ? "day" : "days"} remaining`
                        }
                      </h3>
                      <p className={trialInfo.isTrialEnded ? "text-red-600" : "text-purple-600"}>
                        {trialInfo.isTrialEnded 
                          ? "Please subscribe to continue enjoying premium features" 
                          : "Subscribe now to maintain uninterrupted access to all premium features"
                        }
                      </p>
                    </div>
                  </div>
                  {trialInfo.isTrialEnded && (
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      onClick={() => document.getElementById("pricing-plans")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Subscribe Now
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
                Elevate Your Healing Journey
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Unlock premium features, personalized guidance, and exclusive community access
              </p>
            </motion.div>
            
            {/* Pricing Plans */}
            <motion.div
              id="pricing-plans"
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold mb-4">Transform with Scattered Lights</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Join our supportive community and unlock your true potential
                </p>
              </div>
              
              {/* Mindvalley-style pricing card */}
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 relative">
                {/* Decorative elements */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-blue-500/20 rounded-full blur-xl"></div>
                
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-10 px-8 relative">
                  {/* Northern lights inspired decorative element */}
                  <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                      <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium mb-4">Premium Experience</div>
                      <h2 className="text-3xl font-bold mb-4">Transform Your Journey with Scattered Lights</h2>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-400/30 mr-3">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span>100+ Healing Rituals from Spiritual Experts</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-400/30 mr-3">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span>Advanced AI Coaching for Personal Growth</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-400/30 mr-3">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span>Exclusive Network: Connect with Like-minded Souls</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-400/30 mr-3">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span>Premium Chakra Analysis & Balancing Tools</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-400/30 mr-3">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span>100% Risk-Free: 14-day Money-back Guarantee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-center mb-8">
                    <Tabs 
                      defaultValue="year" 
                      value={billingInterval}
                      onValueChange={(value) => setBillingInterval(value as "month" | "year")}
                      className="w-full max-w-md"
                    >
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100">
                        <TabsTrigger value="month" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Monthly</TabsTrigger>
                        <TabsTrigger value="year" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                          <div className="flex flex-col items-center">
                            <span>Yearly</span>
                            {billingInterval === "year" && <span className="text-xs text-green-600 font-medium">Save $180/year</span>}
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {pricingPlans
                    .filter(plan => plan.interval === billingInterval)
                    .map((plan) => (
                      <div key={plan.id} className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 shadow-md relative">
                        {/* Popular badge */}
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-md">
                              MOST POPULAR
                            </div>
                          </div>
                        )}
                        
                        <div className="text-center mb-6">
                          {/* Savings callout - only for yearly plan */}
                          {plan.interval === "year" && plan.savings && (
                            <div className="mb-4 bg-green-50 py-1.5 px-3 rounded-lg inline-block">
                              <span className="text-green-600 font-medium text-sm">Save ${plan.savings}/year</span>
                            </div>
                          )}
                          
                          <div className="text-5xl font-bold flex justify-center items-baseline">
                            <span className="text-2xl mr-1">$</span>{plan.price}
                            <span className="text-gray-500 text-lg font-normal ml-1">/{plan.interval}</span>
                          </div>
                          {plan.interval === "year" && (
                            <div className="text-sm text-gray-500 mt-1">Billed annually, cancel anytime</div>
                          )}
                          <div className="text-xs text-indigo-600 font-medium mt-1">Includes 7-day free trial for new users</div>
                        </div>
                        
                        <Button
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full py-6 text-lg rounded-xl mb-4 ${
                            plan.popular 
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200" 
                              : "bg-[#FF5757] hover:bg-[#FF4040]"
                          }`}
                        >
                          Join Scattered Lights Membership
                        </Button>
                        
                        <div className="mt-4 flex justify-center space-x-3">
                          <svg className="h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="25" rx="4" fill="white"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.4822 7.92135H23.5194V17.1072H16.4822V7.92135Z" fill="#FF5F00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1803 12.5143C17.1791 10.9462 17.8769 9.45 19.0641 8.39241C17.3767 7.0324 15.0874 6.73354 13.1035 7.62489C11.1196 8.51625 9.89904 10.4514 9.90078 12.5799C9.90253 14.7084 11.1261 16.6416 13.1117 17.5299C15.0972 18.4181 17.3865 18.1157 19.0719 16.7539C17.8842 15.6957 17.1865 14.1983 17.1889 12.6299L17.1803 12.5143Z" fill="#EB001B"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M30.0996 12.5143C30.1014 14.6428 28.8808 16.578 26.8969 17.4693C24.913 18.3607 22.6237 18.0618 20.9363 16.7018C22.1234 15.6444 22.8213 14.1483 22.82 12.5803C22.8188 11.0123 22.1188 9.51658 20.9302 8.46063C22.6162 7.09925 24.9051 6.7992 26.8896 7.68966C28.8741 8.58012 30.0962 10.5153 30.0996 12.6443V12.5143Z" fill="#F79E1B"/>
                          </svg>
                          <svg className="h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="25" rx="4" fill="white"/>
                            <path d="M6 16.4262L7.88524 8.57377H10.9836L9.09836 16.4262H6Z" fill="#006FCF"/>
                            <path d="M18.6885 8.73771C18.0328 8.49181 17.0492 8.24591 15.9016 8.24591C13.0328 8.24591 11 9.80328 11 12.0984C11 13.8033 12.4262 14.7869 13.5246 15.3934C14.6721 16 15.0984 16.3934 15.0984 16.9508C15.0984 17.7541 14.1639 18.1311 13.2787 18.1311C12.0656 18.1311 11.3606 17.9344 10.2623 17.3934L9.88524 17.2295L9.5 19.7541C10.2787 20.082 11.689 20.3607 13.1475 20.3607C16.2131 20.3607 18.1967 18.8525 18.1967 16.3934C18.1967 15.0164 17.3443 13.9508 15.5738 13.0984C14.5 12.5738 13.8934 12.2131 13.8934 11.6557C13.8934 11.1639 14.4754 10.6721 15.6066 10.6721C16.5574 10.6393 17.2623 10.9016 17.8033 11.1639L18.0656 11.2951L18.6885 8.73771Z" fill="#006FCF"/>
                            <path d="M22.5246 8.57377H24.9508L27.9836 16.4262H25.1803L24.6885 14.9508H21.3607L20.9016 16.4262H18L22.5246 8.57377ZM23.9344 10.8688L22.5246 13.3934H24.1967L23.9344 10.8688Z" fill="#006FCF"/>
                            <path d="M29.4262 8.57377L32.2295 13.5574L33.0328 10.8032C33.0328 10.8032 33.2787 9.80328 33.3115 9.6721H36L32.8852 16.4262H30.0984L25.9508 8.57377H29.4262Z" fill="#006FCF"/>
                          </svg>
                          <svg className="h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="25" rx="4" fill="white"/>
                            <path d="M20 7C15.0294 7 11 10.8579 11 15.625C11 20.3921 15.0294 24.25 20 24.25C24.9706 24.25 29 20.3921 29 15.625C29 10.8579 24.9706 7 20 7Z" fill="#5F6368"/>
                            <path d="M20 18.2917C21.5062 18.2917 22.7245 17.118 22.7245 15.6667C22.7245 14.2153 21.5062 13.0417 20 13.0417C18.4938 13.0417 17.2755 14.2153 17.2755 15.6667C17.2755 17.118 18.4938 18.2917 20 18.2917Z" fill="white"/>
                          </svg>
                        </div>
                        
                        <div className="mt-3 text-xs text-center text-gray-500">
                          Powered by <span className="font-medium">stripe</span>
                        </div>
                        
                        <div className="mt-4 text-xs text-center text-gray-500">
                          VAT charges might apply as per your billing address
                        </div>
                        
                        <div className="mt-2 text-xs text-center text-gray-500 flex justify-center items-center">
                          <Shield className="h-3 w-3 inline-block mr-1" />
                          All transactions are secured with 256-bit encryption
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
            
            {/* Membership Benefits */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Membership Benefits</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Transform your spiritual practice with premium features and exclusive content
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="overflow-hidden border-none shadow-lg shadow-purple-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <CardHeader className="pt-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4 mx-auto">
                      <Users className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-center text-xl">Exclusive Community</CardTitle>
                    <CardDescription className="text-center">
                      Connect with fellow seekers on the same path
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mt-4 text-sm">
                      <li className="flex items-start bg-purple-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        </div>
                        <span>Private discussion groups with like-minded members</span>
                      </li>
                      <li className="flex items-start bg-indigo-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <span>Direct messaging with members worldwide</span>
                      </li>
                      <li className="flex items-start bg-purple-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        </div>
                        <span>Expert-led community events and workshops</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-none shadow-lg shadow-cyan-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <CardHeader className="pt-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-4 mx-auto">
                      <Star className="h-8 w-8 text-cyan-600" />
                    </div>
                    <CardTitle className="text-center text-xl">Premium Healing Tools</CardTitle>
                    <CardDescription className="text-center">
                      Access advanced healing practices and tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mt-4 text-sm">
                      <li className="flex items-start bg-cyan-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                        </div>
                        <span>Advanced chakra analysis with personalized insights</span>
                      </li>
                      <li className="flex items-start bg-blue-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </div>
                        <span>Custom healing rituals tailored to your needs</span>
                      </li>
                      <li className="flex items-start bg-cyan-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                        </div>
                        <span>Priority AI coach guidance for your journey</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-none shadow-lg shadow-emerald-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                  <CardHeader className="pt-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-4 mx-auto">
                      <BookOpen className="h-8 w-8 text-emerald-600" />
                    </div>
                    <CardTitle className="text-center text-xl">Curated Learning Resources</CardTitle>
                    <CardDescription className="text-center">
                      Expand your knowledge with exclusive content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mt-4 text-sm">
                      <li className="flex items-start bg-emerald-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span>Member-only courses from spiritual experts</span>
                      </li>
                      <li className="flex items-start bg-green-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <span>Exclusive video workshops and masterclasses</span>
                      </li>
                      <li className="flex items-start bg-emerald-50 p-3 rounded-lg">
                        <div className="bg-white rounded-full p-1 shadow-sm mr-3 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span>Extensive guided meditation and practice library</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            
            {/* Compare Plans Table */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Compare Plans</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  See which features are available in the free and premium plans
                </p>
              </div>
              
              <div className="max-w-5xl mx-auto overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="bg-neutral-50 text-left py-4 px-6 font-medium text-neutral-500 rounded-tl-lg">Features</th>
                      <th className="bg-neutral-50 text-center py-4 px-6 font-medium text-neutral-500">Free</th>
                      <th className="bg-neutral-50 text-center py-4 px-6 font-medium text-neutral-500 rounded-tr-lg">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparePlansData.categories.map((category, categoryIndex) => (
                      <React.Fragment key={categoryIndex}>
                        <tr>
                          <td colSpan={3} className="py-3 px-6 font-medium text-[#483D8B]">
                            {category}
                          </td>
                        </tr>
                        {comparePlansData.features
                          .filter((_, idx) => Math.floor(idx / 4) === categoryIndex)
                          .map((feature, idx) => (
                            <tr key={idx} className="border-b border-neutral-100 last:border-0">
                              <td className="py-3 px-6">{feature.name}</td>
                              <td className="py-3 px-6 text-center">
                                {feature.free === true ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                ) : feature.free === false ? (
                                  <span className="text-neutral-300">—</span>
                                ) : (
                                  <span className="text-sm text-neutral-500">{feature.free}</span>
                                )}
                              </td>
                              <td className="py-3 px-6 text-center">
                                {feature.paid === true ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <span className="text-sm text-neutral-500">{feature.paid}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* Testimonials */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Member Testimonials</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Hear from our community about their transformative experiences
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-gradient-to-b from-white to-purple-50/30 border-none shadow-md hover:shadow-xl transition-all duration-300">
                    <CardContent className="pt-8 pb-8 relative">
                      {/* Quote mark decoration */}
                      <div className="absolute -top-2 -left-2 text-6xl text-purple-200 opacity-40 font-serif">"</div>
                      
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-medium mr-4 shadow-md">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-lg">{testimonial.name}</div>
                          <div className="text-xs font-medium uppercase tracking-wider text-purple-600">Member</div>
                        </div>
                      </div>
                      
                      <div className="flex mb-4">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      
                      <p className="text-neutral-700 relative z-10">"{testimonial.content}"</p>
                      
                      {/* Bottom decoration */}
                      <div className="absolute -bottom-2 -right-2 text-6xl text-purple-200 opacity-40 rotate-180 font-serif">"</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* FAQ Section */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Find answers to common questions about Scattered Lights membership
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                {faqData.map((faq, index) => (
                  <FAQItem key={index} faq={faq} isDefaultOpen={index === 0} />
                ))}
              </div>
            </motion.div>
            
            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative max-w-4xl mx-auto overflow-hidden"
            >
              {/* Background decorations */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-emerald-300/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-12 rounded-2xl shadow-xl border border-indigo-100/50">
                {/* Northern lights inspired top border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500"></div>
                
                <div className="text-center">
                  <div className="mb-2 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Limited Time Offer
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                    Begin Your Transformation Today
                  </h2>
                  
                  <p className="text-neutral-700 mb-8 max-w-xl mx-auto">
                    Join our vibrant community of spiritual seekers and unlock your full potential with personalized guidance, expert tools, and premium resources.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-5 mb-8">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">14-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Cancel anytime, no questions asked</span>
                    </div>
                  </div>
                  
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-10 py-6 h-auto rounded-xl shadow-lg shadow-indigo-200/50 transition-transform hover:scale-105"
                    onClick={() => handleSelectPlan(pricingPlans[1])}
                  >
                    Join Scattered Lights Membership
                  </Button>
                  
                  <div className="flex justify-center mt-8 gap-5">
                    <div className="flex">
                      {/* Payment method icons */}
                      <div className="flex space-x-2 opacity-70">
                        <div className="w-8 h-8 bg-white rounded-md shadow-sm flex items-center justify-center">
                          <svg className="h-5" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.4822 7.92135H23.5194V17.1072H16.4822V7.92135Z" fill="#FF5F00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1803 12.5143C17.1791 10.9462 17.8769 9.45 19.0641 8.39241C17.3767 7.0324 15.0874 6.73354 13.1035 7.62489C11.1196 8.51625 9.89904 10.4514 9.90078 12.5799C9.90253 14.7084 11.1261 16.6416 13.1117 17.5299C15.0972 18.4181 17.3865 18.1157 19.0719 16.7539C17.8842 15.6957 17.1865 14.1983 17.1889 12.6299L17.1803 12.5143Z" fill="#EB001B"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M30.0996 12.5143C30.1014 14.6428 28.8808 16.578 26.8969 17.4693C24.913 18.3607 22.6237 18.0618 20.9363 16.7018C22.1234 15.6444 22.8213 14.1483 22.82 12.5803C22.8188 11.0123 22.1188 9.51658 20.9302 8.46063C22.6162 7.09925 24.9051 6.7992 26.8896 7.68966C28.8741 8.58012 30.0962 10.5153 30.0996 12.6443V12.5143Z" fill="#F79E1B"/>
                          </svg>
                        </div>
                        <div className="w-8 h-8 bg-white rounded-md shadow-sm flex items-center justify-center">
                          <svg className="h-5" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 16.4262L7.88524 8.57377H10.9836L9.09836 16.4262H6Z" fill="#006FCF"/>
                            <path d="M22.5246 8.57377H24.9508L27.9836 16.4262H25.1803L24.6885 14.9508H21.3607L20.9016 16.4262H18L22.5246 8.57377Z" fill="#006FCF"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Shield className="h-3 w-3 mr-1 text-gray-400" />
                      Secure Payment
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}