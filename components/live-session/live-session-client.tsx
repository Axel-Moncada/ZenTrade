"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, BellOff, PictureInPicture2, Radio, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useDocumentPip } from "@/lib/hooks/useDocumentPip";
import { evaluateDiscipline } from "@/lib/live-session/discipline-rules";
import type { LiveInstrument, LiveLocale, LiveSessionData } from "@/lib/live-session/types";
import { CopilotPanel } from "./copilot-panel";
import { QuickTradeForm } from "./quick-trade-form";

interface LiveSessionClientProps {
  accounts: Array<{ id: string; name: string }>;
  initialData: LiveSessionData;
  instruments: LiveInstrument[];
}

const TEXT = {
  es: {
    title: "Sesión en Vivo",
    subtitle: "Tu copiloto de disciplina: vigila tu plan y las reglas de tu prop firm mientras operas.",
    account: "Cuenta",
    float: "Abrir ventana flotante",
    floatClose: "Cerrar ventana flotante",
    floatHint: "Déjala encima de Tradovate, NinjaTrader o TradingView. Requiere Chrome o Edge.",
    floatUnsupported: "Tu navegador no soporta ventana flotante. Usa Chrome o Edge de escritorio.",
    notify: "Activar avisos",
    notifyOn: "Avisos activos",
    floating: "El copiloto está abierto en la ventana flotante.",
    todayTrades: "Trades de hoy",
    none: "Aún no registras trades hoy.",
  },
  en: {
    title: "Live Session",
    subtitle: "Your discipline copilot: it watches your plan and your prop firm rules while you trade.",
    account: "Account",
    float: "Open floating window",
    floatClose: "Close floating window",
    floatHint: "Keep it on top of Tradovate, NinjaTrader or TradingView. Requires Chrome or Edge.",
    floatUnsupported: "Your browser doesn't support floating windows. Use desktop Chrome or Edge.",
    notify: "Enable alerts",
    notifyOn: "Alerts on",
    floating: "The copilot is open in the floating window.",
    todayTrades: "Today's trades",
    none: "No trades logged today yet.",
  },
} as const;

const TICK_MS = 15_000;
const REFRESH_MS = 60_000;

/** Pitido corto con WebAudio (sin archivos de audio) */
function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    osc.onended = () => void ctx.close();
  } catch {
    // Audio no disponible
  }
}

