"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthName } from "@/lib/utils/date-helpers";

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  year,
  month,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Navegación mes */}
      <div className="flex items-center gap-3 bg-zen-surface/60 backdrop-blur-sm rounded-lg border border-zen-forest/40 px-4 py-3">
        <Button
          onClick={onPreviousMonth}
          className="h-8 w-8 p-0 bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 text-zen-caribbean-green rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-[160px] text-center">
          <h2 className="text-lg font-bold text-zen-anti-flash">
            {getMonthName(month)} {year}
          </h2>
        </div>

        <Button
          onClick={onNextMonth}
          className="h-8 w-8 p-0 bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 text-zen-caribbean-green rounded-md transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-zen-forest/40" />

        <Button
          onClick={onToday}
          className="h-8 px-3 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold text-sm rounded-md transition-colors"
        >
          Hoy
        </Button>
      </div>

      {/* Spacing */}
      <div className="flex-1" />
    </div>
  );
}
