import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { SPANISH_MONTHS, getAvailableYears } from '../../lib/dates/calendarUtils';

interface MonthYearPickerProps {
  currentMonth: Date;
  onSelect: (newMonth: Date) => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  currentMonth,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const selectedYear = currentMonth.getFullYear();
  const selectedMonthIdx = currentMonth.getMonth();

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Generate 8 years dynamically starting from current year
  const availableYears = getAvailableYears(currentYear, 8);

  const handleMonthSelect = (monthIdx: number, year: number) => {
    // If selecting past month in current year, do not allow
    if (year === currentYear && monthIdx < currentMonthIdx) {
      return;
    }
    const newDate = new Date(year, monthIdx, 1);
    onSelect(newDate);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 border border-sand-300/80 text-sm font-semibold text-timber-900 transition-colors"
        aria-expanded={isOpen}
        aria-label="Abrir selector de mes y año"
      >
        <span>
          {SPANISH_MONTHS[selectedMonthIdx]} {selectedYear}
        </span>
        <ChevronDown className={`w-4 h-4 text-timber-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-sand-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-sand-200">
              <span className="text-xs font-bold uppercase tracking-wider text-timber-700">
                Seleccionar Mes y Año
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-timber-500 hover:bg-sand-100"
                aria-label="Cerrar selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Years tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
              {availableYears.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    // Switch year maintaining valid month
                    const targetMonth = (year === currentYear && selectedMonthIdx < currentMonthIdx)
                      ? currentMonthIdx
                      : selectedMonthIdx;
                    onSelect(new Date(year, targetMonth, 1));
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    year === selectedYear
                      ? 'bg-timber-900 text-white'
                      : 'bg-sand-100 text-timber-700 hover:bg-sand-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Months grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {SPANISH_MONTHS.map((monthName, idx) => {
                const isPast = selectedYear === currentYear && idx < currentMonthIdx;
                const isSelected = selectedYear === currentMonth.getFullYear() && idx === selectedMonthIdx;

                return (
                  <button
                    key={monthName}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleMonthSelect(idx, selectedYear)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${
                      isSelected
                        ? 'bg-terracotta-600 text-white font-bold'
                        : isPast
                        ? 'text-timber-300 bg-sand-50 cursor-not-allowed line-through'
                        : 'text-timber-800 hover:bg-sand-100'
                    }`}
                  >
                    {monthName.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
      )}
    </div>
  );
};

