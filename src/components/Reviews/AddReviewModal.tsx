import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitReview } from '../../lib/supabase/client';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose }) => {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [stayDate, setStayDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setErrorMessage('Por favor introduce tu nombre y comentario.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { success, error } = await submitReview({
      author_name: authorName,
      rating,
      comment,
      stay_date: stayDate || undefined,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (success) {
      setSubmittedSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-sand-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-timber-400 hover:text-timber-900 hover:bg-sand-100 transition-colors"
          aria-label="Cerrar formulario"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-timber-950">
              ¡Muchas gracias por tu opinión!
            </h3>
            <p className="text-sm text-timber-700 max-w-sm mx-auto leading-relaxed">
              Tu valoración ha sido recibida con éxito. Para garantizar la veracidad del contenido, se publicará tras la confirmación de la anfitriona.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-timber-900 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">
                Tu Experiencia
              </span>
              <h3 className="font-serif text-2xl font-bold text-timber-950 mt-1">
                Dejar una valoración
              </h3>
              <p className="text-xs text-timber-600 mt-1">
                Las valoraciones son revisadas antes de su publicación para mantener la calidad y autenticidad del servicio.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating stars */}
              <div>
                <label className="block text-xs font-semibold text-timber-800 mb-1.5">
                  Puntuación (de 1 a 5 estrellas)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating !== null ? star <= hoverRating : star <= rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-sand-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-timber-700 ml-2">
                    {rating} de 5 estrellas
                  </span>
                </div>
              </div>

              {/* Author name */}
              <div>
                <label htmlFor="authorName" className="block text-xs font-semibold text-timber-800 mb-1">
                  Tu Nombre *
                </label>
                <input
                  id="authorName"
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej. María Sánchez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                />
              </div>

              {/* Stay date */}
              <div>
                <label htmlFor="stayDate" className="block text-xs font-semibold text-timber-800 mb-1">
                  Fecha o mes de la estancia (Opcional)
                </label>
                <input
                  id="stayDate"
                  type="text"
                  value={stayDate}
                  onChange={(e) => setStayDate(e.target.value)}
                  placeholder="Ej. Agosto 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                />
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-xs font-semibold text-timber-800 mb-1">
                  Comentario sobre tu estancia *
                </label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos qué te pareció la casa, la piscina, el jardín y el trato recibido..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-timber-700 hover:bg-sand-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Valoración</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

