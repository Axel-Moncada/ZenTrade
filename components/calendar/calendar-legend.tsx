"use client";

import { TrendingUp, TrendingDown, Calendar, Minus } from "lucide-react";

export function CalendarLegend() {
  return (
    <div className="flex items-center gap-6 bg-zen-surface/60 backdrop-blur-sm rounded-lg border border-zen-forest/40 px-6 py-3">
      {/* Día positivo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-zen-caribbean-green/20 border border-zen-caribbean-green/40 flex items-center justify-center">
          <TrendingUp className="h-3.5 w-3.5 text-zen-caribbean-green" />
        </div>
        <span className="text-xs font-medium text-zen-anti-flash/80">Positivo</span>
      </div>

      {/* Separador */}
      <div className="w-px h-4 bg-zen-forest/40" />

      {/* Día negativo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-zen-danger/20 border border-zen-danger/40 flex items-center justify-center">
          <TrendingDown className="h-3.5 w-3.5 text-zen-danger" />
        </div>
        <span className="text-xs font-medium text-zen-anti-flash/80">Negativo</span>
      </div>

      {/* Separador */}
      <div className="w-px h-4 bg-zen-forest/40" />

      {/* Break even */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-zen-forest/20 border border-zen-forest/40 flex items-center justify-center">
          <Minus className="h-3.5 w-3.5 text-zen-forest" />
        </div>
        <span className="text-xs font-medium text-zen-anti-flash/80">Break even</span>
      </div>

      {/* Separador */}
      <div className="w-px h-4 bg-zen-forest/40" />

      {/* Día actual */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-zen-caribbean-green/20 border-2 border-zen-caribbean-green flex items-center justify-center ring-1 ring-zen-caribbean-green/30">
          <Calendar className="h-3.5 w-3.5 text-zen-caribbean-green" />
        </div>
        <span className="text-xs font-medium text-zen-anti-flash/80">Hoy</span>
      </div>
    </div>
  );
}
