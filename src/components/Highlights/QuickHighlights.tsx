import React from 'react';
import { Sparkles, ShieldCheck, Sun, Compass } from 'lucide-react';

export const QuickHighlights: React.FC = () => {
  const highlights = [
    {
      icon: Sparkles,
      title: 'Madera & Atmósfera Rural',
      description: 'Construcción en madera de dos plantas con calidez natural. Techos abuhardillados, porche espacioso y terraza superior para contemplar el atardecer.'
    },
    {
      icon: ShieldCheck,
      title: 'Piscina Privada Vallada',
      description: 'Zona de baño privada cerrada perimetralmente para total tranquilidad con niños. Iluminación nocturna para baños bajo las estrellas.'
    },
    {
      icon: Compass,
      title: 'Naturaleza & Conexión',
      description: 'Ubicada en Diseminado Pago Zorro, rodeada de calma y senderos naturales directos hacia las calas más salvajes de Conil, sin ruidos de ciudad.'
    },
    {
      icon: Sun,
      title: 'Atención Directa y Cercana',
      description: 'Alojamiento rural gestionado con cariño por sus propietarios, Pilar y Paco. Registro oficial VTAR/CA/01451 de la Junta de Andalucía.'
    }
  ];

  return (
    <section className="relative -mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl shadow-timber-950/5 border border-sand-200/80 p-3 sm:p-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 grid-rows-2 sm:grid-rows-none">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 sm:p-0 rounded-xl sm:rounded-none bg-sand-50/70 sm:bg-transparent border border-sand-200/80 sm:border-0 flex flex-col items-center sm:items-start justify-center sm:justify-start text-center sm:text-left h-full min-w-0 sm:space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-terracotta-600 mb-2 sm:mb-0 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm sm:text-lg font-bold text-timber-950 leading-snug sm:leading-normal mb-1.5 sm:mb-0">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-timber-700 leading-snug sm:leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

