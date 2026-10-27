import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  BedDouble, 
  CalendarRange
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { 
  startOfDay, 
  parseISO, 
  addMonths, 
  subMonths, 
  isWithinInterval, 
  format, 
  addDays, 
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { Booking, BookingInput } from '../../types';
import { isTodayDate, formatDisplayDate, formatShortDate } from '../../lib/dates/calendarUtils';
import { CalendarControls } from '../../components/Availability/CalendarControls';
import { BookingModal } from './BookingModal';
import { ConfirmModal } from './ConfirmModal';

interface AdminBookingsProps {
  bookings: Booking[];
  onSaveBooking: (booking: BookingInput, existingId?: string) => Promise<{ success: boolean; error: Error | null }>;
  onDeleteBooking: (id: string) => Promise<{ success: boolean; error: Error | null }>;
  loading?: boolean;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({
  bookings,
  onSaveBooking,
  onDeleteBooking,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [prefillDates, setPrefillDates] = useState<{ start_date?: string; end_date?: string } | undefined>(undefined);
  
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Handlers for month navigation
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleResetToday = () => setCurrentMonth(new Date());

  // Find a booking covering a specific day
  const findBookingForDate = (date: Date): Booking | undefined => {
    const target = startOfDay(date);
    return bookings.find((b) => {
      try {
        const start = startOfDay(parseISO(b.start_date));
        const end = startOfDay(parseISO(b.end_date));
        return isWithinInterval(target, { start, end });
      } catch {
        return false;
      }
    });
  };

  // Day click handler on the calendar
  const handleDayClick = (date: Date) => {
    const existing = findBookingForDate(date);
    if (existing) {
      setEditingBooking(existing);
      setPrefillDates(undefined);
      setIsModalOpen(true);
    } else {
      const start = format(date, 'yyyy-MM-dd');
      const end = format(addDays(date, 2), 'yyyy-MM-dd'); // default 2 nights
      setEditingBooking(null);
      setPrefillDates({ start_date: start, end_date: end });
      setIsModalOpen(true);
    }
  };

  // Calendar DayPicker Modifiers: Reservado vs Libre
  const modifiers = {
    today: (date: Date) => isTodayDate(date),
    booked: (date: Date) => Boolean(findBookingForDate(date)),
    free: (date: Date) => !findBookingForDate(date),
  };

  const modifiersClassNames = {
    today: 'day-today',
    booked: 'day-booked cursor-pointer hover:ring-2 hover:ring-rose-400',
    free: 'day-free cursor-pointer hover:ring-2 hover:ring-emerald-400',
  };

  // Bookings occurring in the currently viewed month
  const currentMonthBookings = useMemo(() => {
    const mStart = startOfMonth(currentMonth);
    const mEnd = endOfMonth(currentMonth);

    return bookings
      .filter((b) => {
        try {
          const bStart = startOfDay(parseISO(b.start_date));
          const bEnd = startOfDay(parseISO(b.end_date));
          return bStart <= mEnd && bEnd >= mStart;
        } catch {
          return false;
        }
      })
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [bookings, currentMonth]);

  // Filtering for List View
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Category filter
      if (filter === 'upcoming' && b.end_date < todayStr) return false;
      if (filter === 'past' && b.end_date >= todayStr) return false;

      // 2. Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNotes = b.notes?.toLowerCase().includes(query) ?? false;
        const matchesStart = b.start_date.includes(query);
        const matchesEnd = b.end_date.includes(query);
        return matchesNotes || matchesStart || matchesEnd;
      }

      return true;
    });
  }, [bookings, filter, searchTerm, todayStr]);

  // Status badge helper: Reservado
  const renderBadge = (_status?: Booking['status']) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <BedDouble className="w-3.5 h-3.5 text-rose-600" />
        <span>Reservado</span>
      </span>
    );
  };

  // Calculate nights
  const getNightsCount = (startDate: string, endDate: string) => {
    try {
      const nights = differenceInCalendarDays(parseISO(endDate), parseISO(startDate));
      return nights > 0 ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : 'Mismo día';
    } catch {
      return '';
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBooking) return;
    setIsDeleting(true);
    await onDeleteBooking(deletingBooking.id);
    setIsDeleting(false);
    setDeletingBooking(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-sand-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-timber-950">
            Gestión de Reservas
          </h2>
          <p className="text-xs sm:text-sm text-timber-500 mt-0.5">
            Consulta el calendario interactivo y gestiona las reservas de la casa
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle Tabs */}
          <div className="flex items-center bg-sand-100 p-1 rounded-2xl border border-sand-200">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-timber-950 shadow-sm'
                  : 'text-timber-600 hover:text-timber-950'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-terracotta-600" />
              <span>Calendario</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-timber-950 shadow-sm'
                  : 'text-timber-600 hover:text-timber-950'
              }`}
            >
              <List className="w-4 h-4 text-terracotta-600" />
              <span>Lista ({bookings.length})</span>
            </button>
          </div>

          {/* New Booking Button */}
          <button
            type="button"
            onClick={() => {
              setEditingBooking(null);
              setPrefillDates(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva reserva</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CALENDAR VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-4 sm:p-6">
            {/* Calendar Controls */}
            <CalendarControls
              currentMonth={currentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onResetToday={handleResetToday}
              onSelectMonth={setCurrentMonth}
              allowPastMonths={true}
              infoText="Haz clic en cualquier día para crear o modificar una reserva"
            />

            {/* Interactive DayPicker */}
            <div className="mt-4 flex justify-center overflow-x-auto py-2">
              <DayPicker
                mode="single"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={es}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                onDayClick={handleDayClick}
                showOutsideDays={false}
                className="w-full max-w-lg mx-auto"
              />
            </div>

            {/* Calendar Legend: Reservado vs Libre */}
            <div className="mt-6 pt-4 border-t border-sand-200 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-timber-700">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-400" />
                <span>Libre (Disponible)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-100 border border-rose-400" />
                <span>Reservado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-500" />
                <span>Día actual (Hoy)</span>
              </div>
            </div>
          </div>

          {/* Bookings In Current Selected Month */}
          <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6">
            <h3 className="text-base font-serif font-bold text-timber-950 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-terracotta-600" />
                Reservas en este mes ({currentMonthBookings.length})
              </span>
              <span className="text-xs text-timber-500 font-sans font-normal">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
            </h3>

            {currentMonthBookings.length === 0 ? (
              <p className="text-xs sm:text-sm text-timber-500 py-4 text-center">
                No hay reservas registradas en este mes. Haz clic en el calendario para añadir una.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentMonthBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 hover:bg-sand-50 flex items-start justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {renderBadge(b.status)}
                        <span className="text-xs text-timber-500 font-medium">
                          {getNightsCount(b.start_date, b.end_date)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-timber-950">
                        {formatShortDate(b.start_date)} → {formatShortDate(b.end_date)}
                      </p>
                      {b.notes && (
                        <p className="text-xs text-timber-600 mt-1 line-clamp-2 italic">
                          "{b.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBooking(b);
                          setPrefillDates(undefined);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-timber-600 hover:text-timber-900 hover:bg-white border border-transparent hover:border-sand-200 transition-colors"
                        title="Editar reserva"
                        aria-label="Editar reserva"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBooking(b)}
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                        title="Eliminar reserva"
                        aria-label="Eliminar reserva"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sand-200">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === 'all'
                    ? 'bg-timber-900 text-white'
                    : 'bg-sand-100 text-timber-700 hover:bg-sand-200'
                }`}
              >
                Todas ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('upcoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-timber-900 text-white'
                    : 'bg-sand-100 text-timber-700 hover:bg-sand-200'
                }`}
              >
                Próximas
              </button>
              <button
                type="button"
                onClick={() => setFilter('past')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === 'past'
                    ? 'bg-timber-900 text-white'
                    : 'bg-sand-100 text-timber-700 hover:bg-sand-200'
                }`}
              >
                Pasadas
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-timber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por notas o fecha..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-sand-50 border border-sand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>
          </div>

          {/* Bookings List Cards */}
          {loading ? (
            <div className="py-12 text-center text-timber-500 text-sm">
              Cargando reservas...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarIcon className="w-10 h-10 text-sand-300 mx-auto mb-3" />
              <p className="text-timber-700 font-medium text-sm">No se encontraron reservas con este filtro.</p>
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="mt-3 text-xs text-terracotta-600 font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((booking) => {
                const isPast = booking.end_date < todayStr;
                const isCurrent = booking.start_date <= todayStr && todayStr < booking.end_date;

                return (
                  <div
                    key={booking.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-terracotta-300 bg-sand-50/80 ring-2 ring-terracotta-400/40'
                        : isPast
                        ? 'border-sand-200 bg-white/70 opacity-80'
                        : 'border-sand-200 bg-white hover:border-sand-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          {renderBadge(booking.status)}
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              En curso
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-timber-500">
                          {getNightsCount(booking.start_date, booking.end_date)}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="mb-3">
                        <p className="text-sm font-bold text-timber-950">
                          {formatDisplayDate(booking.start_date)}
                        </p>
                        <p className="text-xs text-timber-500">
                          hasta el {formatDisplayDate(booking.end_date)}
                        </p>
                      </div>

                      {/* Notes Section */}
                      {booking.notes ? (
                        <div className="p-3 rounded-xl bg-sand-50 text-xs text-timber-700 border border-sand-200/80 mb-4 whitespace-pre-wrap">
                          {booking.notes}
                        </div>
                      ) : (
                        <p className="text-xs text-timber-400 italic mb-4">
                          Sin notas o datos de huésped
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                      <span className="text-[10px] text-timber-400">
                        {booking.created_at ? `Creado: ${booking.created_at.split('T')[0]}` : ''}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBooking(booking);
                            setPrefillDates(undefined);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-sand-200 text-timber-700 hover:text-timber-950 hover:bg-sand-50 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingBooking(booking)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                          title="Eliminar reserva"
                          aria-label="Eliminar reserva"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOOKING MODAL (CREATE / EDIT) */}
      {/* ========================================================================= */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBooking(null);
          setPrefillDates(undefined);
        }}
        initialBooking={editingBooking}
        existingBookings={bookings}
        initialStartDate={prefillDates?.start_date}
        initialEndDate={prefillDates?.end_date}
        onSave={async (bookingInput: BookingInput, id?: string) => {
          const res = await onSaveBooking(bookingInput, id);
          return res.success;
        }}
      />

      {/* ========================================================================= */}
      {/* CONFIRM DELETE MODAL */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={deletingBooking !== null}
        title="Eliminar Reserva"
        message={
          deletingBooking
            ? `¿Estás seguro de que deseas eliminar la reserva del ${formatShortDate(deletingBooking.start_date)} al ${formatShortDate(deletingBooking.end_date)}? Esta acción liberará estas fechas en el calendario inmediatamente.`
            : ''
        }
        confirmLabel="Sí, eliminar definitivamente"
        cancelLabel="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBooking(null)}
      />
    </div>
  );
};
