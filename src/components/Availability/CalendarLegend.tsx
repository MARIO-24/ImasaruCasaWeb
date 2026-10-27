import React from 'react';

export const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 px-5 rounded-2xl bg-sand-100/80 border border-sand-200 text-xs sm:text-sm font-medium text-timber-800">
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600/30 flex-shrink-0" />
        <span>Libre</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-600/30 flex-shrink-0" />
        <span>Ocupado</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-amber-500/60 flex-shrink-0" />
        <span>Hoy</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-full bg-sand-300 border border-sand-400 flex-shrink-0" />
        <span>Día pasado</span>
      </div>
    </div>
  );
};

