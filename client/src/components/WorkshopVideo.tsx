import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Play, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface WorkshopVideoProps {
  userId: number;
}

export default function WorkshopVideo({ userId }: WorkshopVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Fetch the latest workshop video
  const { data: workshopVideo, isLoading } = useQuery({
    queryKey: ['/api/media', 'latest-workshop'],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/media?type=workshop&limit=1`);
        if (!res.ok) {
          return null;
        }
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error('Error fetching workshop video:', error);
        return null;
      }
    },
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };
  
  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const handlePlayVideo = () => {
    setIsPlaying(true);
  };
  
  // Render video player or thumbnail with play button
  const renderVideo = () => {
    if (!workshopVideo?.url) {
      return (
        <div className="bg-neutral-100 aspect-video rounded-md flex items-center justify-center">
          <p className="text-neutral-400">No workshop video available</p>
        </div>
      );
    }
    
    const videoId = getYouTubeVideoId(workshopVideo.url);
    
    if (isPlaying && videoId) {
      return (
        <div className="aspect-video rounded-md overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={workshopVideo.title || "Workshop Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    // Thumbnail with play button
    return (
      <div 
        className="aspect-video rounded-md overflow-hidden relative cursor-pointer group"
        onClick={handlePlayVideo}
      >
        <img 
          src={videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/placeholder-workshop.jpg"}
          alt={workshopVideo.title || "Workshop Video"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Play className="h-8 w-8 text-[#483D8B] ml-1" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Featured Workshop</CardTitle>
        {workshopVideo && (
          <CardDescription className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(workshopVideo.createdAt)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3">
        {isLoading ? (
          <div className="aspect-video bg-neutral-100 rounded-md flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
          </div>
        ) : (
          <>
            {renderVideo()}
            {workshopVideo && !isPlaying && (
              <div className="mt-3">
                <h3 className="font-medium text-sm line-clamp-1">{workshopVideo.title}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 text-[#483D8B] p-0 h-auto font-normal hover:bg-transparent hover:text-[#7c3aed]"
                  onClick={handlePlayVideo}
                >
                  Watch Now
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}