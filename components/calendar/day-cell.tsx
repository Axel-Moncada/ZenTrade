"use client";

import { Badge } from "@/components/ui/badge";
import type { DailySummary } from "@/types/daily-summaries";
import { isToday } from "@/lib/utils/date-helpers";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, StickyNote } from "lucide-react";

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  summary: DailySummary | null;
  onClick: () => void;
}

export function DayCell({ date, isCurrentMonth, summary, onClick }: DayCellProps) {
  const today = isToday(date);
  const hasTrades = summary && summary.total_trades > 0;
  const isPositive = summary && summary.net_pnl > 0;
  const isNegative = summary && summary.net_pnl < 0;
  const isBreakEven = summary && summary.net_pnl === 0;

  // Determinar clases de estilo con dark mode
  const cellClasses = cn(
    "group relative min-h-[150px] rounded-lg p-4 transition-all duration-300 cursor-pointer",
    "hover:shadow-md hover:-translate-y-1.5 scale-100 hover:scale-[105%]",
    "flex flex-col border",
    {
      // Día actual - con borde verde brillante
      "border-2 border-yellow-200 bg-yellow-500/15 shadow-lg": today,
      // Día con trades positivos
      "border-zen-caribbean-green/40 bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/10 hover:border-zen-caribbean-green/60":
        hasTrades && isPositive && !today,
      // Día con trades negativos
      "border-zen-danger/40 bg-zen-danger/20 hover:bg-zen-danger/20 hover:border-zen-danger/60":
        hasTrades && isNegative && !today,
      // Día break even
      "border-zen-forest/40 bg-zen-forest/5 hover:bg-zen-forest/10 hover:border-zen-forest/60":
        hasTrades && isBreakEven && !today,
      // Día sin trades
      "border-zen-forest/30 bg-zen-surface/40 hover:bg-zen-surface/60":
        !hasTrades && !today,
      // Día fuera del mes
      "opacity-40 hover:opacity-60": !isCurrentMonth,
    }
  );

  const winRate = hasTrades && summary
    ? Math.round((summary.winning_trades / summary.total_trades) * 100)
    : 0;

  return (
    <div className={cellClasses} onClick={onClick}>
      {/* Header del día */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={cn("text-lg font-bold transition-colors", {
              "text-yellow-200": today,
              "text-zen-anti-flash": isCurrentMonth && !today,
              "text-zen-anti-flash/40": !isCurrentMonth,
            })}
          >
            {date.getDate()}
          </span>
          {today && (
            <span className="text-[10px] font-semibold text-yellow-200 bg-yellow-200/20 px-1.5 py-0.5 rounded">
              HOY
            </span>
          )}
        </div>

        {hasTrades && (
          <Badge
            className={cn("text-xs font-semibold px-2 py-0.5 border", {
              "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40": isPositive,
              "bg-zen-danger/20 text-zen-danger border-zen-danger/40": isNegative,
              "bg-zen-forest/20 text-zen-forest border-zen-forest/40": isBreakEven,
            })}
          >
            {summary.total_trades} {summary.total_trades === 1 ? "Trade" : "Trades"}
          </Badge>
        )}
      </div>

      {/* Métricas del día */}
      {hasTrades && summary ? (
        <div className="flex-1 flex flex-col justify-between space-y-2">
          {/* PNL con icono */}
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-zen-caribbean-green" />
            ) : isNegative ? (
              <TrendingDown className="h-4 w-4 text-zen-danger" />
            ) : (
              <div className="h-4 w-4" />
            )}
            <div
              className={cn("text-xl font-bold tracking-tight", {
                "text-zen-caribbean-green": isPositive,
                "text-zen-danger": isNegative,
                "text-zen-forest": isBreakEven,
              })}
            >
              {isPositive ? "+" : ""}
              {summary.net_pnl.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Win Rate visual bar */}
        

          {/* W/L Badge */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="px-1 py-0.5 bg-zen-caribbean-green/20 text-zen-caribbean-green rounded font-medium border border-zen-caribbean-green/30">
              {summary.winning_trades} Profit
            </span>
            <span className="text-zen-anti-flash/40">/</span>
            <span className="px-1 py-0.5 bg-zen-danger/20 text-zen-danger rounded font-medium border border-zen-danger/30">
              {summary.losing_trades} Lost
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-zen-anti-flash/50 font-medium">—</span>
        </div>
      )}

      

      {/* Hover overlay sutil */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/20 group-hover:to-transparent transition-all pointer-events-none" />
    </div>
  );
}
