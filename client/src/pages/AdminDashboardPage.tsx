import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { z } from "zod";
import { 
  Loader2, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  Image, 
  X, 
  Grid3X3, 
  List, 
  Plus, 
  Video as VideoIcon, 
  Check, 
  ExternalLink, 
  Youtube, 
  Filter, 
  FilterX, 
  Info,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  BarChart3,
  Settings as SettingsIcon
} from "lucide-react";
import MediaUploadDialog from "@/components/MediaUploadDialog";
import { convertYouTubeUrl, isYouTubeUrl } from "@/lib/youtube-utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Admin Dashboard Main Component
export default function AdminDashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("rituals");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!user) {
      setLocation("/admin");
    }
    // TODO: Add admin role check once implemented
  }, [user, setLocation]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Scattered Lights Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatar.png" alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/")}>
                  View Site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex container mx-auto py-6 px-4">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden md:block">
          <Card className="h-full">
            <CardContent className="p-4">
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant={activeTab === "dashboard" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "rituals" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("rituals")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Healing Rituals
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "events" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("events")}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Community Events
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "media" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("media")}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Media Library
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "users" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("users")}
                  >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "tokens" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("tokens")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Token Tracking
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === "settings" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("settings")}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-6">
          <Card className="h-full">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 md:hidden">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="rituals">Rituals</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                  <DashboardOverview />
                </TabsContent>

                <TabsContent value="rituals">
                  <RitualsManager />
                </TabsContent>

                <TabsContent value="events">
                  <EventsManager />
                </TabsContent>

                <TabsContent value="media">
                  <MediaLibrary />
                </TabsContent>

                <TabsContent value="users">
                  <UsersManager />
                </TabsContent>

                <TabsContent value="tokens">
                  <TokenUsageManager />
                </TabsContent>

                <TabsContent value="settings">
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  <SettingsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return await res.json();
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalUsers: 0,
          totalRituals: 0,
          totalEvents: 0,
          totalMedia: 0
        };
      }
    },
  });

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto" />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Users" value={stats?.totalUsers || 0} icon={<UsersIcon className="h-8 w-8" />} />
        <StatCard title="Healing Rituals" value={stats?.totalRituals || 0} icon={<Sparkles className="h-8 w-8" />} />
        <StatCard title="Community Events" value={stats?.totalEvents || 0} icon={<CalendarIcon className="h-8 w-8" />} />
        <StatCard title="Media Files" value={stats?.totalMedia || 0} icon={<Image className="h-8 w-8" />} />
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="h-auto py-4 flex flex-col items-center" onClick={() => document.getElementById('add-ritual-button')?.click()}>
          <Plus className="h-6 w-6 mb-2" />
          <span>Add New Ritual</span>
        </Button>
        <Button className="h-auto py-4 flex flex-col items-center" onClick={() => document.getElementById('add-event-button')?.click()}>
          <Plus className="h-6 w-6 mb-2" />
          <span>Schedule Event</span>
        </Button>
        <Button className="h-auto py-4 flex flex-col items-center" onClick={() => document.getElementById('upload-media-button')?.click()}>
          <Upload className="h-6 w-6 mb-2" />
          <span>Upload Media</span>
        </Button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Import additional icons
import { 
  Sparkles, 
  FileText,
  XCircle,
  Clipboard,
  LayoutGrid,
} from "lucide-react";

