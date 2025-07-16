import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MediaUploadDialogProps {
  onUploadComplete?: () => void;
  buttonLabel?: string;
  children?: React.ReactNode;
}

export function MediaUploadDialog({ 
  onUploadComplete, 
  buttonLabel = "Upload Media",
  children
}: MediaUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(5); // Start with a small progress indicator
    
    try {
      // Create a FormData object to send the files
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Simulate upload progress with intervals
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Go up to 90% to give room for server processing
          if (prev < 90) {
            return prev + Math.floor(Math.random() * 5) + 1;
          }
          return prev;
        });
      }, 200);
      
      // Use fetch with credentials to ensure cookies are sent (for authentication)
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      // Clear the progress interval
      clearInterval(progressInterval);

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Complete the progress bar
      setUploadProgress(100);
      
      // Invalidate the media query cache to refresh the media list
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      
      // Wait a moment to show the completed progress bar before closing
      setTimeout(() => {
        // Reset state
        setUploadedFiles([]);
        setIsOpen(false);
        setIsUploading(false);
        
        // Show success message
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${result.files?.length || 0} file(s)`,
        });
        
        // Call the completion callback if provided
        if (onUploadComplete) {
          onUploadComplete();
        }
      }, 600);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            {buttonLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload images to use in your rituals and courses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isUploading ? (
            <div className="border rounded-md p-6 text-center bg-muted/10">
              <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-4" />
              <p className="text-sm font-medium mb-1">Uploading files...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">This may take a moment</p>
            </div>
          ) : (
            <div 
              className={`
                border-2 border-dashed rounded-md p-6 text-center cursor-pointer
                ${uploadedFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-gray-300/50'}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                {uploadedFiles.length > 0 
                  ? `${uploadedFiles.length} file(s) selected` 
                  : "Click or drag and drop to upload"
                }
              </p>
              <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files:</p>
              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between px-3 py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-8 h-8 rounded-md border overflow-hidden bg-gray-50">
                        {file.type.startsWith('image/') && (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="truncate text-sm">{file.name}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
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
  );
}

export default MediaUploadDialog;