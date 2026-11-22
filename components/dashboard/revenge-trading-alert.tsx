"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Zap, TrendingDown } from "lucide-react";
import type { RevengeTradingPattern } from "@/lib/utils/revenge-trading";
import { useI18n } from "@/lib/i18n/context";

const COPY = {
  es: {
    title: "ZenMode — Alerta de trading emocional",
    quickReentry: "Reentrada en menos de 30 min después de una pérdida",
    consecutiveLosses: (n: number) => `${n} pérdidas consecutivas — posible trading emocional`,
    advice: "Considera tomarte un descanso antes de continuar operando.",
  },
  en: {
    title: "ZenMode — Emotional trading alert",
    quickReentry: "Re-entry less than 30 min after a loss",
    consecutiveLosses: (n: number) => `${n} consecutive losses — possible emotional trading`,
    advice: "Consider taking a break before you keep trading.",
  },
} as const;

interface Props {
  patterns: RevengeTradingPattern[];
}

const PATTERN_ICONS = {
  quick_reentry: Zap,
  consecutive_losses: TrendingDown,
};

export function RevengeTradingAlert({ patterns }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const { locale } = useI18n();
  const c = COPY[locale];

  if (dismissed || patterns.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="revenge-alert"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative rounded-xl border border-orange-500/40 bg-orange-500/10 backdrop-blur-sm p-4"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {c.title}
              </span>
            </div>

            <div className="space-y-1.5">
              {patterns.map((pattern, i) => {
                const Icon = PATTERN_ICONS[pattern.type];
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <p className="text-sm text-orange-200/90 font-medium">
                      {pattern.type === "quick_reentry"
                        ? c.quickReentry
                        : c.consecutiveLosses(pattern.tradeIds.length)}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-2 text-xs text-orange-300/60 font-light">
              {c.advice}
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-orange-400/60 hover:text-orange-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
