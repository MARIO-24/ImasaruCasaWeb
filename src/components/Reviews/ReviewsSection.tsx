import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, MessageSquare, Plus, ExternalLink, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Review } from '../../types';
import { fetchApprovedReviews } from '../../lib/supabase/client';
import { AddReviewModal } from './AddReviewModal';
import { ReviewCard } from './ReviewCard';
import { HOUSE_INFO } from '../../data/houseData';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Check if Google Places is configured
  const googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  const googlePlaceId = import.meta.env.VITE_GOOGLE_PLACE_ID;

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      const { data } = await fetchApprovedReviews();
      setReviews(data || []);
      setLoading(false);
    };

    loadReviews();
  }, []);

  const updateScrollState = useCallback(() => {
    const el = reviewsScrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstCard = el.querySelector('[data-review-card]') as HTMLElement | null;
    if (firstCard && reviews.length > 0) {
      const cardWidth = firstCard.offsetWidth + 16;
      const index = Math.min(
        Math.max(0, Math.round(scrollLeft / cardWidth)),
        reviews.length - 1
      );
      setCurrentReviewIndex(index);
    }
  }, [reviews.length]);

  useEffect(() => {
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollState]);

  const handleScrollReviews = (direction: 'left' | 'right') => {
    const el = reviewsScrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector('[data-review-card]') as HTMLElement | null;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 16 : 340;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse drag handlers for desktop mouse users
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = reviewsScrollRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !reviewsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - reviewsScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 6) {
      isDraggingRef.current = true;
    }
    reviewsScrollRef.current.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  return (
    <section id="opiniones" className="py-14 sm:py-20 bg-sand-100/60 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-terracotta-600" aria-hidden="true" />
              Experiencias & Reseñas
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
              Opiniones de quienes ya han disfrutado de Imasaru
            </h2>
            <p className="text-sm sm:text-base text-timber-700 mt-2 max-w-2xl">
              La satisfacción, la tranquilidad y el bienestar de nuestros huéspedes son nuestra mayor prioridad.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex-shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Dejar una opinión
            </button>
          </div>
        </div>

        {/* Dual Content: Official Google Card + Horizontal Guest Reviews Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-6">
          
          {/* Official Google Places Attribution Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-7 border border-sand-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Google Brand Header */}
              <div className="flex items-center gap-2.5 mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-semibold text-timber-900 text-sm">Reseñas en Google</span>
              </div>

              <h3 className="font-serif text-xl font-bold text-timber-950 mb-2">
                Consulta las valoraciones oficiales en Google Maps
              </h3>

              <p className="text-xs sm:text-sm text-timber-600 leading-relaxed mb-6">
                Para garantizar total transparencia e imparcialidad, puedes consultar los comentarios y fotos compartidos por los huéspedes directamente en Google.
              </p>

              {/* Status Note */}
              <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-timber-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  {googleApiKey && googlePlaceId
                    ? 'Sincronizado oficialmente con Google Places API'
                    : 'Sin puntuaciones inventadas: consulta en tiempo real en la ficha oficial.'}
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-sand-200">
              <a
                href={HOUSE_INFO.address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sand-100 hover:bg-sand-200 text-timber-900 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Ver reseñas en Google Maps</span>
                <ExternalLink className="w-4 h-4 text-timber-600" />
              </a>
            </div>
          </div>

          {/* Guest Reviews Display Area: Horizontal Carousel */}
          <div className="lg:col-span-8 flex flex-col justify-between min-w-0">
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-sand-200">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-terracotta-500 border-t-transparent rounded-full mb-2" />
                <p className="text-sm text-timber-600">Cargando opiniones aprobadas...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-sand-200 shadow-sm flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-full bg-sand-100 text-timber-600 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-timber-950 mb-2">
                  ¿Te has alojado en Casa Imasaru?
                </h3>
                <p className="text-sm text-timber-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Las opiniones enviadas por los huéspedes se publican aquí tras su moderación por parte de Pilar. ¡Sé el primero en compartir tu experiencia en la nueva web!
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-sm font-medium transition-colors"
                >
                  Enviar mi valoración
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full">
                {/* Carousel Sub-header with Navigation Controls */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-timber-700">
                      Opiniones de huéspedes
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sand-200/90 text-timber-800 text-xs font-bold">
                      {reviews.length}
                    </span>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-timber-600 font-medium hidden sm:inline">
                      {currentReviewIndex + 1} de {reviews.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleScrollReviews('left')}
                        disabled={!canScrollLeft}
                        className="p-2 rounded-xl bg-white border border-sand-200 text-timber-800 hover:bg-sand-100 hover:text-terracotta-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                        aria-label="Opinión anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScrollReviews('right')}
                        disabled={!canScrollRight}
                        className="p-2 rounded-xl bg-white border border-sand-200 text-timber-800 hover:bg-sand-100 hover:text-terracotta-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                        aria-label="Siguiente opinión"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Scrollable Carousel Track with Scroll Snap */}
                <div
                  ref={reviewsScrollRef}
                  onScroll={updateScrollState}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="flex flex-row gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 no-scrollbar cursor-grab active:cursor-grabbing px-1"
                  role="region"
                  aria-label="Carrusel horizontal de opiniones de huéspedes"
                  tabIndex={0}
                >
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      data-review-card="true"
                      className="w-[82vw] sm:w-[320px] md:w-[340px] flex-shrink-0 snap-start"
                    >
                      <ReviewCard review={rev} />
                    </div>
                  ))}
                </div>

                {/* Mobile / Visual Indicator Footer */}
                <div className="mt-3 flex items-center justify-between text-xs text-timber-600 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-pulse" />
                    Desliza horizontalmente para leer más opiniones
                  </span>
                  <div className="flex gap-1.5 items-center">
                    {reviews.map((_, i) => (
                      <span
                        key={i}
                        className={`inline-block h-1.5 rounded-full transition-all duration-200 ${
                          i === currentReviewIndex ? 'w-4 bg-terracotta-600' : 'w-1.5 bg-sand-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
};
