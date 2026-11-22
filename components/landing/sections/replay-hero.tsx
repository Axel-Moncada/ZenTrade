"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { track } from "@/lib/analytics/track";
import { monoFont } from "@/components/landing/fonts";
import {
  ALERT_MINUTE,
  BREACH_MINUTE,
  END_SAVE_MINUTE,
  clockAt,
  computeFrame,
  formatPnl,
  formatUsd,
  type ReplayMode,
} from "@/components/landing/replay/replay-engine";

export const SIGNUP_HREF = "/login?mode=register";

const COPY = {
  en: {
    pill: "Built for Apex, Topstep & FTMO evals",
    h1a: "Your strategy didn't blow your eval.",
    h1b: "Your next trade did.",
    sub: "One loss. Then the revenge trade. Then another reset fee. Zentrade tracks your prop firm's rules on every trade, and the moment you log a loss, the Live Copilot tells you to stand down.",
    cta: "Start free",
    ctaNote: "No card required",
    planNote: "Live Copilot included in ZenMode",
    chips: ["Trailing drawdown", "Consistency rule", "Revenge alerts"],
    modeFail: "Without Zentrade · 50K eval · MNQ",
    modeSave: "With Zentrade · 50K eval · MNQ",
    time: "Time",
    dayPnl: "Day P&L",
    toFloor: "To floor",
    floorLabel: "Trailing drawdown floor",
    sOpen: "Session open. Following the plan.",
    sUp: "Up on the day. Plan working.",
    sStopped: "10:22 · Stopped out. Normal loss.",
    sRevenge: "Revenge entries. Size going up.",
    sPaused: "Copilot called a 15-min pause.",
    sNoRevenge: "No revenge trade taken.",
    sBreached: "Trailing drawdown breached.",
    cReplay: "Replay: a very familiar bad day.",
    cAfterLoss: "One loss. Then the trade after the loss.",
    cFailed: "Up $1,240 at 10:15. Gone by 10:38.",
    cSave: "Same day. Same trader. Now with Zentrade.",
    cSaved: "Same trader. Same strategy. One alert.",
    alertTag: "Discipline Copilot · 10:24",
    alertTitle: "Pause.",
    alertBody: (left: string) => `You just took a loss. Wait 15 min before re-entering. You're ${left} from your floor.`,
    failed: "EVAL FAILED",
    failedSub: "Floor breached at 10:38 · Time to pay for a reset",
    alive: "Account alive · Day closed +$1,060",
    replayBtn: "Replay this day with Zentrade",
    againBtn: "Watch the bad day again",
    chartLabel: "Replay of a trading day: profit climbs, then revenge trades break the trailing drawdown",
    disclaimer:
      "Illustrative replay with demo data (50K account, $2,000 trailing drawdown). The Copilot reacts to the trades you log in Zentrade. Futures trading involves substantial risk.",
  },
  es: {
    pill: "Hecho para evaluaciones de Apex, Topstep y FTMO",
    h1a: "Tu estrategia no quemó tu evaluación.",
    h1b: "Tu siguiente trade sí.",
    sub: "Una pérdida. Luego el trade de venganza. Luego otro reset. Zentrade sigue las reglas de tu prop firm en cada trade y, apenas registras una pérdida, el Copiloto en vivo te dice que pares.",
    cta: "Empieza gratis",
    ctaNote: "Sin tarjeta",
    planNote: "Copiloto en vivo incluido en ZenMode",
    chips: ["Trailing drawdown", "Regla de consistencia", "Alertas de revenge"],
    modeFail: "Sin Zentrade · Evaluación 50K · MNQ",
    modeSave: "Con Zentrade · Evaluación 50K · MNQ",
    time: "Hora",
    dayPnl: "P&L del día",
    toFloor: "Al piso",
    floorLabel: "Piso del trailing drawdown",
    sOpen: "Sesión abierta. Siguiendo el plan.",
    sUp: "En verde. El plan funciona.",
    sStopped: "10:22 · Stop. Pérdida normal.",
    sRevenge: "Entradas de venganza. Más tamaño.",
    sPaused: "El Copiloto pidió 15 min de pausa.",
    sNoRevenge: "Sin trade de venganza.",
    sBreached: "Trailing drawdown roto.",
    cReplay: "Replay: un mal día muy conocido.",
    cAfterLoss: "Una pérdida. Y luego el trade después de la pérdida.",
    cFailed: "+$1,240 a las 10:15. Todo perdido a las 10:38.",
    cSave: "Mismo día. Mismo trader. Ahora con Zentrade.",
    cSaved: "Mismo trader. Misma estrategia. Una alerta.",
    alertTag: "Copiloto de Disciplina · 10:24",
    alertTitle: "Pausa.",
    alertBody: (left: string) => `Acabas de perder. Espera 15 min antes de volver a entrar. Estás a ${left} de tu piso.`,
    failed: "EVALUACIÓN PERDIDA",
    failedSub: "Piso roto a las 10:38 · Toca pagar el reset",
    alive: "Cuenta viva · Día cerrado en +$1,060",
    replayBtn: "Repetir este día con Zentrade",
    againBtn: "Ver otra vez el mal día",
    chartLabel: "Replay de un día de trading: la ganancia sube y los trades de venganza rompen el trailing drawdown",
    disclaimer:
      "Replay ilustrativo con datos demo (cuenta 50K, trailing drawdown de $2,000). El Copiloto reacciona a los trades que registras en Zentrade. Operar futuros implica un riesgo considerable.",
  },
} as const;

