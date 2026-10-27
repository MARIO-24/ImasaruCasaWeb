import React from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { Booking } from '../../types';
import { isPastDate, isTodayDate, isDateBooked } from '../../lib/dates/calendarUtils';
import { CalendarControls } from './CalendarControls';
import { addMonths, subMonths } from 'date-fns';

interface AvailabilityCalendarProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  bookings: Booking[];
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  currentMonth,
  onMonthChange,
  bookings,
}) => {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleResetToday = () => {
    onMonthChange(new Date());
  };

  // Define modifiers
  const modifiers = {
    past: (date: Date) => isPastDate(date),
    today: (date: Date) => isTodayDate(date),
    booked: (date: Date) => !isPastDate(date) && isDateBooked(date, bookings),
    free: (date: Date) => !isPastDate(date) && !isDateBooked(date, bookings),
  };

  const modifiersClassNames = {
    past: 'day-past',
    today: 'day-today',
    booked: 'day-booked',
    free: 'day-free',
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-sand-200 shadow-sm p-4 sm:p-6 select-none">
      {/* Accessible Header Controls */}
      <CalendarControls
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onResetToday={handleResetToday}
        onSelectMonth={onMonthChange}
      />

      {/* DayPicker Component (Read-Only) */}
      <div className="mt-4 flex justify-center overflow-x-auto py-2">
        <DayPicker
          mode={undefined} // Strictly read-only, non-interactive date picking
          month={currentMonth}
          onMonthChange={onMonthChange}
          locale={es}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          showOutsideDays={false}
          className="w-full max-w-md mx-auto"
        />
      </div>
    </div>
  );
};

