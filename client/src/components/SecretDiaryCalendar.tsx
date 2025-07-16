import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, BookOpen, Calendar as CalendarIcon, Heart, Star } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO } from "date-fns";

interface JournalEntry {
  id: number;
  content: string;
  gratitude?: string[];
  affirmation?: string;
  shortTermGoals?: string[];
  longTermVision?: string;
  emotionTags?: string[];
  chakraTags?: string[];
  createdAt: string;
}

interface SecretDiaryCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
}

const SecretDiaryCalendar: React.FC<SecretDiaryCalendarProps> = ({
  isOpen,
  onClose,
  journalEntries = []
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntryForDate = (date: Date) => {
    return journalEntries.find(entry => {
      const entryDate = parseISO(entry.createdAt);
      return isSameDay(entryDate, date);
    });
  };

  const hasEntryForDate = (date: Date) => {
    return !!getEntryForDate(date);
  };

  const handleDateClick = (date: Date) => {
    const entry = getEntryForDate(date);
    if (entry) {
      setSelectedEntry(entry);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatEntryDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEEE, MMMM do, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <>
      {/* Main Calendar Dialog */}
      <Dialog open={isOpen && !selectedEntry} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
              Secret Diary Calendar
            </DialogTitle>
            <DialogDescription>
              Click on highlighted dates to view your journal entries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h3 className="text-lg font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-neutral-500 p-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map(day => {
                const hasEntry = hasEntryForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    className={`
                      aspect-square p-2 rounded-lg text-sm relative transition-colors
                      ${!isCurrentMonth ? 'text-neutral-300' : 'text-neutral-700'}
                      ${isTodayDate ? 'ring-2 ring-purple-400' : ''}
                      ${hasEntry 
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium' 
                        : 'hover:bg-neutral-100'
                      }
                    `}
                    onClick={() => handleDateClick(day)}
                    disabled={!hasEntry}
                    whileHover={hasEntry ? { scale: 1.05 } : undefined}
                    whileTap={hasEntry ? { scale: 0.95 } : undefined}
                  >
                    {format(day, 'd')}
                    {hasEntry && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Entry count */}
            <div className="text-center text-sm text-neutral-600">
              {journalEntries.length} entries in your Secret Diary
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
              {selectedEntry && formatEntryDate(selectedEntry.createdAt)}
            </DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Main content */}
                {selectedEntry.content && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-800 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Journal Entry
                    </h4>
                    <Card className="bg-neutral-50">
                      <CardContent className="p-4">
                        <p className="text-neutral-700 whitespace-pre-wrap">
                          {selectedEntry.content}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Gratitude */}
                {selectedEntry.gratitude && selectedEntry.gratitude.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-800 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      Gratitude
                    </h4>
                    <div className="space-y-2">
                      {selectedEntry.gratitude.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span className="text-neutral-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affirmation */}
                {selectedEntry.affirmation && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-800 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-pink-500" />
                      Affirmation
                    </h4>
                    <Card className="bg-pink-50 border-pink-200">
                      <CardContent className="p-4">
                        <p className="text-pink-800 italic">"{selectedEntry.affirmation}"</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Short-term goals */}
                {selectedEntry.shortTermGoals && selectedEntry.shortTermGoals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-800">Short-term Goals</h4>
                    <div className="space-y-2">
                      {selectedEntry.shortTermGoals.map((goal, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          <span className="text-neutral-700">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Long-term vision */}
                {selectedEntry.longTermVision && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-800">Long-term Vision</h4>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-blue-800">{selectedEntry.longTermVision}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Tags */}
                {((selectedEntry.emotionTags && selectedEntry.emotionTags.length > 0) ||
                  (selectedEntry.chakraTags && selectedEntry.chakraTags.length > 0)) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-800">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.emotionTags?.map((tag, index) => (
                        <Badge key={`emotion-${index}`} variant="secondary" className="bg-green-100 text-green-800">
                          {tag}
                        </Badge>
                      ))}
                      {selectedEntry.chakraTags?.map((tag, index) => (
                        <Badge key={`chakra-${index}`} variant="secondary" className="bg-purple-100 text-purple-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedEntry(null)}
            >
              Back to Calendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecretDiaryCalendar;