import type { TradeWithInstrument } from "@/types/trades";

export type RevengeTradingPatternType = "quick_reentry" | "consecutive_losses";

export interface RevengeTradingPattern {
  type: RevengeTradingPatternType;
  tradeIds: string[];
  description: string;
}

export interface RevengeTradingResult {
  detected: boolean;
  patterns: RevengeTradingPattern[];
}

/** Convierte "HH:MM" a minutos desde medianoche. Retorna null si no hay valor. */
function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/**
 * Detecta patrones de revenge trading en un conjunto de trades del mismo día.
 *
 * Patrón 1 — Quick reentry: trade perdedor → siguiente trade en < 30 min
 * Patrón 2 — Consecutive losses: 3+ pérdidas consecutivas
 *
 * Los trades deben estar ordenados por entry_time (ascendente).
 */
export function detectRevengeTradingPatterns(
  trades: TradeWithInstrument[]
): RevengeTradingResult {
  if (trades.length < 2) {
    return { detected: false, patterns: [] };
  }

  // Ordenar por entry_time (nulls al final)
  const sorted = [...trades].sort((a, b) => {
    const aMin = timeToMinutes(a.entry_time);
    const bMin = timeToMinutes(b.entry_time);
    if (aMin === null && bMin === null) return 0;
    if (aMin === null) return 1;
    if (bMin === null) return -1;
    return aMin - bMin;
  });

  const patterns: RevengeTradingPattern[] = [];

  // ── Patrón 1: Quick reentry (< 30 min tras pérdida) ──────────────────
  const quickReentryIds: string[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.result >= 0) continue; // Solo aplica tras pérdida

    const currentMin = timeToMinutes(current.entry_time);
    const nextMin = timeToMinutes(next.entry_time);

    if (currentMin !== null && nextMin !== null) {
      const diffMinutes = nextMin - currentMin;
      if (diffMinutes >= 0 && diffMinutes < 30) {
        if (!quickReentryIds.includes(current.id)) quickReentryIds.push(current.id);
        if (!quickReentryIds.includes(next.id)) quickReentryIds.push(next.id);
      }
    }
  }

  if (quickReentryIds.length > 0) {
    patterns.push({
      type: "quick_reentry",
      tradeIds: quickReentryIds,
      description: "Reentrada en menos de 30 min después de una pérdida",
    });
  }

  // ── Patrón 2: 3+ pérdidas consecutivas ───────────────────────────────
  let consecutiveLosses = 0;
  let consecutiveStart = -1;
  const consecutiveLossIds: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].result < 0) {
      consecutiveLosses++;
      if (consecutiveLosses === 1) consecutiveStart = i;
    } else {
      if (consecutiveLosses >= 3) {
        for (let j = consecutiveStart; j < i; j++) {
          consecutiveLossIds.push(sorted[j].id);
        }
      }
      consecutiveLosses = 0;
    }
  }
  // Verificar al final del array
  if (consecutiveLosses >= 3) {
    for (let j = consecutiveStart; j < sorted.length; j++) {
      consecutiveLossIds.push(sorted[j].id);
    }
  }

  if (consecutiveLossIds.length > 0) {
    patterns.push({
      type: "consecutive_losses",
      tradeIds: consecutiveLossIds,
      description: `${consecutiveLossIds.length} pérdidas consecutivas — posible trading emocional`,
    });
  }

  return {
    detected: patterns.length > 0,
    patterns,
  };
}