// Media Library Component
function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch media items
  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/media');
        if (!res.ok) throw new Error('Failed to fetch media');
        return await res.json();
      } catch (error) {
        console.error('Error fetching media:', error);
        return [];
      }
    },
  });

  // Delete media item mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/media/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete media');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Media deleted",
        description: "The media has been successfully deleted",
      });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setIsUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setUploadedFiles([]);
      setIsUploadDialogOpen(false);
      setIsUploading(false);
      toast({
        title: "Upload successful",
        description: "Your files have been uploaded",
      });
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Prevent default drag behaviors
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle file deletion from upload list
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle upload
  const handleUpload = () => {
    if (uploadedFiles.length > 0) {
      uploadMediaMutation.mutate(uploadedFiles);
    }
  };

  // Filter media items based on search query
  const filteredMedia = mediaItems.filter((item: any) => {
    // Safely check if properties exist before calling toLowerCase()
    const filenameMatch = item.fileName && 
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const descriptionMatch = item.description && 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return filenameMatch || descriptionMatch;
  });

  // Handle media item click
  const handleMediaClick = (item: any) => {
    setSelectedFile(item);
  };

  // Handle file deletion
  const handleDeleteMedia = () => {
    if (selectedFile) {
      deleteMediaMutation.mutate(selectedFile.id);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "The media URL has been copied to clipboard",
      });
    });
  };
  
  // Using the imported convertYouTubeUrl function from @/lib/youtube-utils

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <div className="flex space-x-2">
          <Button 
            id="upload-media-button"
            onClick={() => setIsUploadDialogOpen(true)}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Media
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-none rounded-l-md"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-none rounded-r-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media files..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Youtube className="h-4 w-4 mr-2" />
                Add YouTube URL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add YouTube Video</DialogTitle>
                <DialogDescription>
                  Enter a YouTube URL to add it to your ritual courses
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=abcdefg"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Regular YouTube URLs will be automatically converted to embed format
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube-title">Title (Optional)</Label>
                  <Input
                    id="youtube-title"
                    placeholder="Meditation for Heart Chakra"
                  />
                </div>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Handle YouTube URL conversion and save
                    const youtubeUrl = (document.getElementById('youtube-url') as HTMLInputElement).value;
                    const youtubeTitle = (document.getElementById('youtube-title') as HTMLInputElement).value || 'YouTube Video';
                    
                    // Convert YouTube URL to embed format
                    const embedUrl = convertYouTubeUrl(youtubeUrl);
                    
                    if (embedUrl) {
                      toast({
                        title: "YouTube URL Added",
                        description: "The YouTube URL has been converted to embed format and copied to clipboard",
                      });
                      
                      // Copy to clipboard
                      navigator.clipboard.writeText(embedUrl);
                    } else {
                      toast({
                        title: "Invalid YouTube URL",
                        description: "Please enter a valid YouTube URL",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Copy Embed URL
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-md">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No media files found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No results match your search query. Try something different."
              : "Upload media files to see them here."}
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>Upload Media</Button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Media Grid/List */}
          <div className={`flex-1 ${selectedFile ? 'hidden md:block' : ''}`}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item: any) => (
                  <div 
                    key={item.id}
                    className={`
                      relative group cursor-pointer overflow-hidden rounded-md border
                      ${selectedFile?.id === item.id ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => handleMediaClick(item)}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      {item.fileType && item.fileType.startsWith('image/') ? (
                        <img 
                          src={item.fileUrl} 
                          alt={item.fileName} 
                          className="h-full w-full object-cover transition-all group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 text-white w-full truncate">
                        <p className="truncate text-sm font-medium">{item.filename}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((item: any) => (
                      <TableRow 
                        key={item.id}
                        className={selectedFile?.id === item.id ? 'bg-muted/50' : ''}
                        onClick={() => handleMediaClick(item)}
                      >
                        <TableCell>
                          {item.fileType && item.fileType.startsWith('image/') ? (
                            <Image className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {item.fileType && item.fileType.startsWith('image/') && (
                              <div className="h-8 w-8 mr-2 overflow-hidden rounded border">
                                <img src={item.fileUrl} alt={item.fileName} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <span className="truncate max-w-[200px]">{item.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(item.size)}</TableCell>
                        <TableCell>{new Date(item.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(item);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Media Details */}
          {selectedFile && (
            <div className="w-full md:w-80 space-y-4 border rounded-md p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">File Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 w-8 md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="aspect-square w-full overflow-hidden rounded-md border bg-muted">
                {selectedFile.fileType && selectedFile.fileType.startsWith('image/') ? (
                  <img 
                    src={selectedFile.fileUrl} 
                    alt={selectedFile.fileName} 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">File name:</span>
                  <p className="truncate">{selectedFile.fileName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <p>{selectedFile.fileType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Size:</span>
                  <p>{formatFileSize(selectedFile.fileSize)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Uploaded:</span>
                  <p>{new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">URL:</span>
                  <div className="flex mt-1">
                    <Input 
                      value={selectedFile.fileUrl} 
                      readOnly 
                      className="text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(selectedFile.fileUrl)}
                      className="ml-2"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between space-x-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(selectedFile.fileUrl)}
                  className="flex-1"
                >
                  Copy URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMedia}
                  disabled={deleteMediaMutation.isPending}
                  className="flex-1"
                >
                  {deleteMediaMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media Files</DialogTitle>
            <DialogDescription>
              Upload images and other media files to use in your content.
            </DialogDescription>
          </DialogHeader>

          <div
            className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm mb-1">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Images, videos, documents and other files
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            <Button variant="secondary" size="sm">
              Browse Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setUploadedFiles([]);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Rituals Manager Component
function RitualsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all healing rituals
  const { data: rituals = [], isLoading } = useQuery({
    queryKey: ['/api/healing-rituals'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/healing-rituals');
        if (!res.ok) throw new Error('Failed to fetch healing rituals');
        return await res.json();
      } catch (error) {
        console.error('Error fetching healing rituals:', error);
        return [];
      }
    },
  });

  // Delete ritual mutation
  const deleteRitualMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/healing-rituals/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete ritual');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/healing-rituals'] });
      toast({
        title: "Ritual deleted",
        description: "The ritual has been successfully deleted",
      });
      setIsDeleting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });

  // Filter rituals based on search term
  const filteredRituals = rituals.filter((ritual: any) => 
    ritual.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ritual.description && ritual.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle ritual deletion
  const handleDeleteRitual = (id: number) => {
    setIsDeleting(true);
    deleteRitualMutation.mutate(id);
  };

  // Handle editing a ritual
  const handleEditRitual = (ritual: any) => {
    setSelectedRitual(ritual);
    setIsEditDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Healing Rituals</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rituals..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            id="add-ritual-button"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Ritual
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredRituals.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-md">
          <h3 className="text-lg font-semibold mb-2">No rituals found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "No results match your search query. Try something different."
              : "There are no healing rituals available. Add one to get started."}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>Add New Ritual</Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Target</TableHead>
                <TableHead className="hidden md:table-cell">Course URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRituals.map((ritual: any) => (
                <TableRow key={ritual.id}>
                  <TableCell className="font-medium">{ritual.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{ritual.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {ritual.type || "General"} | {ritual.targetChakra || ritual.targetEmotion || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{ritual.type || "General"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ritual.targetChakra ? 
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {ritual.targetChakra}
                      </Badge> 
                      : null}
                    {ritual.targetEmotion ? 
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-1">
                        {ritual.targetEmotion}
                      </Badge> 
                      : null}
                    {!ritual.targetChakra && !ritual.targetEmotion && "N/A"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ritual.courseUrl ? (
                      <span className="text-blue-600 hover:underline">{new URL(ritual.courseUrl).pathname}</span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRitual(ritual)}
                        title="Edit Ritual"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteRitual(ritual.id)}
                        disabled={isDeleting}
                        title="Delete Ritual"
                      >
                        {isDeleting && ritual.id === selectedRitual?.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Ritual Add/Edit Dialog will be implemented here */}
      <RitualDialog 
        isOpen={isAddDialogOpen || isEditDialogOpen} 
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedRitual(null);
        }}
        ritual={selectedRitual}
        isEditing={isEditDialogOpen}
      />
    </div>
  );
}

// Ritual Dialog Component for Add/Edit
function RitualDialog({ 
  isOpen, 
  onClose, 
  ritual = null, 
  isEditing = false 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  ritual?: any | null;
  isEditing?: boolean;
}) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    instructions: '',
    targetChakra: '',
    targetEmotion: '',
    thumbnailUrl: '',
    courseUrl: '',
    videoUrl: '',
    duration: '30min',
    // Lesson 1 fields
    lesson1Title: '',
    lesson1Description: '',
    lesson1Duration: '10min',
    lesson1VideoUrl: '',
    // Lesson 2 fields
    lesson2Title: '',
    lesson2Description: '',
    lesson2Duration: '15min',
    lesson2VideoUrl: '',
    // Lesson 3 fields
    lesson3Title: '',
    lesson3Description: '',
    lesson3Duration: '5min',
    lesson3VideoUrl: '',
  });
  const [step, setStep] = useState<'details' | 'media' | 'course'>('details');
  const [selectedMainImage, setSelectedMainImage] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Media library for selecting images
  const { data: mediaItems = [], refetch: refetchMedia } = useQuery({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/media');
        if (!res.ok) throw new Error('Failed to fetch media');
        return await res.json();
      } catch (error) {
        console.error('Error fetching media:', error);
        return [];
      }
    },
    enabled: isOpen,
  });

  // Function to load media items
  const loadMediaItems = () => {
    refetchMedia();
  };
  
  // Using the imported convertYouTubeUrl function from @/lib/youtube-utils

  // Filter only images
  const imageMedia = mediaItems.filter((item: any) => 
    item.fileType && item.fileType.startsWith('image/')
  );

  // Reset form on dialog open/close
  useEffect(() => {
    if (isOpen && isEditing && ritual) {
      setForm({
        name: ritual.name || '',
        type: ritual.type || '',
        description: ritual.description || '',
        instructions: ritual.instructions || '',
        targetChakra: ritual.targetChakra || '',
        targetEmotion: ritual.targetEmotion || '',
        thumbnailUrl: ritual.thumbnailUrl || '',
        courseUrl: ritual.courseUrl || '',
        videoUrl: ritual.videoUrl || '',
        duration: ritual.duration || '30min',
        // Lesson 1 fields
        lesson1Title: ritual.lesson1Title || '',
        lesson1Description: ritual.lesson1Description || '',
        lesson1Duration: ritual.lesson1Duration || '10min',
        lesson1VideoUrl: ritual.lesson1VideoUrl || '',
        // Lesson 2 fields
        lesson2Title: ritual.lesson2Title || '',
        lesson2Description: ritual.lesson2Description || '',
        lesson2Duration: ritual.lesson2Duration || '15min',
        lesson2VideoUrl: ritual.lesson2VideoUrl || '',
        // Lesson 3 fields
        lesson3Title: ritual.lesson3Title || '',
        lesson3Description: ritual.lesson3Description || '',
        lesson3Duration: ritual.lesson3Duration || '5min',
        lesson3VideoUrl: ritual.lesson3VideoUrl || '',
      });
      setSelectedMainImage(ritual.mainImageUrl || null);
      setSelectedThumbnail(ritual.thumbnailUrl || null);
    } else if (isOpen && !isEditing) {
      setForm({
        name: '',
        type: '',
        description: '',
        instructions: '',
        targetChakra: '',
        targetEmotion: '',
        thumbnailUrl: '',
        courseUrl: '',
        videoUrl: '',
        lesson1VideoUrl: '',
        lesson2VideoUrl: '',
        lesson3VideoUrl: '',
        duration: '30min',
        // Lesson 1 fields
        lesson1Title: '',
        lesson1Description: '',
        lesson1Duration: '10min',
        // Lesson 2 fields
        lesson2Title: '',
        lesson2Description: '',
        lesson2Duration: '15min',
        // Lesson 3 fields
        lesson3Title: '',
        lesson3Description: '',
        lesson3Duration: '5min',
      });
      setSelectedMainImage(null);
      setSelectedThumbnail(null);
    }
    
    // Reset step when opening dialog
    if (isOpen) {
      setStep('details');
    }
  }, [isOpen, isEditing, ritual]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If this is a videoUrl field and looks like a YouTube URL, convert it
    if (name === 'videoUrl' && (value.includes('youtube.com') || value.includes('youtu.be'))) {
      const embedUrl = convertYouTubeUrl(value);
      if (embedUrl) {
        setForm(prev => ({ ...prev, [name]: embedUrl }));
        
        // Show a toast notification if the URL was converted
        if (embedUrl !== value) {
          toast({
            title: "YouTube URL Converted",
            description: "URL automatically converted to embed format for compatibility",
          });
        }
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // For all other fields or non-YouTube URLs
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Create/Update ritual mutation
  const saveRitualMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing 
        ? `/api/healing-rituals/${ritual.id}` 
        : '/api/healing-rituals';
      
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await apiRequest(method, url, data);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} ritual`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/healing-rituals'] });
      toast({
        title: isEditing ? "Ritual updated" : "Ritual created",
        description: `The ritual has been successfully ${isEditing ? 'updated' : 'created'}`,
      });
      setIsSubmitting(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if videoUrl is a regular YouTube URL and convert it
    let videoUrl = form.videoUrl;
    if (videoUrl && !videoUrl.includes('youtube.com/embed') && videoUrl.includes('youtube.com')) {
      const embeddedUrl = convertYouTubeUrl(videoUrl);
      if (embeddedUrl) {
        videoUrl = embeddedUrl;
      }
    }
    
    // Check and convert lesson video URLs if they are regular YouTube URLs
    let lesson1VideoUrl = form.lesson1VideoUrl;
    if (lesson1VideoUrl && !lesson1VideoUrl.includes('youtube.com/embed') && lesson1VideoUrl.includes('youtube.com')) {
      const embeddedUrl = convertYouTubeUrl(lesson1VideoUrl);
      if (embeddedUrl) {
        lesson1VideoUrl = embeddedUrl;
      }
    }
    
    let lesson2VideoUrl = form.lesson2VideoUrl;
    if (lesson2VideoUrl && !lesson2VideoUrl.includes('youtube.com/embed') && lesson2VideoUrl.includes('youtube.com')) {
      const embeddedUrl = convertYouTubeUrl(lesson2VideoUrl);
      if (embeddedUrl) {
        lesson2VideoUrl = embeddedUrl;
      }
    }
    
    let lesson3VideoUrl = form.lesson3VideoUrl;
    if (lesson3VideoUrl && !lesson3VideoUrl.includes('youtube.com/embed') && lesson3VideoUrl.includes('youtube.com')) {
      const embeddedUrl = convertYouTubeUrl(lesson3VideoUrl);
      if (embeddedUrl) {
        lesson3VideoUrl = embeddedUrl;
      }
    }
    
    // Prepare data for submission
    const data = {
      ...form,
      videoUrl,
      lesson1VideoUrl,
      lesson2VideoUrl,
      lesson3VideoUrl,
      mainImageUrl: selectedMainImage,
      thumbnailUrl: selectedThumbnail,
    };
    
    saveRitualMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Healing Ritual' : 'Add New Healing Ritual'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details of this healing ritual'
              : 'Create a new healing ritual for users to practice'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b">
          <div 
            className={`px-4 py-2 cursor-pointer border-b-2 ${step === 'details' ? 'border-primary font-medium' : 'border-transparent'}`}
            onClick={() => setStep('details')}
          >
            Details
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer border-b-2 ${step === 'media' ? 'border-primary font-medium' : 'border-transparent'}`}
            onClick={() => setStep('media')}
          >
            Media
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer border-b-2 ${step === 'course' ? 'border-primary font-medium' : 'border-transparent'}`}
            onClick={() => setStep('course')}
          >
            Course Content
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-1">
          <form onSubmit={handleSubmit}>
            {/* Details Tab */}
            {step === 'details' && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Ritual Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter ritual name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      placeholder="Meditation, Breathwork, etc."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter a detailed description"
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      value={form.instructions}
                      onChange={handleChange}
                      placeholder="Step-by-step instructions for the ritual"
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetChakra">Target Chakra</Label>
                      <Select 
                        name="targetChakra" 
                        value={form.targetChakra || "none"} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, targetChakra: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a chakra" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="root">Root Chakra</SelectItem>
                          <SelectItem value="sacral">Sacral Chakra</SelectItem>
                          <SelectItem value="solar_plexus">Solar Plexus Chakra</SelectItem>
                          <SelectItem value="heart">Heart Chakra</SelectItem>
                          <SelectItem value="throat">Throat Chakra</SelectItem>
                          <SelectItem value="third_eye">Third Eye Chakra</SelectItem>
                          <SelectItem value="crown">Crown Chakra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="targetEmotion">Target Emotion</Label>
                      <Select 
                        name="targetEmotion" 
                        value={form.targetEmotion || "none"} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, targetEmotion: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an emotion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="anxiety">Anxiety</SelectItem>
                          <SelectItem value="depression">Depression</SelectItem>
                          <SelectItem value="anger">Anger</SelectItem>
                          <SelectItem value="fear">Fear</SelectItem>
                          <SelectItem value="grief">Grief</SelectItem>
                          <SelectItem value="shame">Shame</SelectItem>
                          <SelectItem value="guilt">Guilt</SelectItem>
                          <SelectItem value="joy">Joy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Media Tab */}
            {step === 'media' && (
              <div className="space-y-6 py-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Main Image</h3>
                    <MediaUploadDialog 
                      onUploadComplete={() => loadMediaItems()}
                      buttonLabel="Upload New Image"
                    >
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Image
                      </Button>
                    </MediaUploadDialog>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select an image from your media library to use as the main image for this ritual.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[200px] overflow-y-auto p-1">
                    {imageMedia.map((media: any) => (
                      <div 
                        key={media.id}
                        className={`
                          relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer
                          ${selectedMainImage === media.fileUrl ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}
                        `}
                        onClick={() => setSelectedMainImage(media.fileUrl)}
                      >
                        <img 
                          src={media.fileUrl} 
                          alt={media.fileName} 
                          className="w-full h-full object-cover"
                        />
                        {selectedMainImage === media.fileUrl && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Thumbnail Image</h3>
                    <MediaUploadDialog 
                      onUploadComplete={() => loadMediaItems()}
                      buttonLabel="Upload New Image"
                    >
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Image
                      </Button>
                    </MediaUploadDialog>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a thumbnail image to appear alongside the main image.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[200px] overflow-y-auto p-1">
                    {imageMedia.map((media: any) => (
                      <div 
                        key={`thumb-${media.id}`}
                        className={`
                          relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer
                          ${selectedThumbnail === media.fileUrl ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}
                        `}
                        onClick={() => setSelectedThumbnail(media.fileUrl)}
                      >
                        <img 
                          src={media.fileUrl} 
                          alt={media.fileName} 
                          className="w-full h-full object-cover"
                        />
                        {selectedThumbnail === media.fileUrl && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Video URL</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter a YouTube or other video URL to be displayed on the ritual page.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="videoUrl">YouTube or Video URL</Label>
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        value={form.videoUrl}
                        onChange={handleChange}
                        placeholder="e.g., https://www.youtube.com/embed/abc123"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        For YouTube videos, use format: https://www.youtube.com/embed/VIDEO_ID
                      </p>
                    </div>
                    
                    {form.videoUrl && (
                      <div className="mt-3 border rounded-md p-3">
                        <p className="font-medium mb-2">Video Preview</p>
                        <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
                          {form.videoUrl.includes('youtube.com/embed') ? (
                            <iframe
                              src={form.videoUrl}
                              className="w-full h-full rounded-md"
                              title="Video preview"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="text-center p-4">
                              <VideoIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Video URL set: {form.videoUrl}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Course Content Tab */}
            {step === 'course' && (
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="courseUrl">Course URL</Label>
                  <Input
                    id="courseUrl"
                    name="courseUrl"
                    value={form.courseUrl}
                    onChange={handleChange}
                    placeholder="e.g., /courses/meditation-mastery"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL path for the detailed course page when users click "Learn More"
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={form.videoUrl}
                    onChange={handleChange}
                    placeholder="e.g., https://www.youtube.com/embed/abc123"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL for embedded video content in the course page
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="duration">Course Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g., 15 minutes, 1 hour"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected time to complete the practice or course
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-medium mb-3">Curriculum Sections</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The course curriculum will be displayed on the course page. You can add up to 3 lessons.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Lesson 1</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lesson1Title">Title</Label>
                          <Input
                            id="lesson1Title"
                            name="lesson1Title"
                            value={form.lesson1Title}
                            onChange={handleChange}
                            placeholder="Introduction to the practice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson1Description">Description</Label>
                          <Textarea
                            id="lesson1Description"
                            name="lesson1Description"
                            value={form.lesson1Description}
                            onChange={handleChange}
                            placeholder="Brief description of the lesson"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson1Duration">Duration</Label>
                          <Select
                            value={form.lesson1Duration || "10min"}
                            onValueChange={(value) => setForm(prev => ({ ...prev, lesson1Duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5min">5 minutes</SelectItem>
                              <SelectItem value="10min">10 minutes</SelectItem>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="20min">20 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="lesson1VideoUrl">Video URL</Label>
                          <Input
                            id="lesson1VideoUrl"
                            name="lesson1VideoUrl"
                            value={form.lesson1VideoUrl}
                            onChange={handleChange}
                            placeholder="e.g., https://www.youtube.com/embed/abc123"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Lesson 1 video URL (YouTube embed or direct video link)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Lesson 2</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lesson2Title">Title</Label>
                          <Input
                            id="lesson2Title"
                            name="lesson2Title"
                            value={form.lesson2Title}
                            onChange={handleChange}
                            placeholder="The Main Practice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson2Description">Description</Label>
                          <Textarea
                            id="lesson2Description"
                            name="lesson2Description"
                            value={form.lesson2Description}
                            onChange={handleChange}
                            placeholder="Brief description of the lesson"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson2Duration">Duration</Label>
                          <Select
                            value={form.lesson2Duration || "15min"}
                            onValueChange={(value) => setForm(prev => ({ ...prev, lesson2Duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5min">5 minutes</SelectItem>
                              <SelectItem value="10min">10 minutes</SelectItem>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="20min">20 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="lesson2VideoUrl">Video URL</Label>
                          <Input
                            id="lesson2VideoUrl"
                            name="lesson2VideoUrl"
                            value={form.lesson2VideoUrl}
                            onChange={handleChange}
                            placeholder="e.g., https://www.youtube.com/embed/abc123"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Lesson 2 video URL (YouTube embed or direct video link)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Lesson 3</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="lesson3Title">Title</Label>
                          <Input
                            id="lesson3Title"
                            name="lesson3Title"
                            value={form.lesson3Title}
                            onChange={handleChange}
                            placeholder="Integration & Daily Practice"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson3Description">Description</Label>
                          <Textarea
                            id="lesson3Description"
                            name="lesson3Description"
                            value={form.lesson3Description}
                            onChange={handleChange}
                            placeholder="Brief description of the lesson"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson3Duration">Duration</Label>
                          <Select
                            value={form.lesson3Duration || "5min"}
                            onValueChange={(value) => setForm(prev => ({ ...prev, lesson3Duration: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5min">5 minutes</SelectItem>
                              <SelectItem value="10min">10 minutes</SelectItem>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="20min">20 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="lesson3VideoUrl">Video URL</Label>
                          <Input
                            id="lesson3VideoUrl"
                            name="lesson3VideoUrl"
                            value={form.lesson3VideoUrl}
                            onChange={handleChange}
                            placeholder="e.g., https://www.youtube.com/embed/abc123"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Lesson 3 video URL (YouTube embed or direct video link)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                

              </div>
            )}
          </form>
        </div>
        
        <DialogFooter className="border-t p-4">
          <div className="flex gap-2 justify-between w-full">
            <div>
              {step !== 'details' && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step === 'media' ? 'details' : 'media')}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step !== 'course' ? (
                <Button onClick={() => setStep(step === 'details' ? 'media' : 'course')}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditing ? 'Update Ritual' : 'Create Ritual'
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Events Manager Component
function EventsManager() {
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch community events
  const { data: communityEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/community/events'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/community/events');
        if (!res.ok) throw new Error('Failed to fetch community events');
        return await res.json();
      } catch (error) {
        console.error('Error fetching community events:', error);
        return [];
      }
    },
  });
  
  // Create/Update event mutation
  const eventMutation = useMutation({
    mutationFn: async (data: { id?: number; eventData: any }) => {
      const { id, eventData } = data;
      const isUpdate = !!id;
      
      const response = await apiRequest(
        isUpdate ? "PATCH" : "POST",
        isUpdate ? `/api/community/events/${id}` : "/api/community/events",
        eventData
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isUpdate ? 'update' : 'create'} event`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/events'] });
      setEventDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: selectedEvent ? "Event updated" : "Event created",
        description: selectedEvent 
          ? "The event has been successfully updated" 
          : "Your event has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/community/events/${id}`);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete event');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/events'] });
      setSelectedEvent(null);
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Fetch event attendees
  const { data: attendees = [], isLoading: isLoadingAttendees } = useQuery({
    queryKey: ['/api/community/events', selectedEvent?.id, 'attendees'],
    queryFn: async () => {
      if (!selectedEvent) return [];
      
      try {
        const res = await fetch(`/api/community/events/${selectedEvent.id}/attendees`);
        if (!res.ok) throw new Error('Failed to fetch attendees');
        return await res.json();
      } catch (error) {
        console.error('Error fetching attendees:', error);
        return [];
      }
    },
    enabled: !!selectedEvent && attendeesDialogOpen,
  });
  
  // Handle creating/updating an event
  const handleSaveEvent = () => {
    const eventForm = document.getElementById('event-form') as HTMLFormElement;
    if (!eventForm) return;
    
    const formData = new FormData(eventForm);
    const eventData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      eventDate: new Date(formData.get('eventDate') as string).toISOString(),
      eventTime: formData.get('eventTime') as string,
      duration: parseInt(formData.get('duration') as string) || 60,
      isVirtual: formData.get('isVirtual') === 'true',
      isFree: formData.get('isFree') === 'true',
      zoomLink: formData.get('zoomLink') as string,
      status: formData.get('status') as string || 'upcoming',
      featuredImage: formData.get('featuredImage') as string,
    };
    
    if (selectedEvent) {
      eventMutation.mutate({ id: selectedEvent.id, eventData });
    } else {
      eventMutation.mutate({ eventData });
    }
  };
  
  // Handle event deletion
  const handleDeleteEvent = (id: number) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEventMutation.mutate(id);
    }
  };
  
  // Handle opening edit dialog
  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };
  
  // Handle opening attendees dialog
  const handleViewAttendees = (event: any) => {
    setSelectedEvent(event);
    setAttendeesDialogOpen(true);
  };
  
  // Filter events based on search query and status filter
  const filteredEvents = communityEvents.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && event.status === filter;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Get badge variant based on event status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Ongoing</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      default:
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">{status}</Badge>;
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Community Events</h2>
        <Button 
          id="add-event-button"
          onClick={() => {
            setSelectedEvent(null);
            setEventDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Event
        </Button>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search events..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Events Display */}
      {isLoadingEvents ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border rounded-md p-8 text-center">
          <Info className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Add your first community event to get started"}
          </p>
          {(searchQuery || filter !== "all") && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
            >
              <FilterX className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event: any) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {event.featuredImage && (
                  <div className="w-full md:w-1/4">
                    <img 
                      src={event.featuredImage} 
                      alt={event.title}
                      className="h-full w-full object-cover aspect-video md:aspect-square"
                    />
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDate(event.eventDate)} at {event.eventTime}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant={event.isVirtual ? "default" : "outline"}>
                          {event.isVirtual ? "Virtual" : "In-Person"}
                        </Badge>
                        <Badge variant={event.isFree ? "outline" : "default"}>
                          {event.isFree ? "Free" : "Paid"}
                        </Badge>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="line-clamp-2">{event.description}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewAttendees(event)}
                      >
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Attendees
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Event Dialog - Create/Edit Events */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {selectedEvent 
                ? "Make changes to the event details" 
                : "Fill in the details to create a new community event"}
            </DialogDescription>
          </DialogHeader>
          
          <form id="event-form" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title" 
                  name="title"
                  defaultValue={selectedEvent?.title || ""} 
                  placeholder="e.g., Chakra Meditation Workshop"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input 
                  id="eventDate" 
                  name="eventDate"
                  type="date" 
                  defaultValue={selectedEvent?.eventDate 
                    ? new Date(selectedEvent.eventDate).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0]
                  } 
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventTime">Event Time</Label>
                <Input 
                  id="eventTime" 
                  name="eventTime"
                  type="time" 
                  defaultValue={selectedEvent?.eventTime || "19:00"} 
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input 
                  id="duration" 
                  name="duration"
                  type="number" 
                  min="1"
                  defaultValue={selectedEvent?.duration || 60} 
                />
              </div>
              
              <div>
                <Label htmlFor="isVirtual">Event Type</Label>
                <Select 
                  defaultValue={selectedEvent?.isVirtual ? "true" : "false"}
                  name="isVirtual"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Virtual / Online</SelectItem>
                    <SelectItem value="false">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="isFree">Price Type</Label>
                <Select 
                  defaultValue={selectedEvent?.isFree ? "true" : "false"}
                  name="isFree"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Free Event</SelectItem>
                    <SelectItem value="false">Premium / Paid Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                            
              <div>
                <Label htmlFor="zoomLink">Zoom Link</Label>
                <Input 
                  id="zoomLink" 
                  name="zoomLink"
                  placeholder="https://zoom.us/j/..." 
                  defaultValue={selectedEvent?.zoomLink || ""}
                />
              </div>
              
              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input 
                  id="featuredImage" 
                  name="featuredImage"
                  placeholder="/uploads/event-image.jpg" 
                  defaultValue={selectedEvent?.featuredImage || ""}
                />
              </div>
              
              {selectedEvent && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    defaultValue={selectedEvent?.status || "upcoming"}
                    name="status"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Event Description</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Describe the event..."
                defaultValue={selectedEvent?.description || ""}
                className="min-h-32"
                required
              />
            </div>
          </form>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEvent}
              disabled={eventMutation.isPending}
            >
              {eventMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedEvent ? "Updating..." : "Creating..."}
                </>
              ) : (
                selectedEvent ? "Update Event" : "Create Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={attendeesDialogOpen} onOpenChange={setAttendeesDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Event Attendees</DialogTitle>
            <DialogDescription>
              {selectedEvent ? `Manage attendees for ${selectedEvent.title}` : "Manage attendees"}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingAttendees ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <h3 className="text-lg font-semibold mb-2">No Attendees Yet</h3>
              <p className="text-gray-500">
                No one has registered for this event yet.
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee: any) => (
                    <TableRow key={attendee.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={attendee.user?.avatarUrl || "/images/avatar.png"} 
                              alt={attendee.user?.name} 
                            />
                            <AvatarFallback>
                              {attendee.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{attendee.user?.name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">@{attendee.user?.username || "user"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-xs text-muted-foreground">Email: {attendee.user?.email}</div>
                          <div className="text-xs text-muted-foreground">Phone: {attendee.user?.phoneNumber || "Not provided"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(attendee.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attendee.attended ? "default" : "outline"}>
                          {attendee.attended ? "Attended" : "Not attended"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Event Form Component for creating and editing events
function EventForm({ 
  onSubmit, 
  initialData = null, 
  isEditing = false 
}: { 
  onSubmit: (data: any) => void; 
  initialData?: any; 
  isEditing?: boolean;
}) {
  // Parse date string to Date object for the datepicker
  const parseInitialDate = () => {
    if (initialData?.eventDate) {
      return new Date(initialData.eventDate);
    }
    return new Date();
  };

  // Form validation schema
  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    eventDate: z.date({
      required_error: "Event date is required",
    }),
    eventTime: z.string().min(1, "Event time is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    maxAttendees: z.coerce.number().min(1, "Limit must be at least 1"),
    isVirtual: z.boolean().default(true),
    isFree: z.boolean().default(true),
    zoomLink: z.string().optional(),
    videoUrl: z.string().optional(),
    featuredImage: z.string().optional(),
    status: z.string().default("upcoming"),
  });

  // React Hook Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      eventDate: parseInitialDate(),
      eventTime: initialData?.eventTime || "19:00",
      duration: initialData?.duration || 60,
      maxAttendees: initialData?.maxAttendees || 20,
      isVirtual: initialData?.isVirtual !== undefined ? initialData.isVirtual : true,
      isFree: initialData?.isFree !== undefined ? initialData.isFree : true,
      zoomLink: initialData?.zoomLink || "",
      videoUrl: initialData?.videoUrl || "",
      featuredImage: initialData?.featuredImage || "",
      status: initialData?.status || "upcoming",
    },
  });

  // Handle form submission
  function onFormSubmit(data: z.infer<typeof formSchema>) {
    // Format the date to ISO string
    const formattedData = {
      ...data,
      eventDate: data.eventDate.toISOString(),
    };
    onSubmit(formattedData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Title */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chakra Meditation Workshop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Event Date */}
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Time */}
          <FormField
            control={form.control}
            name="eventTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Attendees */}
          <FormField
            control={form.control}
            name="maxAttendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendance Limit</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Type */}
          <FormField
            control={form.control}
            name="isVirtual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ? "virtual" : "in-person"}
                    onValueChange={(value) => field.onChange(value === "virtual")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual / Online</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price Type */}
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ? "free" : "paid"}
                    onValueChange={(value) => field.onChange(value === "free")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Event</SelectItem>
                      <SelectItem value="paid">Premium / Paid Event</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Zoom Link - Only show if isVirtual is true */}
          {form.watch("isVirtual") && (
            <FormField
              control={form.control}
              name="zoomLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zoom Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://zoom.us/j/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Add the Zoom meeting link for virtual events
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Video URL */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/..." {...field} />
                </FormControl>
                <FormDescription>
                  Add a YouTube video URL for promotional content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured Image */}
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="/uploads/event-image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Add the URL of an image from the Media Library
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status - Only show for editing */}
          {isEditing && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Event Description - Full width textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the event..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Event" : "Create Event"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Token Usage Manager Component
function TokenUsageManager() {
  const [timeRange, setTimeRange] = useState('30');
  
  const { data: tokenStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/token-stats-aggregated'],
  });

  const { data: topUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/token-usage/top-users'],
  });

  const { data: dailyUsage, isLoading: dailyLoading } = useQuery({
    queryKey: ['/api/admin/token-usage/daily', timeRange],
  });

  const { data: userQuotas, isLoading: quotasLoading } = useQuery({
    queryKey: ['/api/admin/user-quotas'],
  });

  if (statsLoading || usersLoading || dailyLoading || quotasLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Token Usage Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Token Usage Analytics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">{tokenStats?.totalTokens?.toLocaleString() || 0}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${tokenStats?.totalCost?.toFixed(2) || '0.00'}</p>
              </div>
              <span className="text-green-600 text-xl">$</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{tokenStats?.activeUsers || 0}</p>
              </div>
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per User</p>
                <p className="text-2xl font-bold">{tokenStats?.avgTokensPerUser?.toFixed(0) || 0}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Token Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Tokens Used</th>
                  <th className="text-left py-3 px-4 font-medium">Cost</th>
                  <th className="text-left py-3 px-4 font-medium">Monthly Quota</th>
                  <th className="text-left py-3 px-4 font-medium">Usage %</th>
                </tr>
              </thead>
              <tbody>
                {topUsers?.map((user: any, index: number) => {
                  const usagePercentage = user.monthlyQuota > 0 ? (user.totalTokensUsed / user.monthlyQuota) * 100 : 0;
                  return (
                    <tr key={user.userId} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.username || `User ${user.userId}`}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.totalTokensUsed?.toLocaleString() || '0'}</td>
                      <td className="py-3 px-4">${(user.estimatedCost || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">{user.monthlyQuota?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                usagePercentage > 90 ? 'bg-red-600' : 
                                usagePercentage > 70 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{usagePercentage?.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Usage Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Token Usage</h3>
          <div className="h-64 flex items-end space-x-2">
            {dailyUsage?.map((day: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-blue-600 w-full rounded-t"
                  style={{ 
                    height: `${Math.max((day.tokens / Math.max(...dailyUsage.map((d: any) => d.tokens))) * 200, 4)}px` 
                  }}
                ></div>
                <div className="text-xs mt-2 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.tokens?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Quotas Management */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">User Quota Management</h3>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Set Custom Quota
            </Button>
          </div>
          <div className="space-y-3">
            {userQuotas?.slice(0, 10).map((quota: any) => (
              <div key={quota.userId} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{quota.username || `User ${quota.userId}`}</div>
                  <div className="text-sm text-muted-foreground">{quota.userEmail}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{quota.currentUsage?.toLocaleString()} / {quota.monthlyQuota?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">tokens this month</div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Users Manager Component
function UsersManager() {
  // Component implementation
  // Placeholder for now to avoid making this file too long
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>
      
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">User Management</h3>
        <p className="text-muted-foreground mb-4">
          Here you'll be able to manage users, view user profiles, and track user activity.
        </p>
      </div>
    </div>
  );
}

// Settings Manager Component
function SettingsManager() {
  // Component implementation
  // Placeholder for now to avoid making this file too long
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Application Settings</h3>
        <p className="text-muted-foreground mb-4">
          Here you'll be able to manage application settings, customize the site appearance, and configure integrations.
        </p>
      </div>
    </div>
  );
}