export function LiveSessionClient({ accounts, initialData, instruments }: LiveSessionClientProps) {
  const router = useRouter();
  const { locale: appLocale } = useI18n();
  const locale: LiveLocale = appLocale === "es" ? "es" : "en";
  const t = TEXT[locale];

  const [data, setData] = useState<LiveSessionData>(initialData);
  const [now, setNow] = useState<Date>(() => new Date());
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const notifiedRef = useRef<Set<string>>(new Set());
  const { pipWindow, isSupported, open, close } = useDocumentPip();

  useEffect(() => {
    setData(initialData);
    notifiedRef.current = new Set();
  }, [initialData]);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      setNotifyEnabled(true);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/live-session?account_id=${data.account.id}`, { cache: "no-store" });
      if (res.ok) setData((await res.json()) as LiveSessionData);
    } catch {
      // Se reintenta en el siguiente ciclo
    }
    setNow(new Date());
  }, [data.account.id]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), TICK_MS);
    const poll = setInterval(refresh, REFRESH_MS);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [refresh]);

  const summary = useMemo(() => evaluateDiscipline(data, now, locale), [data, now, locale]);

  // Avisos para alertas rojas nuevas
  useEffect(() => {
    const dangerIds = summary.alerts.filter((a) => a.level === "danger").map((a) => a.id);
    for (const alert of summary.alerts) {
      if (alert.level !== "danger" || notifiedRef.current.has(alert.id)) continue;
      notifiedRef.current.add(alert.id);
      beep();
      if (notifyEnabled && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(`Zentrade — ${alert.title}`, { body: alert.message, tag: alert.id });
      }
    }
    // Si una alerta desaparece, puede volver a notificarse en el futuro
    for (const id of Array.from(notifiedRef.current)) {
      if (!dangerIds.includes(id)) notifiedRef.current.delete(id);
    }
  }, [summary.alerts, notifyEnabled]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotifyEnabled(permission === "granted");
  }

  const lastSymbol = data.todayTrades.length > 0 ? data.todayTrades[data.todayTrades.length - 1].symbol : null;

  const panel = (compact: boolean) => (
    <CopilotPanel
      summary={summary}
      accountName={data.account.name}
      currency={data.currency}
      locale={locale}
      compact={compact}
    >
      <QuickTradeForm
        accountId={data.account.id}
        today={data.today}
        timezone={data.timezone}
        instruments={instruments}
        defaultSymbol={lastSymbol}
        locale={locale}
        onCreated={refresh}
      />
    </CopilotPanel>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
            <h1 className="text-3xl font-bold text-zen-anti-flash">{t.title}</h1>
            <span className="rounded-full border border-purple-500/50 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
              ZenMode
            </span>
          </div>
          <p className="mt-1 text-sm text-zen-anti-flash/60">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-zen-anti-flash/70">
            {t.account}
            <select
              className="rounded-md border border-zen-forest/60 bg-zen-surface px-2 py-1.5 text-sm text-zen-anti-flash"
              value={data.account.id}
              onChange={(e) => router.push(`/dashboard/live-session?account=${e.target.value}`)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={enableNotifications}
            className="flex items-center gap-1.5 rounded-md border border-zen-forest/60 px-3 py-1.5 text-sm text-zen-anti-flash/80 hover:bg-zen-forest/30"
          >
            {notifyEnabled ? <Bell className="h-4 w-4 text-emerald-400" /> : <BellOff className="h-4 w-4" />}
            {notifyEnabled ? t.notifyOn : t.notify}
          </button>
          <button
            type="button"
            disabled={!isSupported}
            onClick={() => (pipWindow ? close() : void open())}
            title={isSupported ? t.floatHint : t.floatUnsupported}
            className="flex items-center gap-1.5 rounded-md bg-zen-caribbean-green px-3 py-1.5 text-sm font-semibold text-zen-rich-black hover:opacity-90 disabled:opacity-40"
          >
            {pipWindow ? <X className="h-4 w-4" /> : <PictureInPicture2 className="h-4 w-4" />}
            {pipWindow ? t.floatClose : t.float}
          </button>
        </div>
      </div>

      {!isSupported && <p className="text-xs text-amber-400">{t.floatUnsupported}</p>}

      <div className="grid gap-6 md:grid-cols-[minmax(0,380px)_1fr]">
        <div className="rounded-xl border border-zen-forest/50 bg-zen-dark-green/40 p-4">
          {pipWindow ? <p className="text-sm text-zen-anti-flash/60">{t.floating}</p> : panel(false)}
        </div>

        <div className="rounded-xl border border-zen-forest/50 bg-zen-dark-green/40 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zen-anti-flash/60">
            {t.todayTrades}
          </h2>
          {data.todayTrades.length === 0 ? (
            <p className="text-sm text-zen-anti-flash/50">{t.none}</p>
          ) : (
            <ul className="divide-y divide-zen-forest/40">
              {[...data.todayTrades].reverse().map((tr) => (
                <li key={tr.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-zen-anti-flash/80">
                    {new Date(tr.createdAt).toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: data.timezone,
                    })}{" "}
                    · {tr.symbol} · {tr.side.toUpperCase()} ×{tr.contracts}
                    {!tr.followedPlan && <span className="ml-2 text-amber-400">⚠</span>}
                  </span>
                  <span className={`font-semibold ${tr.result >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {tr.result >= 0 ? "+" : ""}
                    {tr.result.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {pipWindow &&
        createPortal(
          <div className="min-h-screen bg-zen-rich-black text-zen-anti-flash">{panel(true)}</div>,
          pipWindow.document.body
        )}
    </div>
  );
}
