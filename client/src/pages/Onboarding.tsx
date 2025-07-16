import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import ChakraWheel from "@/components/ChakraWheel";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<FormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setUserData(values);
    setStep(2);
  };

  // Handle quiz completion and profile creation
  const handleQuizComplete = async (chakraValues: Record<string, number>) => {
    if (!userData) return;
    
    setIsSubmitting(true);
    
    try {
      // Register the user with the new auth system
      registerMutation.mutate(userData as any, {
        onSuccess: async (user) => {
          try {
            // Create chakra profile
            const chakraResponse = await apiRequest("POST", "/api/chakra-profiles", {
              userId: user.id,
              crownChakra: chakraValues.crown || 5,
              thirdEyeChakra: chakraValues.thirdEye || 5,
              throatChakra: chakraValues.throat || 5,
              heartChakra: chakraValues.heart || 5,
              solarPlexusChakra: chakraValues.solarPlexus || 5,
              sacralChakra: chakraValues.sacral || 5,
              rootChakra: chakraValues.root || 5,
            });
            
            if (!chakraResponse.ok) {
              throw new Error("Failed to create chakra profile");
            }
            
            toast({
              title: "Welcome to Scattered Lights!",
              description: "Your spiritual healing journey begins now.",
            });
            
            // Navigate to dashboard
            setLocation("/dashboard");
          } catch (error) {
            console.error("Error creating chakra profile:", error);
            toast({
              title: "Profile Creation Error",
              description: "Your account was created but we couldn't set up your chakra profile. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        onError: (error) => {
          console.error("Error registering user:", error);
          toast({
            title: "Registration Error",
            description: error.message || "There was a problem creating your account. Please try again.",
            variant: "destructive",
          });
          
          // If it's a username conflict, reset the form to the first step
          if (error.message.includes("409") || error.message.includes("already exists")) {
            setStep(1);
            form.setError("username", { 
              type: "manual", 
              message: "This username is already taken" 
            });
          }
          
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
              Scattered Lights
            </div>
          </div>
          
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-heading font-semibold mb-6 text-center">Begin Your Journey</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full bg-[#483D8B] hover:bg-opacity-90">
                    Continue
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-heading font-semibold mb-2">Chakra Assessment</h2>
                <p className="text-neutral-600 text-sm">Let's discover your energy balance</p>
                
                <div className="py-6 flex justify-center">
                  <ChakraWheel size={180} animated={true} />
                </div>
              </div>
              
              <OnboardingQuiz 
                onComplete={handleQuizComplete} 
                isSubmitting={isSubmitting} 
              />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
