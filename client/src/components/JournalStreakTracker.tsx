import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Star, Trophy, Flame, Target, CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, parseISO } from "date-fns";

interface JournalStreakTrackerProps {
  journalEntries: any[];
  onCelebrationComplete?: () => void;
}

export default function JournalStreakTracker({ journalEntries, onCelebrationComplete }: JournalStreakTrackerProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);

  // Calculate streak and today's status
  useEffect(() => {
    if (!journalEntries?.length) {
      setCurrentStreak(0);
      setHasJournaledToday(false);
      return;
    }

    // Check if user journaled today
    const today = new Date();
    const todayEntry = journalEntries.some(entry => 
      isSameDay(new Date(entry.createdAt), today)
    );
    setHasJournaledToday(todayEntry);

    // Calculate current streak
    const sortedEntries = journalEntries
      .map(entry => new Date(entry.createdAt))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = sortedEntries[i];
      
      // If this is the first entry and it's today, count it
      if (i === 0 && isSameDay(entryDate, currentDate)) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      
      // If this entry is from the expected previous day, continue streak
      if (isSameDay(entryDate, currentDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
  }, [journalEntries]);

  // Show celebration when user completes today's journal
  useEffect(() => {
    if (hasJournaledToday && currentStreak > 1) {
      setShowCelebration(true);
    }
  }, [hasJournaledToday, currentStreak]);

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

  // Get streak consistency percentage
  const getConsistencyPercentage = () => {
    if (!journalEntries?.length) return 0;
    const daysInMonth = getCalendarDays().length;
    const journaledDays = getCalendarDays().filter(day => hasEntryForDay(day)).length;
    return Math.round((journaledDays / daysInMonth) * 100);
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    onCelebrationComplete?.();
  };

  return (
    <>
      {/* Streak Counter */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-200 text-center">
          <div className="text-2xl font-bold text-indigo-800">{journalEntries?.length || 0}</div>
          <div className="text-xs text-indigo-600">Total Entries</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-200 text-center">
          <div className="text-2xl font-bold text-indigo-800">
            {journalEntries?.length > 0 
              ? (journalEntries.reduce((sum, entry) => sum + (entry.sentimentScore || 5), 0) / journalEntries.length).toFixed(1)
              : "0"}
          </div>
          <div className="text-xs text-indigo-600">Avg Mood</div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200 text-center relative">
          <div className="flex items-center justify-center mb-1">
            <Flame className="h-4 w-4 text-amber-600 mr-1" />
            <div className="text-2xl font-bold text-amber-800">{currentStreak}</div>
          </div>
          <div className="text-xs text-amber-600">Day Streak</div>
          {hasJournaledToday && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Consistency Indicator */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-indigo-800">This Month's Consistency</span>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
            {getConsistencyPercentage()}%
          </Badge>
        </div>
        <div className="w-full bg-indigo-100 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getConsistencyPercentage()}%` }}
          />
        </div>
        <p className="text-xs text-indigo-600 mt-2">
          {getConsistencyPercentage() >= 80 
            ? "🌟 Amazing consistency! Keep it up!" 
            : getConsistencyPercentage() >= 50 
              ? "💪 Good progress! Try to journal more regularly" 
              : "🎯 Let's build that habit! Every day counts"}
        </p>
      </div>

      {/* Celebration Dialog */}
      <AnimatePresence>
        {showCelebration && (
          <Dialog open={showCelebration} onOpenChange={handleCelebrationClose}>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  🎉 Well Done! 🎉
                </DialogTitle>
              </DialogHeader>
              
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-6xl"
                >
                  🏆
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentStreak} Day Streak! 🔥
                  </h3>
                  <p className="text-gray-600">
                    Yeah! You are one step ahead for achieving your goals
                  </p>
                </div>

                {/* Mini Calendar for Current Month */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                    {format(new Date(), "MMMM yyyy")}
                  </h4>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center font-medium text-gray-500 p-1">
                        {day}
                      </div>
                    ))}
                    {getCalendarDays().map((day, i) => {
                      const hasEntry = hasEntryForDay(day);
                      const isCurrentDay = isToday(day);
                      
                      return (
                        <div
                          key={i}
                          className={`
                            text-center p-1 rounded text-xs relative
                            ${isCurrentDay 
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold shadow-md' 
                              : hasEntry 
                                ? 'bg-green-100 text-green-700' 
                                : 'text-gray-400'
                            }
                          `}
                        >
                          {format(day, 'd')}
                          {hasEntry && (
                            <div className="absolute -top-0.5 -right-0.5">
                              {isCurrentDay ? '🌟' : '⭐'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  onClick={handleCelebrationClose}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Continue Journey ✨
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}