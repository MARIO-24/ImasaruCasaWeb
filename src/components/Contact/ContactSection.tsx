import React from 'react';
import { Phone, MessageCircle, Mail, Clock, Award, ShieldCheck } from 'lucide-react';
import { HOUSE_INFO } from '../../data/houseData';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const ContactSection: React.FC = () => {
  return (
    <section id="contacto" className="py-14 sm:py-20 bg-sand-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            Trato Directo & Sin Intermediarios
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
            Contacta con Pilar y Paco
          </h2>
          <p className="text-sm sm:text-base text-timber-700 mt-2 leading-relaxed">
            Estamos a tu disposición para resolver cualquier duda sobre la casa, comprobar fechas, coordinar tu llegada o proporcionarte tarifas exactas para tus vacaciones en Conil.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mb-8 sm:mb-12">
          
          {/* WhatsApp Card */}
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-2.5 sm:block sm:mb-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 sm:mb-5 shadow-sm sm:shadow-md shadow-emerald-600/20">
                  <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                    Respuesta Rápida
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-emerald-950 leading-tight mt-0.5 sm:mt-1 sm:mb-2">
                    WhatsApp Directo
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed mb-3.5 sm:mb-6">
                El canal más ágil para consultar disponibilidad, resolver preguntas al instante y recibir detalles sobre la reserva.
              </p>
            </div>
            <a
              href={HOUSE_INFO.hosts.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Escribir por WhatsApp</span>
            </a>
          </div>

          {/* Telephone Card */}
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-sand-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-2.5 sm:block sm:mb-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-timber-900 text-white flex items-center justify-center flex-shrink-0 sm:mb-5 shadow-sm sm:shadow-md">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-timber-600 block">
                    Atención Telefónica
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-timber-950 leading-tight mt-0.5 sm:mt-1 sm:mb-2">
                    Llamada Directa
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-timber-600 leading-relaxed mb-3.5 sm:mb-6">
                Habla directamente con Pilar para concretar condiciones, resolver dudas específicas sobre la estancia y confirmar fechas.
              </p>
            </div>
            <a
              href={`tel:${HOUSE_INFO.hosts.phone}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-timber-900 hover:bg-timber-800 active:bg-timber-950 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-timber-500 focus-visible:ring-offset-2"
            >
              <Phone className="w-4 h-4 text-terracotta-400" />
              <span>Llamar al {HOUSE_INFO.hosts.phoneFormatted}</span>
            </a>
          </div>

          {/* Email Card */}
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-sand-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-2.5 sm:block sm:mb-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sand-100 text-terracotta-600 flex items-center justify-center flex-shrink-0 sm:mb-5">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-timber-600 block">
                    Correo Electrónico
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-timber-950 leading-tight mt-0.5 sm:mt-1 sm:mb-2">
                    Email
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-timber-600 leading-relaxed mb-3.5 sm:mb-6">
                Si prefieres enviarnos un correo con las fechas y personas para las que buscas alojamiento.
              </p>
            </div>
            <a
              href={`mailto:${HOUSE_INFO.hosts.email}?subject=Consulta%20disponibilidad%20Casa%20Vacacional%20Imasaru`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-sand-100 hover:bg-sand-200 active:bg-sand-300 text-timber-900 font-medium text-xs sm:text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2"
            >
              <Mail className="w-4 h-4 text-terracotta-600" />
              <span className="truncate">{HOUSE_INFO.hosts.email}</span>
            </a>
          </div>

        </div>

        {/* Practical details & Social info notice */}
        <div className="bg-sand-100/80 rounded-2xl p-6 border border-sand-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-timber-700">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-terracotta-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-timber-900 block">Horario de atención</span>
              <span>Todos los días de 09:00 a 21:00 h</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-4 h-4 text-terracotta-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-timber-900 block">Registro Oficial</span>
              <span>Junta de Andalucía {HOUSE_INFO.registrationNumber}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-terracotta-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-timber-900 block">Garantía y Tranquilidad</span>
              <span>Trato directo con los propietarios sin comisiones de intermediarios</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
