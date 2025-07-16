import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Send,
  ThumbsUp,
  Trash2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface PostAuthor {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
}

interface PostComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  user: PostAuthor;
}

interface PostReaction {
  id: number;
  postId: number;
  userId: number;
  reactionType: string;
}

interface PostCardProps {
  id: number;
  author: PostAuthor;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  reactions?: PostReaction[];
  comments?: PostComment[];
  onDelete?: (id: number) => void;
}

export default function PostCard({
  id,
  author,
  content,
  imageUrl,
  createdAt,
  onDelete
}: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = React.useState(false);
  const [comment, setComment] = React.useState("");
  
  // Get comments 
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/community/posts", id, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/community/posts/${id}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: showComments,
  });
  
  // Get reactions
  const { data: reactions = [] } = useQuery({
    queryKey: ["/api/community/posts", id, "reactions"],
    queryFn: async () => {
      const res = await fetch(`/api/community/posts/${id}/reactions`);
      if (!res.ok) throw new Error("Failed to fetch reactions");
      return res.json();
    },
  });
  
  // Post comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/community/posts/${id}/comments`, { content });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to post comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", id, "comments"] });
      setComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // React to post mutation
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.userId === user?.id && r.reactionType === reactionType
      );
      
      if (existingReaction) {
        // Remove reaction
        const res = await apiRequest("DELETE", `/api/community/posts/reactions/${existingReaction.id}`);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to remove reaction");
        }
        return { removed: true, reactionType };
      } else {
        // Add reaction
        const res = await apiRequest("POST", `/api/community/posts/${id}/reactions`, { reactionType });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to react to post");
        }
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", id, "reactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/community/posts/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete post");
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      if (onDelete) onDelete(id);
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handlePostComment = () => {
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };
  
  const handleReaction = (type: string) => {
    reactionMutation.mutate(type);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };
  
  const userReacted = (type: string) => {
    return reactions.some(r => r.userId === user?.id && r.reactionType === type);
  };
  
  const getReactionCount = (type: string) => {
    return reactions.filter(r => r.reactionType === type).length;
  };
  
  const isAuthor = user?.id === author.id;
  const isAdmin = user?.isAdmin;
  const canDelete = isAuthor || isAdmin;

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={author.avatarUrl || undefined} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
          
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500"
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        <p className="whitespace-pre-line">{content}</p>
        
        {imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Post image" 
              className="w-full h-auto object-cover max-h-80"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </CardContent>
      
      <div className="px-4 py-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            {getReactionCount("like") > 0 && (
              <span className="flex items-center">
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {getReactionCount("like")}
              </span>
            )}
            {getReactionCount("love") > 0 && (
              <span className="flex items-center ml-2">
                <Heart className="h-3.5 w-3.5 mr-1 text-red-500" />
                {getReactionCount("love")}
              </span>
            )}
          </div>
          
          {comments.length > 0 && (
            <span 
              className="cursor-pointer"
              onClick={() => setShowComments(!showComments)}
            >
              {comments.length} comment{comments.length !== 1 && 's'}
            </span>
          )}
        </div>
      </div>
      
      <Separator />
      
      <CardFooter className="py-2 px-4 justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 ${userReacted("like") ? "text-primary" : ""}`}
          onClick={() => handleReaction("like")}
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Like
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 ${userReacted("love") ? "text-red-500" : ""}`}
          onClick={() => handleReaction("love")}
        >
          <Heart className="mr-2 h-4 w-4" />
          Love
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Comment
        </Button>
      </CardFooter>
      
      {showComments && (
        <div className="px-4 py-2 bg-muted/30">
          {comments.map((comment) => (
            <div key={comment.id} className="mb-3 last:mb-1">
              <div className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatarUrl || undefined} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2 flex-1">
                  <div className="font-semibold text-sm">{comment.user.name}</div>
                  <div className="text-sm">{comment.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex space-x-2 mt-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
              />
              <Button 
                size="icon"
                onClick={handlePostComment}
                disabled={!comment.trim() || commentMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}