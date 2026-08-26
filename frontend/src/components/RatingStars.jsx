import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, reviewCount, size = "sm", showValue = true }) {
  const starSize = size === "lg" ? "w-5 h-5" : size === "xs" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = rating >= star - 0.5 && rating < star;
          
          return (
            <Star
              key={star}
              className={`${starSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-xs font-semibold text-gray-800 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
