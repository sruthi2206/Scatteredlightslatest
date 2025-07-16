import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronDown, LayoutDashboard, BookOpen, MessageSquare, Sparkles, LogOut, Users, CreditCard, ShieldCheck, Calendar, Flame } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import UserProfileMenu from "./UserProfileMenu";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [inTrialPeriod, setInTrialPeriod] = useState(true);
  const [visibleItems, setVisibleItems] = useState<string[]>([
    "Dashboard", "Journal", "AI Coaches", "Chakra Assessment", "Healing Rituals", "Community", "Membership"
  ]);

  // Fetch user's journal entries for streak calendar
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'journal-entries'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/journal-entries`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!user,
  });

  // Calculate current streak
  const calculateStreak = () => {
    if (!journalEntries?.length) return 0;
    
    // Get unique days with journal entrie
    const journalDays = journalEntries
      .map(entry => {
        const date = new Date(entry.createdAt);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      })
      .filter((date, index, array) => 
        array.findIndex(d => d.getTime() === date.getTime()) === index
      )
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (!journalDays.length) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Start checking from today or yesterday if no entry today
    let checkDate = new Date(currentDate);
    let foundFirst = false;
    
    // Check if there's an entry today
    if (journalDays.some(day => day.getTime() === currentDate.getTime())) {
      streak = 1;
      foundFirst = true;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If no entry today, check if there's an entry yesterday to start streak
      checkDate.setDate(checkDate.getDate() - 1);
      if (journalDays.some(day => day.getTime() === checkDate.getTime())) {
        streak = 1;
        foundFirst = true;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    // Continue counting backwards for consecutive days
    if (foundFirst) {
      while (journalDays.some(day => day.getTime() === checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    return streak;
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  // Check if a day has a journal entry
  const hasEntryForDay = (day: Date) => {
    return journalEntries.some(entry => 
      isSameDay(new Date(entry.createdAt), day)
    );
  };
  
  // Check if user is in trial period (30 days from account creation)
  useEffect(() => {
    if (user) {
      // Calculate days since account creation
      const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
      const now = new Date();
      const differenceInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Trial period is 30 days
      const isInTrial = differenceInDays <= 30;
      setInTrialPeriod(isInTrial);
      
      // Basic features are always visible (available after trial ends too)
      const basicFeatures = ["Dashboard", "Journal", "Healing Rituals", "Membership"];
      
      // Premium features require subscription after trial
      const premiumFeatures = ["AI Coaches", "Chakra Assessment", "Community"];
      
      // Determine which items are visible based on trial/subscription status
      if (isInTrial || user.isAdmin) {
        // During trial or for admin users, show all features
        setVisibleItems([...basicFeatures, ...premiumFeatures]);
      } else {
        // After trial ends without premium, only show basic features
        setVisibleItems(basicFeatures);
      }
      
      // Admin users already covered in the condition above
      if (user.isAdmin) {
        // Include admin dashboard for admin users
        setVisibleItems([
          "Dashboard", "Journal", "AI Coaches", "Chakra Assessment", "Healing Rituals", "Community", "Membership", "Admin"
        ]);
      }
    }
  }, [user]);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  // Define a type for navigation items
  interface NavItem {
    name: string;
    path: string;
    icon: JSX.Element;
    dropdownItems?: Array<{
      name: string;
      path: string;
    }>;
  }

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "Journal",
      path: "/journal",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: "AI Coaches",
      path: "#",
      icon: <MessageSquare className="h-5 w-5" />,
      dropdownItems: [
        { name: "Inner Child Coach", path: "/coach/inner_child" },
        { name: "Shadow Self Coach", path: "/coach/shadow_self" },
        { name: "Higher Self Coach", path: "/coach/higher_self" },
        { name: "Integration Coach", path: "/coach/integration" }
      ]
    },
    {
      name: "Chakra Assessment",
      path: "/chakra-assessment",
      icon: <ShieldCheck className="h-5 w-5" />
    },
    {
      name: "Healing Rituals",
      path: "/healing-rituals",
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      name: "Community",
      path: "/community",
      icon: <Users className="h-5 w-5" />
    }
    // ,
    // {
    //   name: "Membership",
    //   path: "/membership",
    //   icon: <CreditCard className="h-5 w-5" />
    // }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <span className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
                Scattered Lights
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(item => visibleItems.includes(item.name)).map((item, index) => {
                if (item.dropdownItems) {
                  return (
                    <div key={index} className="relative group">
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-1"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="py-1">
                          {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                            <Link
                              key={dropdownIndex}
                              href={dropdownItem.path}
                              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                              onClick={closeMenu}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link key={index} href={item.path} onClick={closeMenu}>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 ${isActive(item.path) ? "bg-neutral-100" : ""}`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
            
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Streak Calendar Icon */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalendar(true)}
                    className="relative p-2 hover:bg-amber-50"
                  >
                    <div className="flex items-center space-x-1">
                      <Flame className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">
                        {calculateStreak()}
                      </span>
                    </div>
                    {calculateStreak() > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </Button>
                  <UserProfileMenu />
                </div>
              ) : (
                <Link href="/onboarding">
                  <Button className="bg-[#483D8B] text-white hover:bg-opacity-90">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
            
            <button 
              className="md:hidden flex items-center p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-neutral-900" />
              ) : (
                <Menu className="h-6 w-6 text-neutral-900" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 bg-white z-40 shadow-lg md:hidden overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {navItems.filter(item => visibleItems.includes(item.name)).map((item, index) => {
                  if (item.dropdownItems) {
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center px-3 py-2 text-neutral-700 font-medium">
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                            <Link
                              key={dropdownIndex}
                              href={dropdownItem.path}
                              onClick={closeMenu}
                            >
                              <div className="px-3 py-2 rounded-md hover:bg-neutral-100 text-neutral-700">
                                {dropdownItem.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Link key={index} href={item.path} onClick={closeMenu}>
                      <div className={`flex items-center px-3 py-2 rounded-md text-neutral-700 ${
                        isActive(item.path) ? "bg-neutral-100 font-medium" : ""
                      }`}>
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
                
                <div className="pt-4 border-t border-neutral-200 mt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-3 py-2 text-neutral-700">Signed in as: <span className="font-medium">{user.username}</span></div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link href="/onboarding" onClick={closeMenu}>
                      <Button className="w-full bg-[#483D8B] text-white hover:bg-opacity-90">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              🔥 Journal Streak Calendar
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Streak Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 text-center border border-amber-200">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="h-5 w-5 text-amber-600 mr-1" />
                  <span className="text-2xl font-bold text-amber-800">{calculateStreak()}</span>
                </div>
                <p className="text-xs text-amber-600">Current Streak</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 text-center border border-indigo-200">
                <div className="text-2xl font-bold text-indigo-800">{journalEntries?.length || 0}</div>
                <p className="text-xs text-indigo-600">Total Entries</p>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border">
              <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                {format(new Date(), "MMMM yyyy")}
              </h4>
              
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center font-medium text-gray-500 p-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {getCalendarDays().map((day, i) => {
                  const hasEntry = hasEntryForDay(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div
                      key={i}
                      className={`
                        text-center p-2 rounded text-xs relative transition-all duration-200
                        ${hasEntry 
                          ? isCurrentDay
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md transform scale-110' 
                            : 'bg-gradient-to-r from-amber-300 to-orange-300 text-white font-semibold shadow-sm hover:shadow-md cursor-pointer'
                          : isCurrentDay
                            ? 'bg-blue-100 text-blue-700 font-bold border-2 border-blue-300'
                            : 'text-gray-400 hover:bg-gray-100'
                        }
                      `}
                    >
                      {format(day, 'd')}
                      {hasEntry && (
                        <div className="absolute -top-1 -right-1 text-sm">
                          {isCurrentDay ? '🔥' : '✨'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivational Message */}
            <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-700 font-medium">
                {calculateStreak() === 0 
                  ? "🎯 Start your journaling journey today!"
                  : calculateStreak() === 1 
                    ? "🚀 Great start! Keep the momentum going!"
                    : calculateStreak() < 7 
                      ? `💪 ${calculateStreak()} days strong! You're building a great habit!`
                      : calculateStreak() < 30 
                        ? `🔥 Amazing ${calculateStreak()}-day streak! You're on fire!`
                        : `🏆 Incredible ${calculateStreak()}-day streak! You're a journaling champion!`
                }
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center space-x-2">
              <Link href="/journal">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  onClick={() => setShowCalendar(false)}
                >
                  ✍️ Journal Now
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
