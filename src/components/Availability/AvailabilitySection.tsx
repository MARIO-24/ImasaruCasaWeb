import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MessageCircle, Phone, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { CalendarLegend } from './CalendarLegend';
import { fetchBookings } from '../../lib/supabase/client';
import { Booking } from '../../types';
import { HOUSE_INFO } from '../../data/houseData';

export const AvailabilitySection: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchErr } = await fetchBookings();
    if (fetchErr) {
      setError(fetchErr.message);
      setBookings([]);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  return (
    <section id="disponibilidad" className="py-14 sm:py-20 bg-sand-100/50 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 flex items-center justify-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Consulta de Fechas
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-timber-950 mt-2 tracking-tight">
            Calendario de Disponibilidad
          </h2>
          <p className="text-sm sm:text-base text-timber-700 mt-3 leading-relaxed">
            Consulta qué fechas se encuentran libres u ocupadas. El calendario es meramente informativo. Para solicitar una reserva o consultar tarifas, ponte en contacto directo con Pilar y Paco.
          </p>
        </div>

        {/* Supabase Error / Unconfigured State Notice */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-amber-950 mb-1">
              Disponibilidad en tiempo real no sincronizada
            </h3>
            <p className="text-sm text-amber-800 max-w-lg mx-auto mb-5 leading-relaxed">
              No ha sido posible sincronizar el calendario con la base de datos en este momento. Por favor, consulta directamente la disponibilidad para tus fechas deseadas con los propietarios:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={HOUSE_INFO.hosts.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </a>
              <a
                href={`tel:${HOUSE_INFO.hosts.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-timber-900 text-white font-medium text-sm hover:bg-timber-800 transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Llamar a Pilar ({HOUSE_INFO.hosts.phoneFormatted})
              </a>
              <button
                onClick={loadAvailability}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-medium text-sm hover:bg-amber-100/60 transition-colors"
                title="Reintentar conexión"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-8 text-center bg-white rounded-3xl border border-sand-200 mb-6">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-terracotta-500 border-t-transparent rounded-full mb-2" />
            <p className="text-sm text-timber-600">Consultando disponibilidad con Supabase...</p>
          </div>
        )}

        {/* Calendar Box */}
        {!loading && (
          <div className="space-y-5">
            <AvailabilityCalendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              bookings={bookings}
            />

            {/* Visual Legend */}
            <CalendarLegend />

            {/* Explanatory Info Card */}
            <div className="p-4 rounded-xl bg-sand-50 border border-sand-200/80 flex items-start gap-3 text-xs text-timber-700">
              <Info className="w-4 h-4 text-terracotta-600 flex-shrink-0 mt-0.5" />
              <p>
                <b>¿Cómo reservar?</b> Una vez comprobada la disponibilidad en el calendario, contacta con nosotros vía WhatsApp o teléfono. Te confirmaremos el precio total y los detalles de tu estancia de forma personalizada.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

