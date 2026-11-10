import React, { useState, useRef, useEffect } from 'react';
import { 
  Waves, Flame, Home, Trees, Bath, Wind, Wifi, 
  UtensilsCrossed, ShieldCheck, HeartHandshake, Award, UserCheck, Car,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { AMENITIES } from '../../data/houseData';

type AmenityItem = typeof AMENITIES[number];

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Flame,
  Home,
  Trees,
  Bath,
  Wind,
  Wifi,
  UtensilsCrossed,
  ShieldCheck,
  HeartHandshake,
  Award,
  UserCheck,
  Car,
};

// 3 grupos de 4 elementos para el carrusel móvil (2 columnas x 2 filas por slide)
const MOBILE_SLIDES = [
  {
    col1: [AMENITIES[0], AMENITIES[1]],
    col2: [AMENITIES[2], AMENITIES[3]],
  },
  {
    col1: [AMENITIES[4], AMENITIES[5]],
    col2: [AMENITIES[6], AMENITIES[7]],
  },
  {
    col1: [AMENITIES[8], AMENITIES[9]],
    col2: [AMENITIES[10], AMENITIES[11]],
  },
];

// Tarjeta móvil con dimensiones uniformes (146px) y contenido centrado horizontal y verticalmente
const MobileAmenityCard: React.FC<{ amenity: AmenityItem }> = ({ amenity }) => {
  const Icon = iconMap[amenity.iconName] || Home;
  return (
    <div className="h-[146px] px-2.5 py-2.5 rounded-xl bg-white border border-sand-200/80 shadow-2xs flex flex-col items-center justify-center text-center min-w-0 w-full select-none">
      <div className="p-1.5 rounded-lg bg-sand-100 text-terracotta-600 flex-shrink-0 mb-1.5">
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="font-semibold text-timber-950 text-xs leading-snug w-full">
        {amenity.name}
      </h4>
      <p className="text-[11px] text-timber-600 mt-1 leading-snug w-full">
        {amenity.description}
      </p>
    </div>
  );
};

export const AmenitiesList: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Estados para soporte de arrastre con ratón en pruebas de escritorio
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Sincronizar el indicador de posición y contador con el desplazamiento táctil
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (el && el.clientWidth > 0) {
            const newIndex = Math.round(el.scrollLeft / el.clientWidth);
            setActiveIndex(Math.max(0, Math.min(MOBILE_SLIDES.length - 1, newIndex)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const targetLeft = index * el.clientWidth;
    el.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const prevSlide = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const nextSlide = () => scrollToIndex(Math.min(MOBILE_SLIDES.length - 1, activeIndex + 1));

  // Manejo de arrastre con ratón para pruebas en navegador
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }
    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const el = scrollRef.current;
    if (!el) return;
    if (isDraggingRef.current && el.clientWidth > 0) {
      const nearest = Math.round(el.scrollLeft / el.clientWidth);
      scrollToIndex(Math.max(0, Math.min(MOBILE_SLIDES.length - 1, nearest)));
    }
  };

  return (
    <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-sand-200">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">Equipamiento & Confort</span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-timber-950 mt-1">
          Todo lo necesario para sentirte en casa
        </h3>
        <p className="text-sm text-timber-700 mt-2">
          Vivienda totalmente equipada para una estancia autónoma, cómoda y relajada.
        </p>
      </div>

      {/* 1. Carrusel móvil (2 columnas x 2 filas por vista) - Solo pantallas < 640px */}
      <div className="sm:hidden">
        {/* Contenedor desplazable con scroll-snap nativo y soporte táctil fluido */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing select-none overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {MOBILE_SLIDES.map((slide, slideIdx) => (
            <div
              key={slideIdx}
              className="w-full min-w-full flex-shrink-0 snap-start grid grid-cols-2 gap-2.5 px-0.5"
            >
              {/* Columna 1: Tarjeta superior e inferior */}
              <div className="flex flex-col gap-2.5 min-w-0">
                <MobileAmenityCard amenity={slide.col1[0]} />
                <MobileAmenityCard amenity={slide.col1[1]} />
              </div>

              {/* Columna 2: Tarjeta superior e inferior */}
              <div className="flex flex-col gap-2.5 min-w-0">
                <MobileAmenityCard amenity={slide.col2[0]} />
                <MobileAmenityCard amenity={slide.col2[1]} />
              </div>
            </div>
          ))}
        </div>

        {/* Controles discretos e indicador de posición sincronizado */}
        <div className="flex items-center justify-between mt-3.5 px-1">
          <button
            type="button"
            onClick={prevSlide}
            disabled={activeIndex === 0}
            aria-label="Ver 4 equipamientos anteriores"
            className={`p-2 rounded-full border transition-all duration-200 ${
              activeIndex === 0
                ? 'border-sand-200 text-sand-400 opacity-40 cursor-not-allowed'
                : 'border-sand-300 text-timber-800 bg-white hover:bg-sand-100 hover:border-terracotta-300 active:scale-95 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Grupos de equipamiento">
              {MOBILE_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Ir al grupo ${i + 1} de 3`}
                  aria-selected={activeIndex === i}
                  role="tab"
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === i
                      ? 'w-6 bg-terracotta-600'
                      : 'w-2 bg-sand-300 hover:bg-sand-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-timber-600">
              {activeIndex + 1}/3
            </span>
          </div>

          <button
            type="button"
            onClick={nextSlide}
            disabled={activeIndex === MOBILE_SLIDES.length - 1}
            aria-label="Ver 4 equipamientos siguientes"
            className={`p-2 rounded-full border transition-all duration-200 ${
              activeIndex === MOBILE_SLIDES.length - 1
                ? 'border-sand-200 text-sand-400 opacity-40 cursor-not-allowed'
                : 'border-sand-300 text-timber-800 bg-white hover:bg-sand-100 hover:border-terracotta-300 active:scale-95 shadow-2xs'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula de escritorio (intacta, idéntica al diseño original) - Pantallas >= 640px */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
        {AMENITIES.map((amenity, index) => {
          const Icon = iconMap[amenity.iconName] || Home;
          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-white border border-sand-200/80 hover:border-terracotta-200 hover:shadow-md transition-all duration-200 flex items-start gap-3 min-w-0"
            >
              <div className="p-2.5 rounded-lg bg-sand-100 text-terracotta-600 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-timber-950 text-sm">{amenity.name}</h4>
                <p className="text-xs text-timber-600 mt-0.5 leading-snug">{amenity.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
