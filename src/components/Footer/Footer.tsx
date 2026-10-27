import React from 'react';
import { MapPin, Phone, Mail, Award, Heart } from 'lucide-react';
import { HOUSE_INFO } from '../../data/houseData';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-timber-950 text-sand-200 pt-16 pb-12 border-t border-timber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-timber-800">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
              Casa Vacacional Imasaru
            </h3>
            <p className="text-sm text-sand-300 max-w-sm leading-relaxed">
              Tu casa rural de madera en Conil de la Frontera (Cádiz). Descanso, intimidad, piscina privada vallada y naturaleza junto a las calas gaditanas.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sand-200 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-terracotta-400" />
              <span>{HOUSE_INFO.registrationNumber} · Junta de Andalucía</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-100">
              Navegación
            </h4>
            <ul className="space-y-2 text-sm text-sand-300">
              <li><a href="#la-casa" className="hover:text-white transition-colors">La Casa y Distribución</a></li>
              <li><a href="#galeria" className="hover:text-white transition-colors">Galería de Fotos</a></li>
              <li><a href="#disponibilidad" className="hover:text-white transition-colors">Calendario de Disponibilidad</a></li>
              <li><a href="#ubicacion" className="hover:text-white transition-colors">Ubicación y Entorno</a></li>
              <li><a href="#opiniones" className="hover:text-white transition-colors">Opiniones y Reseñas</a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Contacto Directo</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-100">
              Contacto y Localización
            </h4>
            <div className="space-y-2.5 text-sm text-sand-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" />
                <span>{HOUSE_INFO.address.street}, {HOUSE_INFO.address.postalCode} {HOUSE_INFO.address.locality} ({HOUSE_INFO.address.province})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-terracotta-400 flex-shrink-0" />
                <a href={`tel:${HOUSE_INFO.hosts.phone}`} className="hover:text-white transition-colors">
                  {HOUSE_INFO.hosts.phoneFormatted} (Pilar)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-terracotta-400 flex-shrink-0" />
                <a href={`mailto:${HOUSE_INFO.hosts.email}`} className="hover:text-white transition-colors">
                  {HOUSE_INFO.hosts.email}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400 text-center sm:text-left">
          <p>© {currentYear} Casa Vacacional Imasaru. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span>Conil de la Frontera, Cádiz</span>
            <a href="/admin" className="hover:text-sand-200 text-sand-500 transition-colors">
              Gestión Propietario
            </a>
            <span className="flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-terracotta-400 fill-terracotta-400" /> para ti
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

