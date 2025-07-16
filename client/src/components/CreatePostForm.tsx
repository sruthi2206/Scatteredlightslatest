import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Loader2, Send, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CreatePostForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [showImageInput, setShowImageInput] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", "/api/community/posts", postData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setContent("");
      setImageUrl("");
      setImagePreview("");
      setShowImageInput(false);
      toast({
        title: "Post created",
        description: "Your post has been shared with the community",
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
  
  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }
    
    const postData: { content: string; imageUrl?: string } = {
      content,
    };
    
    if (imageUrl.trim()) {
      postData.imageUrl = imageUrl;
    }
    
    createPostMutation.mutate(postData);
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Only set preview if URL is not empty
    if (url.trim()) {
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };
  
  const clearImage = () => {
    setImageUrl("");
    setImagePreview("");
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatarUrl || undefined} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "there"}?`}
              className="min-h-[100px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {showImageInput && (
              <div className="space-y-2">
                <Label htmlFor="image-url" className="text-sm font-medium">
                  Image URL
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setShowImageInput(false);
                      clearImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {imagePreview && (
                  <div className="relative mt-2 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview}
                      alt="Preview" 
                      className="max-h-40 w-auto object-cover"
                      onError={() => {
                        toast({
                          title: "Invalid image URL",
                          description: "Please enter a valid image URL",
                          variant: "destructive",
                        });
                        clearImage();
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="justify-between border-t px-4 py-3">
        <div>
          {!showImageInput && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowImageInput(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || createPostMutation.isPending}
          size="sm"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Post
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}