import React from 'react';
import { MapPin, Navigation, ExternalLink, Footprints, Car, Compass, Sun } from 'lucide-react';
import { HOUSE_INFO } from '../../data/houseData';

const iconMap: Record<string, React.ElementType> = {
  Footprints,
  Car,
  Compass,
  Sun,
};

export const LocationSection: React.FC = () => {
  return (
    <section id="ubicacion" className="py-14 sm:py-20 bg-sand-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Entorno & Localización
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
            Entre la tranquilidad del campo y la brisa del Atlántico
          </h2>
          <p className="text-sm sm:text-base text-timber-700 mt-3 leading-relaxed">
            Situada en <b>{HOUSE_INFO.address.street}</b>, en el término de Conil de la Frontera. Un enclave rural privilegiado para descansar en silencio con fácil acceso a pie y en vehículo a las calas y al centro del pueblo.
          </p>
        </div>

        {/* Map & Distance Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Distances & Surroundings Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-timber-950 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-terracotta-600" />
                Puntos de Interés Cercanos
              </h3>

              <div className="space-y-3">
                {HOUSE_INFO.distances.map((dist, idx) => {
                  const Icon = iconMap[dist.icon] || MapPin;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-sand-200/80 shadow-sm flex items-start gap-3.5"
                    >
                      <div className="p-2.5 rounded-lg bg-sand-100 text-terracotta-600 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-timber-950 text-sm">{dist.place}</h4>
                          <span className="text-xs font-bold text-timber-800 bg-sand-100 px-2 py-0.5 rounded-md">
                            {dist.time}
                          </span>
                        </div>
                        <p className="text-xs text-timber-600 mt-1">
                          {dist.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address Card & External Map Link */}
            <div className="p-5 rounded-2xl bg-timber-900 text-white space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-terracotta-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-base font-bold">Dirección Exacta</h4>
                  <p className="text-xs text-sand-200 mt-0.5">
                    {HOUSE_INFO.address.street} · {HOUSE_INFO.address.postalCode} {HOUSE_INFO.address.locality} ({HOUSE_INFO.address.province})
                  </p>
                </div>
              </div>

              <a
                href={HOUSE_INFO.address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-colors"
              >
                <span>Abrir ubicación en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Interactive Map Embed */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-sand-200 shadow-sm bg-sand-200 relative min-h-[380px] lg:min-h-[480px]">
            <iframe
              title="Mapa de localización Casa Vacacional Imasaru Conil"
              src="https://maps.google.com/maps?q=Diseminado%20Pago%20Zorro%20657%2011149%20Conil%20de%20la%20Frontera&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 absolute inset-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

