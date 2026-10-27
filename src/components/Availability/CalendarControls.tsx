import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { isCurrentOrPastMonth } from '../../lib/dates/calendarUtils';
import { MonthYearPicker } from './MonthYearPicker';

interface CalendarControlsProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetToday: () => void;
  onSelectMonth: (date: Date) => void;
  allowPastMonths?: boolean;
  infoText?: string;
}

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onResetToday,
  onSelectMonth,
  allowPastMonths = false,
  infoText = 'Solo consulta informativa',
}) => {
  const isPrevDisabled = !allowPastMonths && isCurrentOrPastMonth(currentMonth);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 sm:px-4 border-b border-sand-200">

      {/* Quick Jump Today Button */}
      <button
        type="button"
        onClick={onResetToday}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 transition-colors shadow-sm"
        title="Volver al mes actual"
      >
        <CalendarIcon className="w-4 h-4 text-amber-600" />
        <span>Ir a Hoy</span>
      </button>

      {/* Month & Year Title with Dynamic Selector */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPrevDisabled}
          onClick={onPrevMonth}
          className={`p-2 rounded-xl border transition-all ${
            isPrevDisabled
              ? 'border-sand-200 text-timber-300 bg-sand-50 cursor-not-allowed'
              : 'border-sand-300 text-timber-800 bg-white hover:bg-sand-100 shadow-sm'
          }`}
          aria-label="Mes anterior"
          title={isPrevDisabled ? 'No se puede retroceder a meses pasados' : 'Mes anterior'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <MonthYearPicker
          currentMonth={currentMonth}
          onSelect={onSelectMonth}
        />

        <button
          type="button"
          onClick={onNextMonth}
          className="p-2 rounded-xl border border-sand-300 text-timber-800 bg-white hover:bg-sand-100 shadow-sm transition-all"
          aria-label="Mes siguiente"
          title="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Informative indicator */}
      <div className="hidden sm:block text-xs text-timber-500 font-medium">
        {infoText}
      </div>
    </div>
  );
};


