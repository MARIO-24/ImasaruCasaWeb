import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
}

const MAX_CHAR_THRESHOLD = 180;

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLong = review.comment.length > MAX_CHAR_THRESHOLD;

  // Truncate at natural word boundary
  const getTruncatedComment = (text: string) => {
    if (text.length <= MAX_CHAR_THRESHOLD) return text;
    const truncated = text.slice(0, MAX_CHAR_THRESHOLD);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  };

  const displayText = isExpanded || !isLong ? review.comment : `${getTruncatedComment(review.comment)}...`;

  return (
    <div className="p-6 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md">
      <div>
        {/* Stars */}
        <div
          className="flex items-center gap-1 mb-3"
          role="img"
          aria-label={`Puntuación: ${review.rating} de 5 estrellas`}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              aria-hidden="true"
              className={`w-4 h-4 ${
                idx < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-sand-300'
              }`}
            />
          ))}
        </div>

        {/* Comment */}
        <p className="text-sm text-timber-800 leading-relaxed italic">
          "{displayText}"
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="inline-block text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded mt-2 mb-2"
          >
            {isExpanded ? 'Leer menos' : 'Leer más'}
          </button>
        )}
      </div>

      {/* Author & date */}
      <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-timber-500 mt-4">
        <span className="font-bold text-timber-900 not-italic">{review.author_name}</span>
        {review.stay_date && <span>{review.stay_date}</span>}
      </div>
    </div>
  );
};

