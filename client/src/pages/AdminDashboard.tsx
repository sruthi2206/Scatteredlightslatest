import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Loader2, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Link as LinkIcon, 
  Check, 
  X,
  Search,
  Files,
  Copy
} from "lucide-react";
import { useLocation } from "wouter";

// Define types for healing ritual
interface HealingRitual {
  id: number;
  name: string;
  type: string;
  description: string;
  instructions: string;
  targetChakra: string | null;
  targetEmotion: string | null;
  featuredImage?: string | null;
  videoUrl?: string | null;
  zoomLink?: string | null;
  eventDate?: Date | string | null;
  isFeatured?: boolean;
  status?: string;
}

interface HealingRitualFormData {
  name: string;
  type: string;
  description: string;
  instructions: string;
  targetChakra: string | null;
  targetEmotion: string | null;
  featuredImage: string | null;
  videoUrl: string | null;
  zoomLink: string | null;
  eventDate: string | null;
  isFeatured: boolean;
  status: string;
}

interface MediaItem {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize?: number;
  altText?: string;
  uploadedById: number;
  uploadDate: Date;
}

interface UploadResponse {
  success: boolean;
  url: string;
  fileName: string;
}

const CHAKRAS = [
  { value: "root", label: "Root" },
  { value: "sacral", label: "Sacral" },
  { value: "solar_plexus", label: "Solar Plexus" },
  { value: "heart", label: "Heart" },
  { value: "throat", label: "Throat" },
  { value: "third_eye", label: "Third Eye" },
  { value: "crown", label: "Crown" },
];

const EMOTIONS = [
  { value: "anger", label: "Anger" },
  { value: "fear", label: "Fear" },
  { value: "sadness", label: "Sadness" },
  { value: "joy", label: "Joy" },
  { value: "disgust", label: "Disgust" },
  { value: "surprise", label: "Surprise" },
  { value: "anxiety", label: "Anxiety" },
  { value: "guilt", label: "Guilt" },
  { value: "shame", label: "Shame" },
  { value: "confusion", label: "Confusion" },
  { value: "doubt", label: "Doubt" },
  { value: "grief", label: "Grief" },
  { value: "depression", label: "Depression" },
];

const RITUAL_TYPES = [
  { value: "meditation", label: "Meditation" },
  { value: "visualization", label: "Visualization" },
  { value: "sound_healing", label: "Sound Healing" },
  { value: "affirmation", label: "Affirmation" },
  { value: "movement", label: "Movement" },
  { value: "somatic", label: "Somatic Practice" },
  { value: "journaling", label: "Journaling" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "breath_work", label: "Breath Work" },
];

