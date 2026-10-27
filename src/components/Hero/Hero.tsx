import React from 'react';
import { Calendar, MessageCircle, MapPin, Users, Bed, Waves, Utensils } from 'lucide-react';
import { HOUSE_INFO } from '../../data/houseData';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-end sm:items-center justify-center pt-24 pb-14 sm:py-32 overflow-hidden">
      {/* Background Photography with Warm Film Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/images/exterior-casa.jpg"
          alt="Casa Vacacional Imasaru en Conil de la Frontera"
          fetchPriority="high"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Coastal atmospheric gradient: warm amber, dark pine wood and soft white */}
        <div className="absolute inset-0 bg-gradient-to-t from-timber-950/90 via-timber-950/45 to-timber-950/20" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-50/20 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium tracking-wide mb-6">
          <MapPin className="w-3.5 h-3.5 text-terracotta-400" />
          <span>Conil de la Frontera · Cádiz</span>
          <span className="text-white/40">|</span>
          <span className="text-sand-100">{HOUSE_INFO.registrationNumber}</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Casa Vacacional Imasaru <br className="hidden sm:inline" />
          <span className="italic font-normal text-sand-100 text-2xl sm:text-4xl md:text-5xl block mt-2">
            Tu refugio con piscina junto a las calas de Conil
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-sand-100 font-light mb-8 leading-relaxed">
          Casa rural con encanto para 4-5 personas. Piscina privada vallada, porche amueblado, barbacoa de obra y un amplio jardín en plena naturaleza para desconectar de verdad.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10 text-xs sm:text-sm text-sand-100">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <Users className="w-4 h-4 text-sand-200" />
            <span>4-5 Plazas</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <Bed className="w-4 h-4 text-sand-200" />
            <span>2 Dormitorios</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <Waves className="w-4 h-4 text-sand-200" />
            <span>Piscina Privada</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <Utensils className="w-4 h-4 text-sand-200" />
            <span>Barbacoa & Porche</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <a
            href="#disponibilidad"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium text-base shadow-lg hover:shadow-terracotta-600/25 transition-all duration-200 active:scale-[0.98]"
          >
            <Calendar className="w-5 h-5 text-white/90" />
            Consultar Disponibilidad
          </a>
          <a
            href={HOUSE_INFO.hosts.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/95 hover:bg-white text-timber-900 hover:text-timber-950 font-medium text-base shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            Preguntar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

