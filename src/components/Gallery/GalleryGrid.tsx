import React, { useState } from 'react';
import { Camera, Maximize2, Plus, Minus } from 'lucide-react';
import { GALLERY_PHOTOS } from '../../data/houseData';
import { Lightbox } from './Lightbox';

type FilterCategory = 'all' | 'exterior' | 'piscina' | 'interior' | 'porche';

export const GalleryGrid: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  const handleFilterChange = (tabId: FilterCategory) => {
    setSelectedFilter(tabId);
    setIsExpanded(false);
  };

  const handleToggleExpand = () => {
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

  // Determine button visibility (show when more than 4 photos)
  const showExpandButton = filteredPhotos.length > 4;

  return (
    <section id="galeria" className="py-16 sm:py-20 bg-sand-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Galería Fotográfica Real
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
              Descubre cada rincón de Casa Imasaru
            </h2>
            <p className="text-sm sm:text-base text-timber-700 mt-2 max-w-2xl">
              Fotografías reales tomadas en la propia casa, mostrando el jardín, la piscina vallada, los dormitorios y el porche.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-6 md:mt-0 no-scrollbar" role="tablist" aria-label="Filtrar fotos por categoría">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={selectedFilter === tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  selectedFilter === tab.id
                    ? 'bg-terracotta-600 text-white shadow-sm'
                    : 'bg-sand-200/70 text-timber-700 hover:bg-sand-300/80 hover:text-timber-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid: 4 items per row on desktop (lg), 2 on tablet (sm), 1 on mobile */}
        <div id="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredPhotos.map((photo, index) => {
            // Visibility logic: show exactly 4 photos initially across all devices
            let visibilityClass = '';
            if (!isExpanded && index >= 4) {
              visibilityClass = 'hidden';
            }

            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhotoIndex(index)}
                aria-label={`Ver foto ampliada: ${photo.title}`}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-sand-200 aspect-[4/3] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2 ${visibilityClass} shadow-sm hover:shadow-lg transition-all duration-300 w-full`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle Hover Gradient & Information */}
                <div className="absolute inset-0 bg-gradient-to-t from-timber-950/80 via-timber-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-5 text-white pointer-events-none">
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
            );
          })}
        </div>

        {/* Expand / Collapse Button */}
        {showExpandButton && (
          <div className="mt-8 sm:mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleToggleExpand}
              aria-expanded={isExpanded}
              aria-controls="gallery-grid"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-timber-900 hover:bg-terracotta-600 text-sand-50 font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2"
            >
              {isExpanded ? (
                <>
                  <Minus className="w-4 h-4 text-terracotta-400" />
                  <span>Ver menos</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-terracotta-400" />
                  <span>Ver todas las fotos ({filteredPhotos.length})</span>
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
