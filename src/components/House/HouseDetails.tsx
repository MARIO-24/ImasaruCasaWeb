import React, { useState, useRef } from 'react';
import { Users, Bed, Bath, Waves, Sun, Sparkles, Check, Car } from 'lucide-react';
import { SPACES, HOUSE_INFO } from '../../data/houseData';
import { AmenitiesList } from './AmenitiesList';

export const HouseDetails: React.FC = () => {
  const [activeSpaceId, setActiveSpaceId] = useState(SPACES[0].id);
  const activeSpace = SPACES.find(s => s.id === activeSpaceId) || SPACES[0];

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = tabsContainerRef.current;
    if (!el) return;
    const walk = e.pageX - startXRef.current;
    if (Math.abs(walk) > 4) {
      isDraggingRef.current = true;
    }
    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleSelectSpace = (spaceId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDraggingRef.current) return;
    setActiveSpaceId(spaceId);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  };

  return (
    <section id="la-casa" className="py-14 sm:py-20 bg-sand-100/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-6 sm:mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Distribución & Espacios Reales
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
            Una casa de madera con encanto, intimidad y luz natural
          </h2>
          <p className="text-sm sm:text-base text-timber-700 mt-3 sm:mt-4 leading-relaxed">
            {HOUSE_INFO.description}
          </p>

          {/* Quick Summary Chips */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 mt-6 sm:mt-6">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium text-center sm:text-left h-full sm:h-auto">
              <Users className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
              <span>Hasta 4-5 huéspedes</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium text-center sm:text-left h-full sm:h-auto">
              <Bed className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
              <span>
                2 dormitorios <span className="whitespace-nowrap">(1 abuhardillado)</span>
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium text-center sm:text-left h-full sm:h-auto">
              <Bath className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
              <span>2 baños (interior y jardín)</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium text-center sm:text-left h-full sm:h-auto">
              <Waves className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
              <span>Piscina privada vallada</span>
            </div>
            <div className="col-span-2 justify-self-center flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium text-center sm:text-left w-full sm:w-auto max-w-[calc(50%-0.25rem)] sm:max-w-none h-full sm:h-auto">
              <Car className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
              <span>Parking privado techado</span>
            </div>
          </div>
        </div>

        {/* Interactive Space Explorer */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 lg:p-10 border border-sand-200/80 shadow-sm max-w-full">
          {/* Space selector tabs */}
          <div
            ref={tabsContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-8 border-b border-sand-200 no-scrollbar max-w-full cursor-grab active:cursor-grabbing select-none overscroll-x-contain scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {SPACES.map((space) => {
              const isActive = space.id === activeSpaceId;
              return (
                <button
                  key={space.id}
                  onClick={(e) => handleSelectSpace(space.id, e)}
                  data-active={isActive ? 'true' : 'false'}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-timber-900 text-white shadow-sm'
                      : 'bg-sand-100/70 text-timber-700 hover:bg-sand-200 hover:text-timber-950'
                  }`}
                >
                  {space.title}
                </button>
              );
            })}
          </div>

          {/* Active Space Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Image display */}
            <div className="lg:col-span-7 relative group overflow-hidden rounded-2xl aspect-video sm:aspect-[4/3] bg-sand-100">
              <img
                src={activeSpace.image}
                alt={activeSpace.title}
                loading="lazy"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {activeSpace.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-timber-950/75 backdrop-blur-sm text-sand-50 text-xs font-medium tracking-wide">
                  {activeSpace.badge}
                </span>
              )}
            </div>

            {/* Information and features */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-5">
              <div>
                <span className="text-xs font-semibold text-terracotta-600 uppercase tracking-wider">
                  {activeSpace.subtitle}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-timber-950 mt-1">
                  {activeSpace.title}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-timber-700 leading-relaxed">
                {activeSpace.description}
              </p>

              <div className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-timber-900">
                  Características de este espacio:
                </h4>
                <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                  {activeSpace.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start sm:items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-timber-800 leading-snug sm:leading-normal">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="min-w-0">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Detail Note */}
        <div className="mt-8 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <h4 className="font-semibold text-amber-950">Aclaración sobre la capacidad</h4>
            <p className="text-amber-800/90 mt-0.5 leading-relaxed">
              {HOUSE_INFO.capacity.note}
            </p>
          </div>
        </div>

        {/* Full Amenities list */}
        <AmenitiesList />

      </div>
    </section>
  );
};