interface Sim {
  mode: ReplayMode;
  m: number;
  hold: number;
  end: boolean;
  tick: number;
  alertShown: boolean;
  breachTick: number;
}

const START: Sim = { mode: "fail", m: 0, hold: 0, end: false, tick: 0, alertShown: false, breachTick: 0 };

function stepSim(s: Sim): Sim {
  const tick = s.tick + 1;
  if (s.hold > 0) {
    const hold = s.hold - 1;
    if (hold === 0 && s.end) {
      return { ...START, mode: s.mode === "fail" ? "save" : "fail", tick };
    }
    return { ...s, hold, tick };
  }
  let { m, end, hold, alertShown, breachTick } = s;
  m += m < 48 ? 0.6 : 0.2;
  if (s.mode === "fail" && m >= BREACH_MINUTE) {
    m = BREACH_MINUTE;
    end = true;
    hold = 150; // ~5 s y arranca el replay con Zentrade
    breachTick = tick;
  }
  if (s.mode === "save") {
    if (m >= ALERT_MINUTE && !alertShown) {
      alertShown = true;
      hold = 80; // ~2.7 s para leer la alerta
    }
    if (m >= END_SAVE_MINUTE) {
      m = END_SAVE_MINUTE;
      end = true;
      hold = 170;
    }
  }
  return { ...s, m, end, hold, tick, alertShown, breachTick };
}

