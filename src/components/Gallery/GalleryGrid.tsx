import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Maximize2, Minus, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { GALLERY_PHOTOS } from '../../data/houseData';
import { Lightbox } from './Lightbox';

type FilterCategory = 'all' | 'exterior' | 'piscina' | 'interior' | 'porche';

export const GalleryGrid: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // Filter scroll states
  const [canScrollFiltersLeft, setCanScrollFiltersLeft] = useState<boolean>(false);
  const [canScrollFiltersRight, setCanScrollFiltersRight] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftStartRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Filter container refs for drag and wheel
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const filterMouseDownRef = useRef<boolean>(false);
  const filterStartXRef = useRef<number>(0);
  const filterScrollLeftStartRef = useRef<number>(0);
  const filterDraggingRef = useRef<boolean>(false);

  const filteredPhotos = selectedFilter === 'all'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(p => p.category === selectedFilter);

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'Todas las fotos' },
    { id: 'exterior', label: 'Exterior & Jardín' },
    { id: 'piscina', label: 'Piscina Privada' },
    { id: 'porche', label: 'Porche & Barbacoa' },
    { id: 'interior', label: 'Interiores & Habitaciones' },
  ];

  // Update photo scroll navigation arrow states and active photo index
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstCard = el.querySelector('[data-gallery-card]') as HTMLElement | null;
    if (firstCard && filteredPhotos.length > 0) {
      const cardWidth = firstCard.offsetWidth + 16;
      const index = Math.min(
        Math.max(0, Math.round(scrollLeft / cardWidth)),
        filteredPhotos.length - 1
      );
      setCurrentPhotoIndex(index);
    }
  }, [filteredPhotos.length]);

  // Update filter bar scroll state (arrows and fade indicators)
  const updateFilterScrollState = useCallback(() => {
    const el = filterScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth + 4;
    setCanScrollFiltersLeft(hasOverflow && scrollLeft > 8);
    setCanScrollFiltersRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    updateFilterScrollState();

    const handleResize = () => {
      updateScrollState();
      updateFilterScrollState();
      if (window.innerWidth < 640) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Non-passive wheel listener on filter container to convert vertical wheel to horizontal scroll
    const filterEl = filterScrollRef.current;
    const handleFilterWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && filterEl && filterEl.scrollWidth > filterEl.clientWidth) {
        e.preventDefault();
        filterEl.scrollLeft += e.deltaY * 1.2;
      }
    };

    if (filterEl) {
      filterEl.addEventListener('wheel', handleFilterWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (filterEl) {
        filterEl.removeEventListener('wheel', handleFilterWheel);
      }
    };
  }, [updateScrollState, updateFilterScrollState]);

  const handleFilterChange = (tabId: FilterCategory) => {
    setSelectedFilter(tabId);
    setCurrentPhotoIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollFilters = (direction: 'left' | 'right') => {
    const el = filterScrollRef.current;
    if (!el) return;
    const scrollAmount = 180;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleFilterMouseDown = (e: React.MouseEvent) => {
    const el = filterScrollRef.current;
    if (!el) return;
    filterMouseDownRef.current = true;
    filterDraggingRef.current = false;
    filterStartXRef.current = e.pageX - el.offsetLeft;
    filterScrollLeftStartRef.current = el.scrollLeft;
  };

  const handleFilterMouseMove = (e: React.MouseEvent) => {
    if (!filterMouseDownRef.current || !filterScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - filterScrollRef.current.offsetLeft;
    const walk = (x - filterStartXRef.current) * 1.3;
    if (Math.abs(walk) > 5) {
      filterDraggingRef.current = true;
    }
    filterScrollRef.current.scrollLeft = filterScrollLeftStartRef.current - walk;
  };

  const handleFilterMouseUpOrLeave = () => {
    filterMouseDownRef.current = false;
    setTimeout(() => {
      filterDraggingRef.current = false;
    }, 50);
  };

  const handleFilterTabClick = (tabId: FilterCategory, e: React.MouseEvent<HTMLButtonElement>) => {
    if (filterDraggingRef.current) return;
    handleFilterChange(tabId);
    // Smoothly center the clicked tab in view
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const firstCard = el.querySelector('[data-gallery-card]') as HTMLElement | null;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 20 : 360;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse drag-to-scroll handlers for the photo carousel
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 6) {
      isDraggingRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handlePhotoClick = (index: number) => {
    if (isDraggingRef.current) return;
    setActivePhotoIndex(index);
  };

  const handleToggleExpand = () => {
    if (window.innerWidth < 640) return;
    if (isExpanded) {
      const galeriaElem = document.getElementById('galeria');
      if (galeriaElem) {
        const top = galeriaElem.getBoundingClientRect().top + window.scrollY - 80;
        if (window.scrollY > top) {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const showExpandButton = filteredPhotos.length > 4;

  return (
    <section id="galeria" className="py-14 sm:py-20 bg-sand-50 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          {/* Main Title & Badge */}
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Galería Fotográfica Real
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
              Descubre cada rincón de Casa Imasaru
            </h2>
          </div>

          {/* Filter Chips Bar (Full width, smooth scrolling with wheel, drag, touch & discrete arrows) */}
          <div className="mt-5 sm:mt-6 relative group/filters">

            {/* Discrete Left Arrow for Desktop/Tablet when overflowing */}
            <button
              type="button"
              onClick={() => scrollFilters('left')}
              disabled={!canScrollFiltersLeft}
              className={`hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-white/95 text-timber-800 shadow-md border border-sand-200/90 hover:bg-white hover:text-terracotta-600 transition-all ${
                !canScrollFiltersLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Desplazar filtros a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Discrete Right Arrow for Desktop/Tablet when overflowing */}
            <button
              type="button"
              onClick={() => scrollFilters('right')}
              disabled={!canScrollFiltersRight}
              className={`hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-white/95 text-timber-800 shadow-md border border-sand-200/90 hover:bg-white hover:text-terracotta-600 transition-all ${
                !canScrollFiltersRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Desplazar filtros a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Left Edge Fade Cue (indicates more filters to the left) */}
            <div
              className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-sand-50 to-transparent transition-opacity duration-200 z-10 ${
                canScrollFiltersLeft ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            />

            {/* Right Edge Fade Cue (indicates more filters to the right) */}
            <div
              className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-sand-50 to-transparent transition-opacity duration-200 z-10 ${
                canScrollFiltersRight ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            />

            {/* Scrollable Filter Chips Container */}
            <div
              ref={filterScrollRef}
              onScroll={updateFilterScrollState}
              onMouseDown={handleFilterMouseDown}
              onMouseMove={handleFilterMouseMove}
              onMouseUp={handleFilterMouseUpOrLeave}
              onMouseLeave={handleFilterMouseUpOrLeave}
              className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 px-1 sm:px-2 no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x select-none"
              role="tablist"
              aria-label="Filtrar fotos por categoría"
            >
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={selectedFilter === tab.id}
                  onClick={(e) => handleFilterTabClick(tab.id, e)}
                  className={`px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 touch-manipulation min-h-[38px] ${
                    selectedFilter === tab.id
                      ? 'bg-terracotta-600 text-white shadow-xs'
                      : 'bg-sand-200/80 text-timber-700 hover:bg-sand-300 hover:text-timber-950 active:scale-95'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {/* Trailing spacing for mobile so last chip is never flush against screen margin */}
              <div className="w-3 flex-shrink-0 sm:hidden" aria-hidden="true" />
            </div>
          </div>

          {/* Descriptive Text: Placed below the filters with clean, balanced, proportional vertical spacing */}
          <p className="text-sm sm:text-base text-timber-700 mt-4 sm:mt-5 max-w-2xl leading-relaxed">
            Fotografías reales tomadas en la propia casa, mostrando el jardín, la piscina vallada, los dormitorios y el porche.
          </p>
        </div>

        {/* Gallery Content */}
        {!isExpanded ? (
          /* Horizontal Scrollable Carousel (Default, compact, responsive) */
          <div className="relative group/carousel">

            {/* Desktop Navigation Arrows (Floating Left & Right) */}
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`hidden md:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/95 text-timber-900 shadow-md border border-sand-200/90 hover:bg-white hover:text-terracotta-600 hover:scale-105 active:scale-95 transition-all ${
                !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Desplazar fotos a la izquierda"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`hidden md:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/95 text-timber-900 shadow-md border border-sand-200/90 hover:bg-white hover:text-terracotta-600 hover:scale-105 active:scale-95 transition-all ${
                !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Desplazar fotos a la derecha"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Horizontal Track with Scroll Snap */}
            <div
              ref={scrollContainerRef}
              onScroll={updateScrollState}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex flex-row gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 no-scrollbar cursor-grab active:cursor-grabbing px-1"
              role="region"
              aria-label="Carrusel de fotografías de la casa"
              tabIndex={0}
            >
              {filteredPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  data-gallery-card="true"
                  type="button"
                  onClick={() => handlePhotoClick(index)}
                  aria-label={`Ver foto ampliada: ${photo.title}`}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer bg-sand-200 aspect-[4/3] w-[82vw] sm:w-[320px] md:w-[360px] lg:w-[380px] xl:w-[400px] flex-shrink-0 snap-start shadow-sm hover:shadow-lg transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out select-none pointer-events-none"
                    draggable={false}
                  />

                  {/* Subtle Hover Gradient & Information */}
                  <div className="absolute inset-0 bg-gradient-to-t from-timber-950/85 via-timber-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 sm:p-5 text-white pointer-events-none">
                    <div className="flex items-center justify-between w-full">
                      <div className="pr-2">
                        <p className="font-serif text-sm sm:text-base font-medium leading-tight">
                          {photo.title}
                        </p>
                        <span className="text-xs text-sand-300 capitalize mt-0.5 inline-block">
                          {photo.category}
                        </span>
                      </div>
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white flex-shrink-0">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Horizontal Track Footer Cue & Counter */}
            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-timber-600 px-1">
              <span className="flex items-center gap-1.5 min-w-0 pr-1 text-[11px] sm:text-xs leading-tight sm:leading-normal">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-pulse flex-shrink-0" />
                Desliza horizontalmente o pulsa cualquier foto para ampliarla
              </span>
              <span className="font-semibold text-timber-800 bg-sand-200/80 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 text-xs">
                Foto {currentPhotoIndex + 1} de {filteredPhotos.length}
              </span>
            </div>

          </div>
        ) : (
          /* Full Grid View (Expanded when user requests seeing all photos at once) */
          <div id="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fadeIn">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhotoIndex(index)}
                aria-label={`Ver foto ampliada: ${photo.title}`}
                className="group relative overflow-hidden rounded-2xl cursor-pointer bg-sand-200 aspect-[4/3] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 shadow-sm hover:shadow-lg transition-all duration-300 w-full"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading={index < 8 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-timber-950/85 via-timber-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-5 text-white pointer-events-none">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-serif text-base sm:text-lg font-medium leading-tight">
                        {photo.title}
                      </p>
                      <span className="text-xs text-sand-300 capitalize mt-0.5 inline-block">
                        {photo.category}
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Expand / Collapse Button */}
        {showExpandButton && (
          <div className="hidden sm:flex mt-8 sm:mt-10 justify-center">
            <button
              type="button"
              onClick={handleToggleExpand}
              aria-expanded={isExpanded}
              aria-controls="gallery-content"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-timber-900 hover:bg-terracotta-600 text-sand-50 font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500"
            >
              {isExpanded ? (
                <>
                  <Minus className="w-4 h-4 text-terracotta-400" />
                  <span>Ver en formato horizontal (Ver menos)</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4 text-terracotta-400" />
                  <span>Ver todas las fotos en cuadrícula ({filteredPhotos.length})</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Lightbox Modal */}
        {activePhotoIndex !== null && (
          <Lightbox
            photos={filteredPhotos}
            currentIndex={activePhotoIndex}
            onClose={() => setActivePhotoIndex(null)}
            onNavigate={(newIndex) => setActivePhotoIndex(newIndex)}
          />
        )}

      </div>
    </section>
  );
};
