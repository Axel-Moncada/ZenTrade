"use client";

import { useState } from "react";
import { getZonedClock } from "@/lib/live-session/discipline-rules";
import type { LiveInstrument, LiveLocale } from "@/lib/live-session/types";

interface QuickTradeFormProps {
  accountId: string;
  today: string;
  timezone: string;
  instruments: LiveInstrument[];
  defaultSymbol: string | null;
  locale: LiveLocale;
  onCreated: () => void;
}

const TEXT = {
  es: {
    title: "Registro rápido",
    instrument: "Instrumento",
    contracts: "Contratos",
    amount: "Monto ($)",
    followed: "Seguí mi plan",
    win: "+ Ganancia",
    loss: "− Pérdida",
    invalid: "Ingresa un monto mayor a 0",
    error: "No se pudo registrar el trade",
  },
  en: {
    title: "Quick log",
    instrument: "Instrument",
    contracts: "Contracts",
    amount: "Amount ($)",
    followed: "I followed my plan",
    win: "+ Win",
    loss: "− Loss",
    invalid: "Enter an amount greater than 0",
    error: "Could not log the trade",
  },
} as const;

/** Hora actual redondeada al bloque de 30 min (formato que acepta la API de trades) */
function currentSlot(timezone: string): string {
  const { minutes } = getZonedClock(new Date(), timezone);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60 >= 30 ? 30 : 0;
  return `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
}

// Inputs nativos (no Radix) para que funcionen dentro de la ventana flotante
const inputClass =
  "w-full rounded-md border border-zen-forest/60 bg-zen-rich-black/60 px-2 py-1.5 text-sm text-zen-anti-flash focus:outline-none focus:ring-1 focus:ring-zen-caribbean-green";

export function QuickTradeForm({
  accountId,
  today,
  timezone,
  instruments,
  defaultSymbol,
  locale,
  onCreated,
}: QuickTradeFormProps) {
  const t = TEXT[locale];
  const initialInstrument =
    instruments.find((i) => i.symbol === defaultSymbol)?.id ?? instruments[0]?.id ?? "";
  const [instrumentId, setInstrumentId] = useState(initialInstrument);
  const [side, setSide] = useState<"long" | "short">("long");
  const [contracts, setContracts] = useState("1");
  const [amount, setAmount] = useState("");
  const [followedPlan, setFollowedPlan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(sign: 1 | -1) {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError(t.invalid);
      return;
    }
    setSubmitting(true);
    setError(null);
    const slot = currentSlot(timezone);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          instrument_id: instrumentId,
          trade_date: today,
          contracts: Math.max(1, parseInt(contracts, 10) || 1),
          side,
          result: sign * value,
          followed_plan: followedPlan,
          entry_time: slot,
          exit_time: slot,
          notes: locale === "es" ? "Registrado desde Sesión en Vivo" : "Logged from Live Session",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? t.error);
        return;
      }
      setAmount("");
      setFollowedPlan(true);
      onCreated();
    } catch {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-zen-forest/50 bg-zen-surface/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zen-anti-flash/60">{t.title}</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 space-y-1 text-[11px] text-zen-anti-flash/60">
          {t.instrument}
          <select className={inputClass} value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.symbol} — {i.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex overflow-hidden rounded-md border border-zen-forest/60">
          {(["long", "short"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={`flex-1 py-1.5 text-xs font-semibold uppercase transition-colors ${
                side === s
                  ? s === "long"
                    ? "bg-emerald-500/80 text-white"
                    : "bg-red-500/80 text-white"
                  : "text-zen-anti-flash/60 hover:bg-zen-forest/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          className={inputClass}
          type="number"
          min={1}
          inputMode="numeric"
          aria-label={t.contracts}
          placeholder={t.contracts}
          value={contracts}
          onChange={(e) => setContracts(e.target.value)}
        />
        <input
          className={`${inputClass} col-span-2`}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder={t.amount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-zen-anti-flash/80">
        <input type="checkbox" checked={followedPlan} onChange={(e) => setFollowedPlan(e.target.checked)} />
        {t.followed}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={submitting || !instrumentId}
          onClick={() => submit(1)}
          className="rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {t.win}
        </button>
        <button
          type="button"
          disabled={submitting || !instrumentId}
          onClick={() => submit(-1)}
          className="rounded-md bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {t.loss}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
