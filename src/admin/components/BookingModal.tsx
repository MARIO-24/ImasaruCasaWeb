import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { Booking, BookingInput } from '../../types';
import { checkBookingOverlap, formatShortDate } from '../../lib/dates/calendarUtils';

export interface BookingModalProps {
  isOpen: boolean;
  initialBooking?: Booking | null;
  initialStartDate?: string;
  initialEndDate?: string;
  existingBookings: Booking[];
  onSave: (booking: BookingInput, id?: string) => Promise<boolean>;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialBooking,
  initialStartDate,
  initialEndDate,
  existingBookings,
  onSave,
  onClose,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  // Sync state when modal opens or initialBooking changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialBooking) {
      setStartDate(initialBooking.start_date);
      setEndDate(initialBooking.end_date);
      setNotes(initialBooking.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(initialStartDate || today);
      setEndDate(initialEndDate || initialStartDate || today);
      setNotes('');
    }
    setErrorMessage(null);
    setOverlapWarning(null);
  }, [isOpen, initialBooking, initialStartDate, initialEndDate]);

  // Check for conflicts whenever dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      setOverlapWarning(null);
      return;
    }

    if (endDate < startDate) {
      setOverlapWarning(null);
      return;
    }

    const { hasConflict, conflictingBooking } = checkBookingOverlap(
      startDate,
      endDate,
      existingBookings,
      initialBooking?.id
    );

    if (hasConflict && conflictingBooking) {
      setOverlapWarning(
        `Atención: Las fechas seleccionadas coinciden o se solapan con otra reserva existente (${formatShortDate(conflictingBooking.start_date)} - ${formatShortDate(conflictingBooking.end_date)}).`
      );
    } else {
      setOverlapWarning(null);
    }
  }, [startDate, endDate, existingBookings, initialBooking]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!startDate || !endDate) {
      setErrorMessage('Por favor selecciona las fechas de entrada y salida.');
      return;
    }

    if (endDate < startDate) {
      setErrorMessage('La fecha de salida no puede ser anterior a la fecha de entrada.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BookingInput = {
        start_date: startDate,
        end_date: endDate,
        status: 'booked',
        notes: notes.trim() || undefined,
      };

      const success = await onSave(payload, initialBooking?.id);
      if (success) {
        onClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al guardar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-sand-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-timber-400 hover:text-timber-900 hover:bg-sand-100 transition-colors"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-timber-950">
              {initialBooking ? 'Editar Reserva' : 'Nueva Reserva'}
            </h3>
            <p className="text-xs text-timber-500">
              {initialBooking ? 'Modifica las fechas o notas de la reserva' : 'Selecciona las fechas de entrada y salida para reservar la casa'}
            </p>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Overlap Warning notification */}
        {overlapWarning && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{overlapWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDateInput" className="block text-xs font-bold uppercase tracking-wider text-timber-700 mb-1.5">
                Fecha de Entrada
              </label>
              <input
                id="startDateInput"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-sand-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-medium text-timber-900"
              />
            </div>
            <div>
              <label htmlFor="endDateInput" className="block text-xs font-bold uppercase tracking-wider text-timber-700 mb-1.5">
                Fecha de Salida
              </label>
              <input
                id="endDateInput"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-sand-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-medium text-timber-900"
              />
            </div>
          </div>

          {/* Notes / Details */}
          <div>
            <label htmlFor="notesInput" className="block text-xs font-bold uppercase tracking-wider text-timber-700 mb-1.5">
              Notas de la Reserva (Uso Privado)
            </label>
            <textarea
              id="notesInput"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej.: Huésped: Carlos Gómez. Tel: 600 00 00 00. 4 adultos + 2 niños..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs sm:text-sm bg-sand-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-timber-900 placeholder:text-timber-400 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-timber-500 mt-1">
              Las notas son privadas para la gestión y nunca se muestran en la web pública.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-sand-200 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-sand-300 text-timber-700 hover:bg-sand-100 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold shadow-md inline-flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialBooking ? 'Actualizar Reserva' : 'Guardar Reserva'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
