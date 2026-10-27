import React, { useState } from 'react';
import { Users, Bed, Bath, Waves, Sun, Sparkles, Check } from 'lucide-react';
import { SPACES, HOUSE_INFO } from '../../data/houseData';
import { AmenitiesList } from './AmenitiesList';

export const HouseDetails: React.FC = () => {
  const [activeSpaceId, setActiveSpaceId] = useState(SPACES[0].id);
  const activeSpace = SPACES.find(s => s.id === activeSpaceId) || SPACES[0];

  return (
    <section id="la-casa" className="py-14 sm:py-20 bg-sand-100/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5 sm:mt-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium">
              <Users className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Hasta 4-5 huéspedes</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium">
              <Bed className="w-3.5 h-3.5 text-terracotta-600" />
              <span>2 dormitorios (1 abuhardillado)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium">
              <Bath className="w-3.5 h-3.5 text-terracotta-600" />
              <span>2 baños (interior y jardín)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-200/80 text-timber-900 text-xs font-medium">
              <Waves className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Piscina privada vallada</span>
            </div>
          </div>
        </div>

        {/* Interactive Space Explorer */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 lg:p-10 border border-sand-200/80 shadow-sm max-w-full">
          {/* Space selector tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-sand-200 no-scrollbar max-w-full">
            {SPACES.map((space) => {
              const isActive = space.id === activeSpaceId;
              return (
                <button
                  key={space.id}
                  onClick={() => setActiveSpaceId(space.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Image display */}
            <div className="lg:col-span-7 relative group overflow-hidden rounded-2xl aspect-[4/3] bg-sand-100">
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
            <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
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

              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-timber-900">
                  Características de este espacio:
                </h4>
                <ul className="grid grid-cols-1 gap-2">
                  {activeSpace.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-timber-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
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

