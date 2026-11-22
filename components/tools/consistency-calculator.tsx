"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useTr } from "@/lib/i18n/use-tr";
import { computeConsistency, parseDailyPnl } from "@/lib/tools/consistency";

const PRESETS = [
  { value: 50, label: { es: "50% (Apex, cuentas PA desde 2026)", en: "50% (Apex Performance Accounts, 2026)" } },
  { value: 40, label: { es: "40%", en: "40%" } },
  { value: 30, label: { es: "30% (común en cuentas antiguas)", en: "30% (common on legacy accounts)" } },
];

const EXAMPLE = "450\n-120\n300\n980\n-200\n250";

function money(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ConsistencyCalculator() {
  const { tr } = useTr();
  const [raw, setRaw] = useState(EXAMPLE);
  const [threshold, setThreshold] = useState(50);

  const days = useMemo(() => parseDailyPnl(raw), [raw]);
  const r = useMemo(() => computeConsistency(days, threshold), [days, threshold]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-zen-border-soft bg-zen-surface p-6">
        <label className="block text-sm font-semibold text-zen-anti-flash" htmlFor="pnl">
          {tr("Tu P&L por día (uno por línea)", "Your daily P&L (one day per line)")}
        </label>
        <textarea
          id="pnl"
          rows={9}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="w-full rounded-lg border border-zen-border-soft bg-zen-rich-black p-3 font-mono text-sm text-zen-anti-flash focus:border-zen-caribbean-green focus:outline-none"
        />
        <p className="text-xs text-zen-anti-flash/50">
          {tr("Usa negativos para días en pérdida, por ejemplo -120.", "Use negatives for losing days, e.g. -120.")}
        </p>

        <div className="space-y-2">
          <span className="block text-sm font-semibold text-zen-anti-flash">
            {tr("Umbral de consistencia de tu firma", "Your firm's consistency threshold")}
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setThreshold(p.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  threshold === p.value
                    ? "border-zen-caribbean-green bg-zen-caribbean-green/15 text-zen-caribbean-green"
                    : "border-zen-border-soft text-zen-anti-flash/70 hover:border-zen-caribbean-green/50"
                }`}
              >
                {tr(p.label.es, p.label.en)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
              className="w-24 rounded-lg border border-zen-border-soft bg-zen-rich-black px-3 py-2 text-sm text-zen-anti-flash focus:border-zen-caribbean-green focus:outline-none"
              aria-label={tr("Umbral personalizado", "Custom threshold")}
            />
            <span className="text-sm text-zen-anti-flash/60">%</span>
          </div>
          <p className="text-xs text-zen-anti-flash/50">
            {tr(
              "Las reglas cambian según la firma, el programa y la fecha de compra. Verifica el umbral en los términos de tu cuenta.",
              "Rules vary by firm, program and purchase date. Always confirm the threshold in your account's terms."
            )}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-zen-border-soft bg-zen-surface p-6" aria-live="polite">
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            r.passes ? "border-zen-caribbean-green/40 bg-zen-caribbean-green/10" : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          {r.passes ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-zen-caribbean-green" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          )}
          <div>
            <p className={`font-bold ${r.passes ? "text-zen-caribbean-green" : "text-amber-400"}`}>
              {r.netProfit <= 0
                ? tr("Todavía no hay ganancia neta", "No net profit yet")
                : r.passes
                ? tr("Cumples la regla de consistencia", "You meet the consistency rule")
                : tr("Todavía no cumples la regla", "You don't meet the rule yet")}
            </p>
            {!r.passes && r.netProfit > 0 && (
              <p className="mt-1 text-sm text-zen-anti-flash/80">
                {tr("Necesitas", "You need")} <strong className="text-zen-anti-flash">{money(r.extraProfitNeeded)}</strong>{" "}
                {tr("más de ganancia neta sin superar tu mejor día.", "more net profit without beating your best day.")}
              </p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            { k: tr("Días", "Days"), v: String(r.days) },
            { k: tr("Ganancia neta", "Net profit"), v: money(r.netProfit) },
            { k: tr("Mejor día", "Best day"), v: money(r.bestDay) },
            { k: tr("Mejor día / neto", "Best day / net"), v: r.bestDayShare === null ? "—" : `${r.bestDayShare.toFixed(1)}%` },
            { k: tr("Neto mínimo requerido", "Minimum net profit needed"), v: money(r.requiredNetProfit) },
            { k: tr("Umbral", "Threshold"), v: `${threshold}%` },
          ].map((row) => (
            <div key={row.k} className="rounded-lg bg-zen-rich-black/60 p-3">
              <dt className="text-xs text-zen-anti-flash/50">{row.k}</dt>
              <dd className="mt-1 font-semibold text-zen-anti-flash">{row.v}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-xl border border-zen-caribbean-green/20 bg-zen-rich-black/60 p-4 text-sm text-zen-anti-flash/80">
          {tr(
            "Zentrade hace este cálculo solo con cada trade que registras, por cuenta, y te avisa en vivo antes de que un día grande te bloquee el payout.",
            "Zentrade runs this check automatically on every trade you log, per account, and warns you live before one big day blocks your payout."
          )}{" "}
          <Link href="/register" className="font-semibold text-zen-caribbean-green hover:underline">
            {tr("Crea tu cuenta gratis →", "Create your free account →")}
          </Link>
        </div>
      </div>
    </div>
  );
}
