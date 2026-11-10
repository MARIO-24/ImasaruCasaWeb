import React, { useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
}

const MAX_CHAR_THRESHOLD = 170;

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
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-sand-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[250px] sm:h-[260px] select-none text-left relative">

      {/* Top Header: Stars & Decorative Quote */}
      <div className="flex items-center justify-between mb-3">
        {/* Stars */}
        <div
          className="flex items-center gap-1"
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

        {/* Decorative Quote Icon */}
        <Quote className="w-5 h-5 text-sand-300/80 -scale-x-100 flex-shrink-0" aria-hidden="true" />
      </div>

      {/* Comment Body */}
      <div className="flex-1 overflow-hidden flex flex-col justify-between mb-2">
        <div className={`overflow-y-auto no-scrollbar pr-1 ${isExpanded ? 'max-h-[115px] sm:max-h-[125px]' : 'max-h-[110px]'}`}>
          <p className="text-sm text-timber-800 leading-relaxed italic">
            "{displayText}"
          </p>
        </div>

        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-expanded={isExpanded}
            className="inline-block text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded mt-1.5 self-start"
          >
            {isExpanded ? 'Leer menos' : 'Leer más'}
          </button>
        )}
      </div>

      {/* Author & stay date */}
      <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-timber-500">
        <span className="font-bold text-timber-900 not-italic truncate mr-2">
          {review.author_name}
        </span>
        {review.stay_date && (
          <span className="text-timber-600 flex-shrink-0 font-medium">
            {review.stay_date}
          </span>
        )}
      </div>
    </div>
  );
};
