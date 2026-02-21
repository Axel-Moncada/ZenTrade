"use client";

import { DayCell } from "./day-cell";
import type { DailySummary } from "@/types/daily-summaries";
import {
  generateCalendarDays,
  getWeekDayNames,
  formatDateToISO,
} from "@/lib/utils/date-helpers";

interface MonthlyCalendarProps {
  year: number;
  month: number;
  summaries: DailySummary[];
  onDayClick: (date: Date, summary: DailySummary | null) => void;
}

export function MonthlyCalendar({
  year,
  month,
  summaries,
  onDayClick,
}: MonthlyCalendarProps) {
  const days = generateCalendarDays(year, month);
  const weekDays = getWeekDayNames(true);

  // Crear mapa de summaries por fecha para búsqueda rápida
  const summariesMap = new Map<string, DailySummary>();
  summaries.forEach((summary) => {
    summariesMap.set(summary.summary_date, summary);
  });

  return (
    <div className="bg-zen-surface/60 backdrop-blur-sm rounded-xl border border-zen-forest/40 p-6">
      {/* Headers días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => (
          <div
            key={`weekday-${index}`}
            className="text-center text-xs font-bold text-zen-anti-flash/100 py-2.5 bg-zen-bangladesh-green/20 border border-zen-forest/30 rounded-md"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((date) => {
          const dateString = formatDateToISO(date);
          const isCurrentMonth = date.getMonth() === month;
          const summary = summariesMap.get(dateString) || null;

          return (
            <DayCell
              key={dateString}
              date={date}
              isCurrentMonth={isCurrentMonth}
              summary={summary}
              onClick={() => onDayClick(date, summary)}
            />
          );
        })}
      </div>
    </div>
  );
}
