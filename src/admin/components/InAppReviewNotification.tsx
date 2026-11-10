import React, { useEffect } from 'react';
import { Star, MessageSquare, ArrowRight, X, Sparkles } from 'lucide-react';
import { Review } from '../../types';

export interface InAppReviewNotificationProps {
  review: Review | null;
  onNavigateToReviews: () => void;
  onDismiss: () => void;
}

export const InAppReviewNotification: React.FC<InAppReviewNotificationProps> = ({
  review,
  onNavigateToReviews,
  onDismiss,
}) => {
  useEffect(() => {
    if (!review) return;

    // Gentle haptic feedback on mobile if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {}
    }

    // Auto-dismiss after 12 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);

    return () => clearTimeout(timer);
  }, [review, onDismiss]);

  if (!review) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-[420px] z-50 animate-bounce-in">
      <div className="bg-timber-950 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-timber-800 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-sand-100" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-400 block">
                ¡Nueva reseña en tiempo real!
              </span>
              <h4 className="font-serif text-base font-bold text-white leading-tight">
                {review.author_name}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-timber-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rating and snippet */}
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1">
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < (review.rating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-white/20'
                }`}
              />
            ))}
            <span className="text-xs text-white/80 font-bold ml-1.5">
              {review.rating}/5 estrellas
            </span>
          </div>

          <p className="text-xs text-sand-200 line-clamp-2 leading-relaxed">
            "{review.comment}"
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onNavigateToReviews();
              onDismiss();
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ver y moderar en Reseñas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

