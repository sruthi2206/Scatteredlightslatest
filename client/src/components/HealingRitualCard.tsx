import { Button } from "@/components/ui/button";

interface HealingRitualCardProps {
  title: string;
  description: string;
  chakraType?: string;
  authorName?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  isCompleted?: boolean;
  onDetails?: () => void;
  onAdd?: () => void;
  onComplete?: () => void;
}

export function HealingRitualCard({
  title,
  description,
  chakraType = "",
  authorName = "",
  imageUrl = "/images/crown_chakra.jpg",
  thumbnailUrl = "/images/root_chakra.jpg",
  isCompleted = false,
  onDetails,
  onAdd
}: HealingRitualCardProps) {
  // Truncate description if too long
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="w-full flex flex-col md:flex-row bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      {/* Left column with text content - takes 60% on larger screens */}
      <div className="p-8 md:w-3/5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">{title}</h2>
          {authorName && (
            <p className="text-sm text-gray-500 mb-3">By {authorName}</p>
          )}
          <p className="text-gray-700 mb-6">
            {truncateText(description, 260)}
          </p>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-4">
            <Button
              onClick={onDetails}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2"
            >
              Learn More
            </Button>
            
            {!isCompleted && onAdd && (
              <Button
                variant="outline"
                onClick={onAdd}
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 rounded-full"
              >
                {isCompleted ? "Completed" : "Add to Practice"}
              </Button>
            )}
            
            {isCompleted && (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Right column with images - takes 40% on larger screens */}
      <div className="md:w-2/5 flex p-4 md:p-6 items-center justify-center">
        <div className="relative">
          {/* Main image - larger and in the back */}
          <div className="w-60 h-40 md:w-80 md:h-60 rounded-lg overflow-hidden shadow-md z-10">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Instructor image - smaller and in front, absolutely positioned */}
          <div className="absolute -bottom-4 -left-4 w-24 h-32 rounded-lg overflow-hidden shadow-lg border-2 border-white">
            <img 
              src={thumbnailUrl} 
              alt="Instructor" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}