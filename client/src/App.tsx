import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Journal from "@/pages/Journal";
import Coach from "@/pages/Coach";
import Community from "@/pages/Community";
import EventsPage from "@/pages/EventsPage";
import Membership from "@/pages/Membership";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import ChakraAssessment from "@/pages/ChakraAssessment";
import ChakraReport from "@/pages/ChakraReport";
import ChakraInformation from "@/pages/ChakraInformation";
import HealingRitualsPage from "@/pages/HealingRitualsPage";
import RitualCoursePage from "@/pages/RitualCoursePage";
import TooltipDemo from "@/pages/TooltipDemo";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  const isHome = location === "/";
  const isAdmin = location.startsWith("/admin") && location !== "/admin";
  
  return (
    <>
      {!isHome && !isAdmin && <Navigation />}
      <AnimatePresence mode="wait">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/tooltip-demo" component={TooltipDemo} />
          <Route path="/chakra-assessment" component={ChakraAssessment} />
          
          {/* Admin routes */}
          <Route path="/admin" component={AdminLoginPage} />
          <ProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} />
          
          {/* Protected user routes */}
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/onboarding" component={Onboarding} />
          <ProtectedRoute path="/journal" component={Journal} />
          <ProtectedRoute path="/coach/:type" component={Coach} />
          <ProtectedRoute path="/community" component={Community} />
          <ProtectedRoute path="/events" component={EventsPage} />
          <ProtectedRoute path="/membership" component={Membership} />
          <ProtectedRoute path="/chakra-report" component={ChakraReport} />
          <ProtectedRoute path="/chakra-information" component={ChakraInformation} />
          <ProtectedRoute path="/healing-rituals" component={HealingRitualsPage} />
          <ProtectedRoute path="/courses/:courseId" component={RitualCoursePage} />
          
          {/* Legacy admin route - can be removed later */}
          <ProtectedRoute path="/admin-old" component={AdminDashboard} />
          
          {/* 404 page */}
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;