export default function ReplayHero() {
  const { locale } = useI18n();
  const c = COPY[locale];
  const [sim, setSim] = useState<Sim>(START);
  const [reduced, setReduced] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) setSim({ ...START, m: BREACH_MINUTE, end: true, breachTick: -100 });
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      if (document.hidden || !inView.current) return;
      setSim(stepSim);
    }, 33);
    return () => window.clearInterval(id);
  }, [reduced]);

  const goSave = useCallback(() => {
    track("replay_save_started", { locale });
    setSim((s) =>
      reduced
        ? { ...START, mode: "save", m: END_SAVE_MINUTE, end: true, alertShown: true, tick: s.tick }
        : { ...START, mode: "save", tick: s.tick }
    );
  }, [locale, reduced]);

  const goFail = useCallback(() => {
    setSim((s) =>
      reduced ? { ...START, m: BREACH_MINUTE, end: true, tick: s.tick, breachTick: -100 } : { ...START, tick: s.tick }
    );
  }, [reduced]);

  const { mode, m, end, tick } = sim;
  const f = computeFrame(mode, m);
  const failedNow = mode === "fail" && end;
  const sinceBreach = failedNow ? tick - sim.breachTick : 99;
  const amp = !reduced && sinceBreach < 14 ? (14 - sinceBreach) * 1.2 : 0;
  const shake = amp
    ? `translate(${(Math.sin(tick * 7.3) * amp).toFixed(1)}px, ${(Math.cos(tick * 5.1) * amp).toFixed(1)}px)`
    : undefined;

  let status: string = c.sOpen;
  let statusColor = "text-zen-caribbean-green";
  if (m >= 40) status = c.sUp;
  if (m >= 52) {
    status = c.sStopped;
    statusColor = "text-[#F5A524]";
  }
  if (mode === "fail" && m >= ALERT_MINUTE) {
    status = c.sRevenge;
    statusColor = "text-zen-danger";
  }
  if (mode === "save" && m >= ALERT_MINUTE) {
    status = c.sPaused;
    statusColor = "text-[#F5A524]";
  }
  if (mode === "save" && m >= 60) {
    status = c.sNoRevenge;
    statusColor = "text-zen-caribbean-green";
  }
  if (failedNow) {
    status = c.sBreached;
    statusColor = "text-zen-danger";
  }

  let caption: string = c.cReplay;
  if (mode === "fail" && m >= ALERT_MINUTE) caption = c.cAfterLoss;
  if (failedNow) caption = c.cFailed;
  if (mode === "save") caption = end ? c.cSaved : c.cSave;

  const showAlert = mode === "save" && m >= ALERT_MINUTE && m < 75;
  const showAlive = mode === "save" && end;

  return (
    <section className="relative mx-auto flex max-w-[1240px] flex-wrap items-center gap-12 px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:pb-[72px]">
      {/* Texto */}
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#F5A524]/35 bg-[#F5A524]/[0.08] px-3 py-1.5 text-[13px] font-semibold text-[#F5A524]">
          {c.pill}
        </div>
        <h1 className="text-[40px] font-extrabold leading-[1.02] tracking-[-0.035em] text-zen-anti-flash sm:text-5xl lg:text-[64px]">
          {c.h1a} <span className="text-zen-danger">{c.h1b}</span>
        </h1>
        <p className="max-w-[520px] text-lg leading-relaxed text-[#B8C2C4] md:text-[19px]">{c.sub}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={SIGNUP_HREF}
            onClick={() => track("cta_click", { section: "hero" })}
            className="rounded-xl bg-zen-caribbean-green px-8 py-4 text-lg font-extrabold text-zen-rich-black shadow-[0_0_40px_rgba(0,193,124,0.35)] transition hover:bg-[#3FE0A6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zen-caribbean-green"
          >
            {c.cta}
          </Link>
          <div className="flex flex-col text-sm text-[#8FA0A3]">
            <span>{c.ctaNote}</span>
            <span className="text-xs">{c.planNote}</span>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2 pt-1 text-sm text-[#B8C2C4]">
          {c.chips.map((chip) => (
            <li key={chip} className="rounded-full border border-zen-anti-flash/10 px-3 py-1">
              {chip}
            </li>
          ))}
        </ul>
      </div>

      {/* Tarjeta del replay */}
      <div className="min-w-0 flex-[2_1_560px]">
        <div
          ref={cardRef}
          style={{ transform: shake }}
          className="relative overflow-hidden rounded-[20px] border border-zen-anti-flash/10 bg-[#00252A] p-4 shadow-[0_50px_120px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,193,124,0.06)] sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8FA0A3]">
                {mode === "fail" ? c.modeFail : c.modeSave}
              </div>
              <div className={`text-[15px] font-semibold ${statusColor}`} aria-live="polite">
                {status}
              </div>
            </div>
            <div className={`flex gap-4 sm:gap-6 ${monoFont.className}`}>
              <Stat label={c.time} value={clockAt(m)} />
              <Stat
                label={c.dayPnl}
                value={formatPnl(f.pnl)}
                color={f.pnl >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}
              />
              <Stat
                label={c.toFloor}
                value={formatUsd(f.toFloor)}
                color={f.toFloor < 1000 ? "text-zen-danger" : "text-zen-anti-flash"}
              />
            </div>
          </div>

          <div className="relative mt-3.5">
            <svg viewBox="0 0 640 340" className="block h-auto w-full" role="img" aria-label={c.chartLabel}>
              <line x1="40" x2="620" y1={f.zeroY} y2={f.zeroY} stroke="rgba(242,243,244,0.18)" strokeDasharray="3 5" />
              <text x="34" y={f.zeroY + 4} fill="#8FA0A3" fontSize="11" textAnchor="end">
                $0
              </text>
              <path d={f.floorPath} fill="none" stroke="#E5484D" strokeWidth="2" strokeDasharray="8 6" opacity="0.85" />
              <text x="44" y={f.floorLabelY} fill="#E5484D" fontSize="11" fontWeight="600">
                {c.floorLabel}
              </text>
              <path d={f.greenPath} fill="none" stroke="#00C17C" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
              {f.redPath && (
                <path d={f.redPath} fill="none" stroke="#E5484D" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
              )}
              {f.marks.map((mk) => (
                <g key={mk.label + mk.x}>
                  <circle cx={mk.x} cy={mk.y} r="5" fill="#E5484D" stroke="#00252A" strokeWidth="2" />
                  <text
                    x={mk.x}
                    y={mk.ty}
                    textAnchor="middle"
                    fill="#FF8A8E"
                    fontSize="12"
                    fontWeight="700"
                    className={monoFont.className}
                  >
                    {mk.label}
                  </text>
                </g>
              ))}
              <circle cx={f.headX} cy={f.headY} r="6" fill={f.headRed ? "#E5484D" : "#00C17C"} />
              <text x="40" y="334" fill="#8FA0A3" fontSize="11">
                9:30
              </text>
              <text x="330" y="334" fill="#8FA0A3" fontSize="11" textAnchor="middle">
                10:15
              </text>
              <text x="620" y="334" fill="#8FA0A3" fontSize="11" textAnchor="end">
                11:00
              </text>
            </svg>

            {showAlert && (
              <div className="absolute right-2 top-2 flex w-[min(300px,72%)] flex-col gap-1.5 rounded-[14px] border-[1.5px] border-[#F5A524] bg-zen-dark-green p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(245,165,36,0.25)] sm:p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#F5A524]">{c.alertTag}</div>
                <div className="text-lg font-extrabold text-zen-anti-flash sm:text-[22px]">{c.alertTitle}</div>
                <div className="text-[13px] leading-snug text-[#D5DCDD] sm:text-sm">{c.alertBody("$1,820")}</div>
              </div>
            )}

            {failedNow && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,20,23,0.55)]">
                <div className="-rotate-[5deg] rounded-xl border-4 border-zen-danger bg-zen-danger/[0.08] px-5 py-3 text-center text-zen-danger shadow-[0_0_60px_rgba(229,72,77,0.35)] sm:px-7">
                  <div className="text-[28px] font-black tracking-[0.02em] sm:text-[46px]">{c.failed}</div>
                  <div className="mt-1 text-xs font-semibold sm:text-[15px]">{c.failedSub}</div>
                </div>
              </div>
            )}

            {showAlive && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-zen-caribbean-green bg-zen-caribbean-green/10 px-4 py-2 text-sm font-extrabold text-zen-caribbean-green sm:px-6 sm:text-lg">
                {c.alive}
              </div>
            )}
          </div>

          <div className="mt-3 flex min-h-12 flex-wrap items-center justify-between gap-3">
            <div className="text-[15px] font-semibold text-[#D5DCDD]">{caption}</div>
            {failedNow && (
              <button
                type="button"
                onClick={goSave}
                className="rounded-[10px] bg-zen-caribbean-green px-5 py-3 text-[15px] font-extrabold text-zen-rich-black transition hover:bg-[#3FE0A6]"
              >
                {c.replayBtn}
              </button>
            )}
            {showAlive && (
              <button
                type="button"
                onClick={goFail}
                className="rounded-[10px] border border-zen-anti-flash/30 px-4 py-3 text-[15px] font-semibold text-zen-anti-flash transition hover:border-zen-anti-flash/60"
              >
                {c.againBtn}
              </button>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-xs text-[#6F8285]">{c.disclaimer}</p>
      </div>
    </section>
  );
}

function Stat({ label, value, color = "text-zen-anti-flash" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="font-sans text-[11px] uppercase tracking-[0.08em] text-[#8FA0A3]">{label}</div>
      <div className={`text-base font-bold sm:text-xl ${color}`}>{value}</div>
    </div>
  );
}
