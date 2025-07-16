import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, Heart, Users, Share2, Bell, BellOff, 
  Filter, MessageSquareHeart, Calendar, Search, Plus 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import EditProfileModal from "@/components/EditProfileModal";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";

// Interface for the mock data
interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  isVirtual: boolean;
  isFree: boolean;
  attendees: number;
  isAttending: boolean;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "article" | "video" | "meditation" | "practice";
  author: string;
  thumbnail?: string;
  link: string;
}

// Mock data for resources
const mockResources: Resource[] = [
  {
    id: 1,
    title: "Understanding Your Inner Child",
    description: "A comprehensive guide to working with and healing your inner child to resolve past trauma.",
    type: "article",
    author: "Dr. Maya Richards",
    thumbnail: "https://images.unsplash.com/photo-1516627145497-ae6968895b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5uZXIlMjBjaGlsZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    link: "#"
  },
  {
    id: 2,
    title: "Chakra Alignment Meditation",
    description: "A guided 30-minute meditation to balance all seven chakras and enhance energy flow.",
    type: "meditation",
    author: "Sarah Patel",
    link: "#"
  },
  {
    id: 3,
    title: "Shadow Work Journal Prompts",
    description: "50 powerful journal prompts to explore and integrate your shadow aspects.",
    type: "practice",
    author: "James Wilson",
    thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8am91cm5hbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    link: "#"
  }
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch community events
  const { 
    data: events = [], 
    isLoading: isLoadingEvents,
    error: eventsError,
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

  // Fetch community posts
  const { 
    data: posts,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['/api/community/posts'],
    queryFn: async () => {
      const response = await fetch('/api/community/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      return data;
    }
  });

  // Handle post deletion
  const handleDeletePost = (postId: number) => {
    refetchPosts();
  };
  
  // Handle attending an event
  const handleAttendEvent = (eventId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }
    
    // For now this just redirects to the events page
    // We'll implement proper registration there
    window.location.href = "/events";
  };
  
  // Get avatar fallback (initials from name)
  const getAvatarFallback = (name: string = "") => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get badge color based on post type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "article":
        return "bg-blue-100 text-blue-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "meditation":
        return "bg-indigo-100 text-indigo-800";
      case "practice":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Format date for events
  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

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
              Scattered Lights Community
            </h1>
            <p className="text-neutral-600 max-w-3xl">
              Connect with fellow seekers on the spiritual healing journey. Share experiences, 
              learn from others, and grow together in this supportive community.
            </p>
          </div>
          
          {/* Three-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - User Profile */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden sticky top-24">
                <div className="relative h-24 bg-gradient-to-r from-[#9B7EDE] to-[#5E4AE3]">
                  <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-6">
                    <Avatar className="h-16 w-16 border-4 border-white">
                      <AvatarImage src={user?.avatarUrl || ""} />
                      <AvatarFallback>{user ? getAvatarFallback(user.name) : "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="pt-14 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{user?.name || "Guest"}</h2>
                      <p className="text-sm text-neutral-500">
                        {user ? `@${user.username}` : "Sign in to join the community"}
                      </p>
                    </div>
                    {/*   {user && (
            <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-1"
                        onClick={() => setIsEditProfileOpen(true)}
                      >
                        Edit
                      </Button> 
                    )} */}
                  </div>
                  
                  {user && (
                    <>
                      <div className="mt-4">
                        <p className="text-sm">
                          {user?.bio || "Healing journey enthusiast passionate about balancing my root chakra and connecting with my higher self."}
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">My Interests</div>
                        <div className="flex flex-wrap gap-1">
                          {/* Default interests if user has none */}
                          <Badge variant="outline" className="bg-neutral-50">Shadow Work</Badge>
                          <Badge variant="outline" className="bg-neutral-50">Meditation</Badge>
                          <Badge variant="outline" className="bg-neutral-50">Chakra Balancing</Badge>
                          <Badge variant="outline" className="bg-neutral-50">Energy Healing</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">My Progress</span>
                          <Link href="/dashboard">
                            <Button variant="link" size="sm" className="h-auto p-0">
                              View All
                            </Button>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-neutral-100 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold">7</div>
                            <div className="text-xs text-neutral-600">Rituals</div>
                          </div>
                          <div className="bg-neutral-100 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold">4</div>
                            <div className="text-xs text-neutral-600">Journals</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!user && (
                    <div className="mt-4 pt-4 border-t">
                      <Link href="/auth">
                        <Button className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <p className="text-xs text-center mt-2 text-neutral-500">
                        Join our community to connect with like-minded souls
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Middle column - Posts Feed */}
            <div className="lg:col-span-6">
              <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
                  <TabsTrigger value="my-posts" className="flex-1">My Posts</TabsTrigger>
                  <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feed">
                  {user && <CreatePostForm />}
                  
                  {isLoadingPosts ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-[#483D8B] border-t-transparent rounded-full"></div>
                    </div>
                  ) : postsError ? (
                    <Card className="p-8 text-center">
                      <p className="text-red-500 mb-4">Failed to load posts</p>
                      <Button onClick={() => refetchPosts()}>Retry</Button>
                    </Card>
                  ) : posts && posts.length === 0 ? (
                    <Card className="p-8 text-center">
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-neutral-500 mb-4">Be the first to share your healing journey!</p>
                      {user && (
                        <Button onClick={() => document.getElementById('create-post')?.focus()}>
                          Create Post
                        </Button>
                      )}
                    </Card>
                  ) : (
                    <div>
                      {posts && posts.map((post: any) => (
                        <PostCard 
                          key={post.id}
                          id={post.id}
                          author={{
                            id: post.userId,
                            name: post.user?.name || "Unknown",
                            username: post.user?.username || "user",
                            avatarUrl: post.user?.avatarUrl
                          }}
                          content={post.content}
                          imageUrl={post.imageUrl}
                          createdAt={post.createdAt}
                          onDelete={handleDeletePost}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="my-posts">
                  {!user ? (
                    <Card className="p-8 text-center">
                      <h3 className="text-lg font-semibold mb-2">Sign in to view your posts</h3>
                      <p className="text-neutral-500 mb-4">Join our community to share your healing journey</p>
                      <Link href="/auth">
                        <Button>Sign In</Button>
                      </Link>
                    </Card>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold">Coming Soon</h3>
                      <p className="text-neutral-500 mt-2">This feature is under development</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="saved">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">Coming Soon</h3>
                    <p className="text-neutral-500 mt-2">This feature is under development</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right column - Events and Resources */}
            <div className="lg:col-span-3">
              <div className="space-y-6 sticky top-24">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input 
                    placeholder="Search community..." 
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Upcoming Events */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Upcoming Events</CardTitle>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {isLoadingEvents ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : eventsError ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-red-500">Failed to load events</p>
                      </div>
                    ) : events.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-neutral-500">No upcoming events</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {events.slice(0, 2).map((event: any) => (
                          <div key={event.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-neutral-500 mt-1">
                              {formatEventDate(event.date)} • {event.time || ""}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-neutral-500 mt-1">
                              <Users className="h-3 w-3" />
                              <span>{Array.isArray(event.attendees) ? event.attendees.length : 0} attending</span>
                            </div>
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-xs mt-1" 
                              onClick={() => handleAttendEvent(event.id)}
                            >
                              Register Now
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Link href="/events">
                        <Button variant="outline" size="sm" className="w-full">
                          View All Events
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Resources 
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Community Resources</CardTitle>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {mockResources.map((resource) => (
                        <div key={resource.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-sm text-neutral-500 mt-1">
                                By {resource.author}
                              </div>
                              <Badge className={`mt-1 ${getTypeBadge(resource.type)}`}>
                                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                              </Badge>
                            </div>
                            {resource.thumbnail && (
                              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={resource.thumbnail} 
                                  alt={resource.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <Link href={resource.link}>
                            <Button variant="link" className="h-auto p-0 text-xs mt-1">
                              View Resource
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Browse All Resources
                    </Button>
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
