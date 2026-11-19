"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, Info, Timer } from "lucide-react";
import type { AlertLevel, DisciplineSummary, LiveLocale } from "@/lib/live-session/types";

interface CopilotPanelProps {
  summary: DisciplineSummary;
  accountName: string;
  currency: string;
  locale: LiveLocale;
  compact?: boolean;
  children?: React.ReactNode;
}

const TEXT = {
  es: {
    status: { ok: "EN CONTROL", caution: "PRECAUCIÓN", stop: "PARA DE OPERAR" },
    pnl: "P&L hoy",
    trades: "Trades",
    dd: "DD restante",
    streak: "Racha −",
    cooldown: "Cooldown",
  },
  en: {
    status: { ok: "IN CONTROL", caution: "CAUTION", stop: "STOP TRADING" },
    pnl: "Today P&L",
    trades: "Trades",
    dd: "DD left",
    streak: "Loss streak",
    cooldown: "Cooldown",
  },
} as const;

const STATUS_STYLES: Record<DisciplineSummary["status"], string> = {
  ok: "bg-emerald-500/15 border-emerald-500/50 text-emerald-400",
  caution: "bg-amber-500/15 border-amber-500/50 text-amber-400",
  stop: "bg-red-500/20 border-red-500/60 text-red-400 animate-pulse",
};

const ALERT_STYLES: Record<AlertLevel, { box: string; icon: string; Icon: typeof Info }> = {
  danger: { box: "border-red-500/50 bg-red-500/10", icon: "text-red-400", Icon: AlertOctagon },
  warning: { box: "border-amber-500/50 bg-amber-500/10", icon: "text-amber-400", Icon: AlertTriangle },
  info: { box: "border-sky-500/40 bg-sky-500/10", icon: "text-sky-400", Icon: Info },
  success: { box: "border-emerald-500/40 bg-emerald-500/10", icon: "text-emerald-400", Icon: CheckCircle2 },
};

function money(value: number, currency: string, locale: LiveLocale) {
  try {
    return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

export function CopilotPanel({ summary, accountName, currency, locale, compact, children }: CopilotPanelProps) {
  const t = TEXT[locale];
  const pnlColor = summary.todayPnl > 0 ? "text-emerald-400" : summary.todayPnl < 0 ? "text-red-400" : "text-zen-anti-flash";

  return (
    <div className={`flex flex-col gap-3 ${compact ? "p-3" : ""}`}>
      <div className={`rounded-lg border px-3 py-2 text-center ${STATUS_STYLES[summary.status]}`}>
        <p className="text-[10px] uppercase tracking-widest opacity-70">{accountName}</p>
        <p className="text-lg font-bold tracking-wide">{t.status[summary.status]}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label={t.pnl} value={money(summary.todayPnl, currency, locale)} valueClass={pnlColor} />
        <Metric label={t.trades} value={String(summary.tradesCount)} />
        <Metric
          label={t.dd}
          value={money(Math.max(0, summary.remainingDrawdown), currency, locale)}
          valueClass={summary.remainingDrawdown <= 0 ? "text-red-400" : undefined}
        />
      </div>

      {summary.cooldownMinutesLeft > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 py-2 text-amber-400">
          <Timer className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {t.cooldown}: {summary.cooldownMinutesLeft} min
          </span>
        </div>
      )}

      <ul className="flex flex-col gap-2" aria-live="polite">
        {summary.alerts.map((alert) => {
          const style = ALERT_STYLES[alert.level];
          return (
            <li key={alert.id} className={`flex gap-2 rounded-lg border p-2.5 ${style.box}`}>
              <style.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${style.icon}`}>{alert.title}</p>
                <p className="text-xs leading-snug text-zen-anti-flash/80">{alert.message}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {children}
    </div>
  );
}

function Metric({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-zen-forest/50 bg-zen-surface/60 px-1 py-2">
      <p className="text-[10px] uppercase tracking-wider text-zen-anti-flash/50">{label}</p>
      <p className={`text-sm font-bold ${valueClass ?? "text-zen-anti-flash"}`}>{value}</p>
    </div>
  );
}
