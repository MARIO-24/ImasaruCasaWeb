import React from 'react';
import { 
  Calendar, 
  Plus, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  BedDouble, 
  ArrowRight, 
  UserCheck, 
  Loader2 
} from 'lucide-react';
import { Booking, Review } from '../../types';
import { formatDisplayDate } from '../../lib/dates/calendarUtils';

export interface AdminDashboardProps {
  bookings: Booking[];
  reviews: Review[];
  onNewBooking: () => void;
  onEditBooking: (booking: Booking) => void;
  onNavigate: (tab: 'dashboard' | 'reservas' | 'resenas') => void;
  loading?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  reviews,
  onNewBooking,
  onEditBooking,
  onNavigate,
  loading = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check today's occupancy status
  const todayBooking = bookings.find((b) => {
    return b.start_date <= todayStr && todayStr < b.end_date;
  });

  // 2. Upcoming bookings (end_date > todayStr), sorted chronologically ascending
  const upcomingBookings = bookings
    .filter((b) => b.end_date > todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const nextArrival = upcomingBookings.find((b) => b.start_date >= todayStr);

  // 3. Reviews metrics
  const pendingReviews = reviews.filter((r) => !r.approved);
  const approvedReviews = reviews.filter((r) => r.approved);

  const renderStatusBadge = () => {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Reservado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-terracotta-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-timber-700">Cargando datos de gestión...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Today's Occupancy Status */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-timber-500 mb-2">
              <Clock className="w-4 h-4 text-terracotta-600" />
              <span>Estado en tiempo real • Hoy ({formatDisplayDate(todayStr)})</span>
            </div>

            {todayBooking ? (
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-timber-950 flex flex-wrap items-center gap-2 sm:gap-3">
                    Casa Ocupada
                    {renderStatusBadge()}
                  </h2>
                  <p className="text-xs sm:text-sm text-timber-600 mt-0.5">
                    Desde el {formatDisplayDate(todayBooking.start_date)} hasta el {formatDisplayDate(todayBooking.end_date)}
                    {todayBooking.notes ? ` • "${todayBooking.notes}"` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-timber-950 flex flex-wrap items-center gap-2 sm:gap-3">
                    Casa Disponible
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Libre hoy
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-timber-600 mt-0.5">
                    {nextArrival
                      ? `Próxima llegada programada: ${formatDisplayDate(nextArrival.start_date)}`
                      : 'No hay reservas próximas registradas actualmente.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button in Banner */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNewBooking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva reserva</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total upcoming */}
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sand-100 text-terracotta-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-timber-500 uppercase tracking-wider block">
              Próximas reservas
            </span>
            <span className="text-2xl font-bold font-serif text-timber-950">
              {upcomingBookings.length}
            </span>
          </div>
        </div>

        {/* Metric 2: Next arrival */}
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sand-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-timber-500 uppercase tracking-wider block truncate">
              Próxima llegada
            </span>
            <span className="text-sm sm:text-base font-bold text-timber-950 block truncate">
              {nextArrival ? formatDisplayDate(nextArrival.start_date) : 'Sin reservas'}
            </span>
          </div>
        </div>

        {/* Metric 3: Pending reviews */}
        <div
          onClick={() => onNavigate('resenas')}
          className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-sand-300 transition-colors group"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            pendingReviews.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-sand-100 text-timber-600'
          }`}>
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-timber-500 uppercase tracking-wider block truncate">
              Opiniones por moderar
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-serif text-timber-950">
                {pendingReviews.length}
              </span>
              {pendingReviews.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  Acción requerida
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 4: Approved reviews */}
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sand-100 text-olive-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-timber-500 uppercase tracking-wider block">
              Opiniones públicas
            </span>
            <span className="text-2xl font-bold font-serif text-timber-950">
              {approvedReviews.length}
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Upcoming Bookings & Reviews Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Upcoming Bookings List */}
        <section className="lg:col-span-2 bg-white rounded-3xl p-6 border border-sand-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-sand-200 mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-timber-950">
                  Próximas Reservas
                </h3>
                <p className="text-xs text-timber-500">
                  Estancias y fechas reservadas
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('reservas')}
                className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 p-2 rounded-xl hover:bg-sand-50 transition-colors"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="w-10 h-10 text-sand-300 mx-auto mb-3" />
                <p className="text-timber-700 font-medium text-sm">No hay reservas programadas actualmente.</p>
                <p className="text-xs text-timber-500 mt-1">Crea una nueva reserva para comenzar.</p>
                <button
                  type="button"
                  onClick={onNewBooking}
                  className="mt-4 px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-timber-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear reserva</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-sand-100">
                {upcomingBookings.slice(0, 5).map((booking) => {
                  const isCurrent = booking.start_date <= todayStr && todayStr < booking.end_date;
                  return (
                    <div
                      key={booking.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sand-50/60 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {renderStatusBadge()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-timber-900 flex items-center gap-2">
                            <span>{formatDisplayDate(booking.start_date)} → {formatDisplayDate(booking.end_date)}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                En curso
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-timber-600 line-clamp-1 mt-0.5">
                            {booking.notes || 'Sin notas adicionales'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onEditBooking(booking)}
                          className="px-3 py-1.5 rounded-lg border border-sand-200 hover:border-sand-300 text-timber-700 hover:text-timber-900 text-xs font-medium hover:bg-white transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {upcomingBookings.length > 5 && (
            <div className="pt-4 border-t border-sand-100 text-center">
              <button
                type="button"
                onClick={() => onNavigate('reservas')}
                className="text-xs font-semibold text-terracotta-600 hover:underline"
              >
                + {upcomingBookings.length - 5} reservas más registradas
              </button>
            </div>
          )}
        </section>

        {/* Right Column (1/3): Quick Shortcuts & Pending Reviews */}
        <section className="space-y-6">
          {/* Pending Reviews widget */}
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-3">
              <h3 className="text-base font-serif font-bold text-timber-950 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-terracotta-600" />
                Moderación de Opiniones
              </h3>
            </div>

            {pendingReviews.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        {pendingReviews.length} {pendingReviews.length === 1 ? 'opinión pendiente' : 'opiniones pendientes'}
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Hay testimonios enviados por huéspedes que requieren revisión antes de publicarse en la web.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {pendingReviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-sand-50 text-xs border border-sand-200/80">
                      <div className="flex items-center justify-between font-semibold text-timber-900 mb-1">
                        <span>{rev.author_name}</span>
                        <span className="text-amber-600">★ {rev.rating}/5</span>
                      </div>
                      <p className="text-timber-600 italic line-clamp-2 text-[11px]">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('resenas')}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors text-center"
                >
                  Ir a moderar opiniones
                </button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-timber-800">
                  Todo al día
                </p>
                <p className="text-[11px] text-timber-500 mt-0.5">
                  No hay opiniones pendientes de moderar.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('resenas')}
                  className="mt-3 text-xs font-semibold text-timber-700 hover:text-terracotta-600 hover:underline"
                >
                  Ver opiniones publicadas
                </button>
              </div>
            )}
          </div>

          {/* Quick Admin Actions Box */}
          <div className="bg-sand-50/80 rounded-3xl p-6 border border-sand-200">
            <h3 className="text-sm font-serif font-bold text-timber-950 mb-3">
              Accesos Rápidos
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onNewBooking}
                className="w-full p-3 rounded-xl bg-white hover:bg-sand-100 border border-sand-200 text-timber-900 text-xs font-semibold flex items-center justify-between transition-colors shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-terracotta-600" />
                  Añadir reserva manual
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-timber-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('reservas')}
                className="w-full p-3 rounded-xl bg-white hover:bg-sand-100 border border-sand-200 text-timber-900 text-xs font-semibold flex items-center justify-between transition-colors shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-terracotta-600" />
                  Abrir calendario de reservas
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-timber-400" />
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-xl bg-white hover:bg-sand-100 border border-sand-200 text-timber-900 text-xs font-semibold flex items-center justify-between transition-colors shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-olive-600" />
                  Comprobar web pública
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-timber-400" />
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