// Drop zone component for file uploads
function DropZone({ 
  onFileDrop, 
  acceptedFileTypes,
  currentFileUrl,
  isUploading
}: { 
  onFileDrop: (file: File) => void;
  acceptedFileTypes: string[];
  currentFileUrl: string | null;
  isUploading: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (acceptedFileTypes.some(type => file.type.includes(type))) {
        onFileDrop(file);
      } else {
        alert(`Please upload a valid file type: ${acceptedFileTypes.join(', ')}`);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (acceptedFileTypes.some(type => file.type.includes(type))) {
        onFileDrop(file);
      } else {
        alert(`Please upload a valid file type: ${acceptedFileTypes.join(', ')}`);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  let icon;
  if (acceptedFileTypes.includes('image')) {
    icon = <ImageIcon className="h-12 w-12 text-muted-foreground" />;
  } else if (acceptedFileTypes.includes('video')) {
    icon = <Video className="h-12 w-12 text-muted-foreground" />;
  } else {
    icon = <Upload className="h-12 w-12 text-muted-foreground" />;
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
      onClick={handleBrowseClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept={acceptedFileTypes.map(type => `.${type}`).join(',')} 
        className="hidden" 
      />
      
      {currentFileUrl ? (
        acceptedFileTypes.includes('image') ? (
          <div className="relative">
            <img 
              src={currentFileUrl} 
              alt="Uploaded file preview" 
              className="max-h-40 max-w-full object-contain rounded-md" 
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
              <p className="text-white text-xs">Click to change image</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            <span>File uploaded. Click to change.</span>
          </div>
        )
      ) : (
        <>
          {icon}
          <div className="text-center">
            {isUploading ? (
              <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
            ) : (
              <>
                <p className="font-medium">Drag & drop file here, or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  {acceptedFileTypes.map(type => type.toUpperCase()).join(', ')} files only
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the dashboard
  const [dashboardTab, setDashboardTab] = useState("rituals");
  const [mediaSearchTerm, setMediaSearchTerm] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  
  // State for the form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRitual, setEditingRitual] = useState<HealingRitual | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<HealingRitualFormData>({
    name: "",
    type: "",
    description: "",
    instructions: "",
    targetChakra: null,
    targetEmotion: null,
    featuredImage: null,
    videoUrl: null,
    zoomLink: null,
    eventDate: null,
    isFeatured: false,
    status: "published"
  });

  // Query to fetch all healing rituals
  const {
    data: rituals,
    isLoading: ritualsLoading,
    error: ritualsError,
  } = useQuery({
    queryKey: ["/api/healing-rituals"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/healing-rituals");
      return response.json();
    },
  });
  
  // Query to fetch media items
  const {
    data: mediaItems,
    isLoading: mediaLoading,
    error: mediaError,
  } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/media");
      if (!response.ok) {
        if (response.status === 404) {
          // If the endpoint doesn't exist yet, return an empty array
          return [];
        }
        throw new Error("Failed to fetch media items");
      }
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: HealingRitualFormData) => {
      const response = await apiRequest("POST", "/api/healing-rituals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Healing ritual created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/healing-rituals"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create ritual: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: HealingRitualFormData }) => {
      const response = await apiRequest("PUT", `/api/healing-rituals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Healing ritual updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/healing-rituals"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update ritual: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete ritual mutation
  const deleteRitualMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/healing-rituals/${id}`);
      return response.status === 204;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Healing ritual deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/healing-rituals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete ritual: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/media/${id}`);
      return response.status === 204;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Media file deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete media: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!authLoading && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setLocation("/");
    }
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation, toast]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRitual) {
      updateMutation.mutate({ id: editingRitual.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle dropdown changes
  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle file upload for images
  const handleFileUpload = async (file: File, fieldName: string) => {
    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to the server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json() as UploadResponse;
      
      // Update the form data with the file URL
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Upload failed: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      instructions: "",
      targetChakra: null,
      targetEmotion: null,
      featuredImage: null,
      videoUrl: null,
      zoomLink: null,
      eventDate: null,
      isFeatured: false,
      status: "published"
    });
    setEditingRitual(null);
  };

  // Open dialog to edit a ritual
  const handleEdit = (ritual: HealingRitual) => {
    setEditingRitual(ritual);
    setFormData({
      name: ritual.name,
      type: ritual.type,
      description: ritual.description,
      instructions: ritual.instructions,
      targetChakra: ritual.targetChakra,
      targetEmotion: ritual.targetEmotion,
      featuredImage: ritual.featuredImage || null,
      videoUrl: ritual.videoUrl || null,
      zoomLink: ritual.zoomLink || null,
      eventDate: ritual.eventDate ? new Date(ritual.eventDate).toISOString().split('T')[0] : null,
      isFeatured: ritual.isFeatured || false,
      status: ritual.status || "published"
    });
    setIsDialogOpen(true);
  };

  // Confirm deletion of a ritual
  const handleDeleteRitual = (id: number) => {
    if (window.confirm("Are you sure you want to delete this ritual?")) {
      deleteRitualMutation.mutate(id);
    }
  };
  
  // Confirm deletion of a media item
  const handleDeleteMedia = (id: number) => {
    if (window.confirm("Are you sure you want to delete this media file?")) {
      deleteMediaMutation.mutate(id);
    }
  };
  
  // Handle media file selection
  const handleSelectMedia = (mediaUrl: string) => {
    navigator.clipboard.writeText(mediaUrl);
    toast({
      title: "Media URL Copied",
      description: "Media URL has been copied to your clipboard"
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Will be redirected by useEffect
  }

  const isPending = createMutation.isPending || updateMutation.isPending || deleteRitualMutation.isPending;

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage healing rituals and media files</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Ritual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingRitual ? "Edit Healing Ritual" : "Create New Healing Ritual"}</DialogTitle>
              <DialogDescription>
                {editingRitual 
                  ? "Update the details of this healing ritual." 
                  : "Enter the details of the new healing ritual."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="media">
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Basic info tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right">Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-right">Type</label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange("type", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select ritual type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RITUAL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="targetChakra" className="text-right">Target Chakra</label>
                    <Select 
                      value={formData.targetChakra || ""} 
                      onValueChange={(value) => handleSelectChange("targetChakra", value === "none" ? null : value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select target chakra (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="none-chakra" value="none">None</SelectItem>
                        {CHAKRAS.map(chakra => (
                          <SelectItem key={chakra.value} value={chakra.value}>
                            {chakra.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="targetEmotion" className="text-right">Target Emotion</label>
                    <Select 
                      value={formData.targetEmotion || ""} 
                      onValueChange={(value) => handleSelectChange("targetEmotion", value === "none" ? null : value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select target emotion (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="none-emotion" value="none">None</SelectItem>
                        {EMOTIONS.map(emotion => (
                          <SelectItem key={emotion.value} value={emotion.value}>
                            {emotion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">Description</label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="instructions" className="text-right">Instructions</label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      className="col-span-3"
                      rows={5}
                      required
                    />
                  </div>
                </TabsContent>

                {/* Media tab */}
                <TabsContent value="media" className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Featured Image</h3>
                    <p className="text-muted-foreground text-sm">Upload a featured image for this ritual</p>
                    <DropZone 
                      onFileDrop={(file) => handleFileUpload(file, "featuredImage")}
                      acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                      currentFileUrl={formData.featuredImage}
                      isUploading={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Video URL</h3>
                    <p className="text-muted-foreground text-sm">Enter a URL for an instructional video</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="videoUrl" className="text-right">Video URL</label>
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        value={formData.videoUrl || ""}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced tab */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="zoomLink" className="text-right">Zoom Link</label>
                      <Input
                        id="zoomLink"
                        name="zoomLink"
                        value={formData.zoomLink || ""}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="eventDate" className="text-right">Event Date</label>
                      <Input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={formData.eventDate || ""}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-1"></div>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Checkbox 
                          id="isFeatured" 
                          checked={formData.isFeatured} 
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("isFeatured", checked === true)
                          }
                        />
                        <label 
                          htmlFor="isFeatured" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Feature this ritual
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="status" className="text-right">Status</label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleSelectChange("status", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRitual ? "Update Ritual" : "Create Ritual"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="rituals">Healing Rituals</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="tokens">Token Usage</TabsTrigger>
        </TabsList>
        
        {/* Rituals Tab */}
        <TabsContent value="rituals">
          {ritualsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ritualsError ? (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-destructive">
                  Error loading healing rituals: {(ritualsError as Error).message}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>List of all healing rituals</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Chakra</TableHead>
                    <TableHead>Target Emotion</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rituals?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No healing rituals found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rituals?.map((ritual: HealingRitual) => (
                      <TableRow key={ritual.id}>
                        <TableCell className="font-medium">{ritual.name}</TableCell>
                        <TableCell>
                          {RITUAL_TYPES.find(t => t.value === ritual.type)?.label || ritual.type}
                        </TableCell>
                        <TableCell>
                          {ritual.targetChakra 
                            ? CHAKRAS.find(c => c.value === ritual.targetChakra)?.label 
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {ritual.targetEmotion 
                            ? EMOTIONS.find(e => e.value === ritual.targetEmotion)?.label 
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(ritual)}
                              disabled={isPending}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteRitual(ritual.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        {/* Media Library Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Upload and manage media files for your healing rituals
              </CardDescription>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media files..."
                    className="pl-8"
                    value={mediaSearchTerm}
                    onChange={(e) => setMediaSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedMediaType || ""}
                  onValueChange={(value) => setSelectedMediaType(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <DropZone
                  onFileDrop={(file) => handleFileUpload(file, '')}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg']}
                  currentFileUrl={null}
                  isUploading={isUploading}
                />
              </div>
            </CardHeader>
            <CardContent>
              {mediaLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : mediaError ? (
                <div className="text-center py-10">
                  <p className="text-red-500 mb-2">Failed to load media</p>
                  <p className="text-muted-foreground">
                    {mediaError instanceof Error ? mediaError.message : "Unknown error"}
                  </p>
                </div>
              ) : !mediaItems || mediaItems.length === 0 ? (
                <div className="text-center py-10">
                  <Files className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="mb-2">No media files found</p>
                  <p className="text-muted-foreground">Upload files to begin building your media library</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems
                    .filter((item: MediaItem) => {
                      // Filter by search term
                      if (mediaSearchTerm && !item.fileName.toLowerCase().includes(mediaSearchTerm.toLowerCase())) {
                        return false;
                      }
                      // Filter by type
                      if (selectedMediaType && !item.fileType.includes(selectedMediaType)) {
                        return false;
                      }
                      return true;
                    })
                    .map((item: MediaItem) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square bg-gray-100 relative">
                          {item.fileType.includes('image') ? (
                            <img 
                              src={item.fileUrl} 
                              alt={item.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : item.fileType.includes('video') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-12 w-12 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Files className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleSelectMedia(item.fileUrl)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy URL
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        <CardFooter className="p-2">
                          <div className="w-full overflow-hidden">
                            <p className="text-sm font-medium truncate" title={item.fileName}>
                              {item.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Usage Tab */}
        <TabsContent value="tokens">
          <TokenUsageAdminSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Token Usage Admin Section Component
function TokenUsageAdminSection() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Fetch token statistics
  const { data: tokenStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/token-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/token-stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch token stats');
      }
      return response.json();
    }
  });

  // Fetch token usage chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['/api/admin/token-usage-chart', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/admin/token-usage-chart?period=${selectedPeriod}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Token Usage Analytics</h2>
          <p className="text-muted-foreground">Monitor AI coaching token consumption and user quotas</p>
        </div>
        <Select value={selectedPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setSelectedPeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Token Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (Array.isArray(tokenStats) ? tokenStats.length : 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                Array.isArray(tokenStats) ? 
                  tokenStats.reduce((sum, user) => sum + (user.totalTokensUsed || 0), 0).toLocaleString() : 
                  0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                Array.isArray(tokenStats) ? 
                  tokenStats.reduce((sum, user) => sum + (user.estimatedCost || 0), 0).toFixed(2) : 
                  '0.00'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                Array.isArray(tokenStats) ? 
                  tokenStats.filter(user => (user.tokensUsedToday || 0) > 0).length : 
                  0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Token Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Token Usage</CardTitle>
          <CardDescription>Detailed breakdown of token consumption by user</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Total Tokens</TableHead>
                  <TableHead>Today</TableHead>
                  <TableHead>This Month</TableHead>
                  <TableHead>Monthly Quota</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Last Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tokenStats) && tokenStats.map((user: any) => (
                  <TableRow key={user.userId || user.id}>
                    <TableCell className="font-medium">{user.username || 'Unknown'}</TableCell>
                    <TableCell>{(user.totalTokensUsed || 0).toLocaleString()}</TableCell>
                    <TableCell>{(user.tokensUsedToday || 0).toLocaleString()}</TableCell>
                    <TableCell>{(user.tokensUsedThisMonth || 0).toLocaleString()}</TableCell>
                    <TableCell>{(user.monthlyQuota || 16000).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={(user.quotaRemaining || 0) < 1000 ? 'text-red-600' : 'text-green-600'}>
                        {(user.quotaRemaining || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>${(user.estimatedCost || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      {user.lastUsage ? new Date(user.lastUsage).toLocaleDateString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!Array.isArray(tokenStats) || tokenStats.length === 0) && !statsLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No user data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Chart */}
      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Trends</CardTitle>
            <CardDescription>Token consumption over time ({selectedPeriod}ly view)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(chartData) && chartData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{item.date || 'Unknown Date'}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {(item.tokens || 0).toLocaleString()} tokens
                        </span>
                        <span className="text-sm font-medium">
                          ${(item.cost || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(chartData) || chartData.length === 0) && !chartLoading && (
                    <div className="text-center text-muted-foreground py-8">
                      No chart data available for the selected period
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}