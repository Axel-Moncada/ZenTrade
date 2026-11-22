"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTr } from "@/lib/i18n/use-tr";
import { computeDrawdownStatus, type DrawdownType } from "@/lib/utils/drawdown";

function money(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function Field({ id, label, value, onChange }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-zen-anti-flash">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zen-anti-flash/40">$</span>
        <input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-zen-border-soft bg-zen-rich-black py-2 pl-7 pr-3 text-sm text-zen-anti-flash focus:border-zen-caribbean-green focus:outline-none"
        />
      </div>
    </div>
  );
}

export function DrawdownCalculator() {
  const { tr } = useTr();
  const [starting, setStarting] = useState(50000);
  const [maxDd, setMaxDd] = useState(2500);
  const [peak, setPeak] = useState(51200);
  const [current, setCurrent] = useState(50400);
  const [type, setType] = useState<DrawdownType>("trailing");

  const r = useMemo(
    () =>
      computeDrawdownStatus({
        startingBalance: starting,
        currentBalance: current,
        maxDrawdown: maxDd,
        drawdownType: type,
        peakBalance: Math.max(peak, current, starting),
      }),
    [starting, current, maxDd, type, peak]
  );

  const danger = r.usedPercent >= 80;
  const warn = r.usedPercent >= 50;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-zen-border-soft bg-zen-surface p-6">
        <div className="flex gap-2">
          {(["trailing", "static"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                type === t
                  ? "border-zen-caribbean-green bg-zen-caribbean-green/15 text-zen-caribbean-green"
                  : "border-zen-border-soft text-zen-anti-flash/70"
              }`}
            >
              {t === "trailing" ? tr("Trailing", "Trailing") : tr("Estático", "Static")}
            </button>
          ))}
        </div>
        <Field id="starting" label={tr("Balance inicial de la cuenta", "Account starting balance")} value={starting} onChange={setStarting} />
        <Field id="maxdd" label={tr("Drawdown máximo", "Max drawdown")} value={maxDd} onChange={setMaxDd} />
        {type === "trailing" && (
          <Field id="peak" label={tr("Balance más alto alcanzado (cierre de trades)", "Highest balance reached (closed trades)")} value={peak} onChange={setPeak} />
        )}
        <Field id="current" label={tr("Balance actual", "Current balance")} value={current} onChange={setCurrent} />
        <p className="text-xs text-zen-anti-flash/50">
          {tr(
            "Modelo: el piso sube con tu balance más alto y deja de subir al llegar al balance inicial. Algunas firmas lo congelan un poco arriba (por ejemplo +$100) o miden el pico intradía con P&L flotante. Verifica los términos de tu cuenta.",
            "Model: the floor rises with your highest balance and stops rising once it reaches your starting balance. Some firms lock it slightly higher (for example +$100) or track the intraday peak including open P&L. Always confirm your account's terms."
          )}
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-zen-border-soft bg-zen-surface p-6" aria-live="polite">
        <div className="rounded-xl bg-zen-rich-black/60 p-5">
          <p className="text-xs text-zen-anti-flash/50">{tr("Te quedan", "You have left")}</p>
          <p className={`text-4xl font-bold ${danger ? "text-red-400" : warn ? "text-amber-400" : "text-zen-caribbean-green"}`}>
            {money(r.remaining)}
          </p>
          <p className="mt-1 text-sm text-zen-anti-flash/60">
            {tr("antes de perder la cuenta", "before you lose the account")}
          </p>
          <div className="mt-4 h-3 w-full rounded-full bg-zen-surface">
            <div
              className={`h-3 rounded-full ${danger ? "bg-red-500" : warn ? "bg-amber-500" : "bg-zen-caribbean-green"}`}
              style={{ width: `${Math.min(100, r.usedPercent)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zen-anti-flash/50">
            {r.usedPercent.toFixed(1)}% {tr("del drawdown usado", "of your drawdown used")}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-zen-rich-black/60 p-3">
            <dt className="text-xs text-zen-anti-flash/50">{tr("Piso (liquidación)", "Floor (liquidation level)")}</dt>
            <dd className="mt-1 font-semibold text-zen-anti-flash">{money(r.floor)}</dd>
          </div>
          <div className="rounded-lg bg-zen-rich-black/60 p-3">
            <dt className="text-xs text-zen-anti-flash/50">{tr("Tipo", "Type")}</dt>
            <dd className="mt-1 font-semibold text-zen-anti-flash">{type === "trailing" ? "Trailing" : tr("Estático", "Static")}</dd>
          </div>
        </dl>
        <div className="rounded-xl border border-zen-caribbean-green/20 bg-zen-rich-black/60 p-4 text-sm text-zen-anti-flash/80">
          {tr(
            "Zentrade sigue tu piso en cada cuenta con cada trade y, en ZenMode, te avisa en vivo antes de llegar a él.",
            "Zentrade tracks your floor on every account with every trade and, on ZenMode, warns you live before you get close."
          )}{" "}
          <Link href="/register" className="font-semibold text-zen-caribbean-green hover:underline">
            {tr("Crea tu cuenta gratis →", "Create your free account →")}
          </Link>
        </div>
      </div>
    </div>
  );
}
