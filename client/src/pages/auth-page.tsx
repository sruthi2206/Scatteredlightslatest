import React, { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Languages, Gift, Loader2, X, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register form schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ , ({ flagError }) => {
    flagError({
      title: "Password must include at least one uppercase letter, one lowercase letter, and a number",
      description: "Password must include at least one uppercase letter, one lowercase letter, and a number",
      variant: "destructive",
    })
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/auth?:query");
  const { user, loginMutation, registerMutation } = useAuth();
  const { language, setLanguage, t, LANGUAGES } = useLanguage();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Extract referral code from URL if present
  useEffect(() => {
    // Check for referral code in URL
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      setActiveTab("register"); // Switch to register tab automatically
      toast({
        title: "Referral detected!",
        description: "You've been invited to join Scattered Lights. Sign up to give your friend 50 lights!",
      });
    }
  }, [toast]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Handle login submit
  const handleLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
      onError: (error) => {
        if (error.message.includes("401")) {
          loginForm.setError("password", { 
            type: "manual", 
            message: "Invalid username or password" 
          });
        }
      }
    });
  };
  
  // Handle register submit
  const handleRegisterSubmit = (values: RegisterFormValues) => {
    // Note: we need to remove confirmPassword before sending to the API
    // as it's not part of the user schema in the backend
    const { confirmPassword, ...userData } = values;
    
    // Include referral code if present
    const registrationData = referralCode 
      ? { ...userData, referredBy: referralCode } 
      : userData;
    
    registerMutation.mutate(registrationData as any, {
      onSuccess: () => {
        if (referralCode) {
          toast({
            title: "Referral success!",
            description: "Your friend will receive 50 lights for inviting you!",
          });
        }
        setLocation("/onboarding");
      },
      onError: (error) => {
        if (error.message.includes("409") || error.message.includes("already exists")) {
          registerForm.setError("username", { 
            type: "manual", 
            message: "This username is already taken" 
          });
        }
      }
    });
  };
  
  // Handle password reset
  const handleResetPassword = async () => {
    try {
      setIsResettingPassword(true);
      
      // Send forgot password request to backend
      const response = await apiRequest("POST", "/api/forgot-password", { 
        email: resetEmail
      });
      
      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Reset email sent",
          description: data.message || "If an account with that email exists, a password reset link has been sent.",
        });
        
        // Close the dialog
        setShowForgotPassword(false);
        setResetEmail("");
      } else {
        const errorData = await response.json();
        toast({
          title: "Reset failed",
          description: errorData.message || "Failed to send reset email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "There was an issue processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
                {t('welcomeTitle') || "Welcome to Scattered Lights"}
              </h1>
              <p className="text-neutral-600">
                {t('welcomeSubtitle') || "Your journey to inner healing and spiritual growth begins here"}
              </p>
              
              {/* Language Selection - disabled */}
            </div>
            
            {/* Google OAuth Login */}
            <div className="mb-6">
              <Button
                onClick={() => window.location.href = '/api/auth/google'}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 flex items-center justify-center gap-3 py-3"
                variant="outline"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t('login') || "Login"}</TabsTrigger>
                <TabsTrigger value="register">{t('register') || "Create Account"}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('loginTitle') || "Login to Your Account"}</CardTitle>
                    <CardDescription>
                      {t('loginDescription') || "Enter your credentials to access your dashboard"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('username') || "Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('usernamePlaceholder') || "Your username"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('password') || "Password"}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showLoginPassword ? "text" : "password"} 
                                    placeholder={t('passwordPlaceholder') || "Your password"} 
                                    {...field} 
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                  >
                                    {showLoginPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                              <div className="text-right mt-1">
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                                  type="button"
                                  onClick={() => setShowForgotPassword(true)}
                                >
                                  {t('forgotPassword') || "Forgot your password?"}
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('loggingIn') || "Logging in..."}
                            </>
                          ) : (
                            t('login') || "Login"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('registerTitle') || "Create New Account"}</CardTitle>
                    <CardDescription>
                      {t('registerDescription') || "Join Scattered Lights to begin your healing journey"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {referralCode && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3 flex-shrink-0 bg-purple-100 rounded-full p-2">
                            <Gift className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-800">
                              You were invited by a friend!
                            </p>
                            <p className="text-xs text-purple-600">
                              Create your account to give them 50 lights as a reward.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('name') || "Name"}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('namePlaceholder') || "Your name"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('username') || "Username"}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('usernamePlaceholder2') || "Choose a username"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('email') || "Email"}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={t('emailPlaceholder') || "Your email address"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('password') || "Password"}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showRegisterPassword ? "text" : "password"} 
                                    placeholder={t('passwordPlaceholder2') || "Create a password"} 
                                    {...field} 
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  >
                                    {showRegisterPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <div className="text-xs text-muted-foreground mt-1">
                                Password must be at least 8 characters
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('confirmPassword') || "Confirm Password"}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder={t('confirmPasswordPlaceholder') || "Confirm your password"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('creatingAccount') || "Creating account..."}
                            </>
                          ) : (
                            t('register') || "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block bg-gradient-to-br from-[#483D8B] to-[#008080] p-8 text-white flex items-center"
          >
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">{t('transformTitle') || "Transform Your Inner World"}</h2>
              <p className="mb-8 opacity-90">
                {t('transformDescription') || "Scattered Lights uses advanced AI to guide you through a personalized journey of healing, self-discovery, and spiritual growth. Unlock your full potential and find balance in your chakras, emotions, and consciousness."}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('feature1Title') || "Personalized Chakra Analysis"}</h3>
                    <p className="opacity-80 text-sm">{t('feature1Description') || "Discover your unique energy balance and areas for healing"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('feature2Title') || "AI-Guided Healing Rituals"}</h3>
                    <p className="opacity-80 text-sm">{t('feature2Description') || "Follow customized practices to release blockages and restore balance"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 shrink-0">
                    <span className="text-white text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{t('feature3Title') || "Track Your Progress"}</h3>
                    <p className="opacity-80 text-sm">{t('feature3Description') || "Visualize your spiritual growth and emotional evolution over time"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll help you reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {tempPassword ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-md border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Temporary Password Generated</h4>
                <p className="text-sm text-green-700 mb-3">
                  In a real application, this would be sent to your email. For demonstration purposes, 
                  we're showing it here:
                </p>
                <div className="bg-white p-3 rounded border border-green-200 font-mono text-center">
                  {tempPassword}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Use this temporary password to log in, then change your password immediately.
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setTempPassword(null);
                  loginForm.setValue("password", tempPassword);
                  loginForm.setFocus("username");
                }}
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleResetPassword}
                  disabled={isResettingPassword || !resetEmail}
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}