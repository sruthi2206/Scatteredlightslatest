import { Button } from "@/components/ui/button";

interface RitualCardProps {
  title: string;
  description: string;
  chakraType?: string | null;
  isCompleted?: boolean;
  mainImageUrl: string;
  thumbnailUrl: string;
  onDetails: () => void;
  onAction: () => void;
  actionLabel: string;
  showCompletedBadge?: boolean;
}

export function RitualCard({
  title,
  description,
  chakraType,
  isCompleted = false,
  mainImageUrl,
  thumbnailUrl,
  onDetails,
  onAction,
  actionLabel,
  showCompletedBadge = true
}: RitualCardProps) {
  return (
    <div className="w-full flex flex-col md:flex-row bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      {/* Left column with text content - takes 60% on larger screens */}
      <div className="p-6 md:p-10 md:w-3/5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
          <p className="text-gray-700 mb-8 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={onDetails}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2"
            >
              Learn More
            </Button>
            
            {(!isCompleted || !showCompletedBadge) && (
              <Button
                variant="outline"
                onClick={onAction}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full"
              >
                {actionLabel}
              </Button>
            )}
            
            {isCompleted && showCompletedBadge && (
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
      <div className="md:w-2/5 flex items-center justify-center bg-gray-50">
        <div className="flex space-x-4 p-4">
          {/* Main image */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shadow-md">
            <img 
              src={mainImageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail image - side by side, not overlapping */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg self-end">
            <img 
              src={thumbnailUrl} 
              alt="Thumbnail" 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                // If the image fails to load, try using a different path format or fallback
                const target = e.target as HTMLImageElement;
                if (target.src !== '/images/placeholder-ritual.jpg') {
                  target.src = '/images/placeholder-ritual.jpg';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}