import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Users, MapPin, Video, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventsPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch community events
  const { 
    data: events = [], 
    isLoading,
    error,
    refetch: refetchEvents 
  } = useQuery({
    queryKey: ['/api/community/events'],
    queryFn: async () => {
      const response = await fetch('/api/community/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return await response.json();
    }
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      if (!user) throw new Error("You must be logged in to register for events");
      
      const response = await apiRequest("POST", `/api/community/events/${eventId}/register`, {
        userId: user.id
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register for event");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      refetchEvents();
      toast({
        title: "Registration successful",
        description: "You've been registered for the event",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Format date for events
  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  // Handle event registration
  const handleRegisterEvent = (eventId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate(eventId);
  };

  // Check if the current user is registered for an event
  const isUserRegisteredForEvent = (event: any) => {
    if (!user) return false;
    
    // Get attendees for this event
    const eventAttendees = event.attendees || [];
    
    // Check if current user ID is in the attendees list
    return eventAttendees.some((attendee: any) => attendee.userId === user.id);
  };
  
  // Prepare events data with registration status
  const eventsWithRegistrationStatus = events.map((event: any) => ({
    ...event,
    isRegistered: isUserRegisteredForEvent(event)
  }));
  
  // Filter events based on search and filter
  const filteredEvents = eventsWithRegistrationStatus.filter((event: any) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === "all") return matchesSearch;
    if (filter === "free") return matchesSearch && event.isFree === true;
    if (filter === "paid") return matchesSearch && event.isFree === false;
    if (filter === "online") return matchesSearch && event.isVirtual === true;
    if (filter === "in-person") return matchesSearch && event.isVirtual === false;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#6A5ACD]">
              Community Events
            </h1>
            <p className="text-neutral-600 max-w-3xl">
              Join our community events to connect with like-minded individuals, learn new healing techniques, 
              and deepen your spiritual practice.
            </p>
          </div>
          
          {/* Filter and Search Controls */}
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-md">
              <Input 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="free">Free Events</SelectItem>
                  <SelectItem value="paid">Premium Events</SelectItem>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="in-person">In-Person Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Events Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-[#483D8B] border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-500 mb-4">Failed to load events</p>
              <Button onClick={() => refetchEvents()}>Retry</Button>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-neutral-500 mb-4">
                {searchTerm 
                  ? "No events match your search criteria. Try a different search term."
                  : "There are no upcoming events at the moment. Check back later."
                }
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: any) => (
                <Card key={event.id} className="overflow-hidden h-full flex flex-col">
                  <div className="h-40 overflow-hidden">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/600x400/indigo/white?text=Scattered+Lights';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-r from-purple-400 to-indigo-600">
                        <span className="text-white text-lg font-semibold">{event.title}</span>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant="outline" className={event.isFree ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}>
                        {event.isFree ? "Free" : "Premium"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-neutral-600 mb-4 flex-1">
                      {event.description ? 
                        (event.description.length > 120 ? 
                          `${event.description.substring(0, 120)}...` : 
                          event.description) : 
                        "No description available"}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-neutral-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {event.eventDate ? 
                            new Date(event.eventDate).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            "Date TBA"}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-neutral-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{event.eventTime || "Time TBA"}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-neutral-500">
                        {event.isVirtual ? (
                          <Video className="h-4 w-4 mr-2" />
                        ) : (
                          <MapPin className="h-4 w-4 mr-2" />
                        )}
                        <span>{event.isVirtual ? "Virtual" : "In-Person"}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-neutral-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.attendees?.length || 0} attending</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-neutral-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.isRegistered ? (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <h4 className="text-sm font-medium text-green-800">You're registered!</h4>
                          
                          {event.isVirtual && (
                            <div className="mt-2 space-y-2">
                              {event.zoomLink && (
                                <a 
                                  href={event.zoomLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Join Zoom Meeting
                                </a>
                              )}
                              
                              {event.videoUrl && (
                                <a 
                                  href={event.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                  </svg>
                                  Watch Live Stream
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mt-4"
                        variant="default"
                        disabled={registerMutation.isPending}
                        onClick={() => handleRegisterEvent(event.id)}
                      >
                        {registerMutation.isPending ? "Processing..." : "Register Now"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}