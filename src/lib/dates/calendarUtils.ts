import { 
  format, 
  isSameDay, 
  isBefore, 
  startOfDay, 
  parseISO, 
  isWithinInterval, 
  startOfMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Booking } from '../../types';

export const SPANISH_LOCALE = es;

/**
 * Checks if a date falls strictly before today (past day)
 */
export function isPastDate(date: Date): boolean {
  const today = startOfDay(new Date());
  return isBefore(startOfDay(date), today);
}

/**
 * Checks if a date is today
 */
export function isTodayDate(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Checks if a date is within any booked period
 */
export function isDateBooked(date: Date, bookings: Booking[]): boolean {
  const target = startOfDay(date);
  return bookings.some(b => {
    try {
      const start = startOfDay(parseISO(b.start_date));
      const end = startOfDay(parseISO(b.end_date));
      return isWithinInterval(target, { start, end });
    } catch {
      return false;
    }
  });
}

/**
 * Format a month and year in Spanish (e.g. "Septiembre 2026")
 */
export function formatMonthYear(date: Date): string {
  const str = format(date, 'MMMM yyyy', { locale: es });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Checks if the given month is the current calendar month or before
 */
export function isCurrentOrPastMonth(month: Date): boolean {
  const currentMonthStart = startOfMonth(new Date());
  const targetMonthStart = startOfMonth(month);
  return isBefore(targetMonthStart, currentMonthStart) || isSameDay(targetMonthStart, currentMonthStart);
}

/**
 * Generates an open-ended dynamic array of years from current year onward
 */
export function getAvailableYears(fromYear?: number, count = 5): number[] {
  const baseYear = fromYear ?? new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => baseYear + i);
}

/**
 * Month names list in Spanish
 */
export const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Checks if a proposed date interval [startDate, endDate] overlaps with any existing bookings.
 * Two intervals [A_start, A_end] and [B_start, B_end] overlap if:
 * A_start <= B_end && A_end >= B_start.
 * Can optionally exclude a specific booking ID (useful during booking edits).
 */
export function checkBookingOverlap(
  startDateStr: string,
  endDateStr: string,
  bookings: Booking[],
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: Booking } {
  try {
    const newStart = startOfDay(parseISO(startDateStr));
    const newEnd = startOfDay(parseISO(endDateStr));

    for (const b of bookings) {
      if (excludeBookingId && b.id === excludeBookingId) continue;
      
      const bStart = startOfDay(parseISO(b.start_date));
      const bEnd = startOfDay(parseISO(b.end_date));

      if (newStart <= bEnd && newEnd >= bStart) {
        return { hasConflict: true, conflictingBooking: b };
      }
    }
    return { hasConflict: false };
  } catch {
    return { hasConflict: false };
  }
}

/**
 * Formats a date string or Date object into human-readable Spanish (e.g. "15 de mayo de 2026")
 */
export function formatDisplayDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(d, "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a date string or Date object into short Spanish (e.g. "15 may 2026")
 */
export function formatShortDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(d, 'd MMM yyyy', { locale: es });
  } catch {
    return String(dateInput);
  }
}

