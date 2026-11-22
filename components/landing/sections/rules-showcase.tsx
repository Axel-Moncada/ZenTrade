"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/context";
import { monoFont } from "@/components/landing/fonts";

// Paneles construidos en código que replican los widgets reales de la app con datos demo.
// Para usar capturas reales: reemplaza cada `panel` por <Image src="/landing/rules/*.webp" />.

type Locale = "en" | "es";

const COPY = {
  en: {
    title: "Every rule your prop firm checks. Live.",
    sub: "Know exactly where you stand before you click, not after the email arrives.",
    demo: "Demo data",
    zen: "ZenMode",
  },
  es: {
    title: "Cada regla que revisa tu prop firm. En vivo.",
    sub: "Sabe exactamente dónde estás antes de hacer clic, no cuando llega el email.",
    demo: "Datos demo",
    zen: "ZenMode",
  },
} as const;

interface Rule {
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  zenOnly?: boolean;
  panel: (l: Locale) => ReactNode;
}

const RULES: Rule[] = [
  {
    title: { en: "Trailing drawdown", es: "Trailing drawdown" },
    body: {
      en: "Your real floor moves with every new high. Zentrade recalculates it after every trade, so you always know how far you are from it.",
      es: "Tu piso real sube con cada nuevo máximo. Zentrade lo recalcula después de cada trade para que siempre sepas a cuánto estás.",
    },
    panel: (l) => <DrawdownPanel l={l} />,
  },
  {
    title: { en: "Consistency rule", es: "Regla de consistencia" },
    body: {
      en: "One big day can lock your payout. See your best day's share of profit against your firm's limit before you take the next trade.",
      es: "Un día enorme puede frenar tu payout. Mira qué porcentaje de tu ganancia es tu mejor día frente al límite de tu firma.",
    },
    panel: (l) => <ConsistencyPanel l={l} />,
  },
  {
    title: { en: "Revenge trades", es: "Trades de venganza" },
    body: {
      en: "Log a loss and the Live Copilot calls a 15-minute pause. Two losses in a row, it warns you the next trade is the dangerous one.",
      es: "Registras una pérdida y el Copiloto en vivo te pide 15 minutos de pausa. Con dos pérdidas seguidas, te avisa que el siguiente trade es el peligroso.",
    },
    zenOnly: true,
    panel: (l) => <CopilotPanel l={l} />,
  },
  {
    title: { en: "Session calendar", es: "Calendario de sesiones" },
    body: {
      en: "Spot the days where you give it back. Every session in one view, with revenge days flagged.",
      es: "Detecta los días en los que devuelves todo. Todas tus sesiones en una vista, con los días de venganza marcados.",
    },
    panel: (l) => <CalendarPanel l={l} />,
  },
];

export default function RulesShowcase() {
  const { locale } = useI18n();
  const c = COPY[locale];
  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    blockRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="rules" className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 md:py-24">
      <div className="mb-10 flex max-w-[760px] flex-col gap-3">
        <h2 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] text-zen-anti-flash md:text-[46px]">
          {c.title}
        </h2>
        <p className="text-[17px] leading-relaxed text-[#B8C2C4]">{c.sub}</p>
      </div>

      {/* Desktop: bloques que se activan con el scroll + panel sticky */}
      <div className="hidden gap-10 lg:flex">
        <div className="flex flex-[1_1_0] flex-col">
          {RULES.map((r, i) => (
            <div
              key={r.title.en}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              data-index={i}
              className="flex min-h-[460px] items-center"
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`flex w-full flex-col gap-2 rounded-2xl border p-6 text-left transition-colors duration-300 ${
                  active === i ? "border-zen-caribbean-green/45 bg-zen-caribbean-green/[0.08]" : "border-zen-anti-flash/[0.08]"
                }`}
              >
                <RuleTitle rule={r} locale={locale} zenLabel={c.zen} dim={active !== i} />
                <span className="text-base leading-relaxed text-[#B8C2C4]">{r.body[locale]}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex-[1.6_1_0]">
          <div className="sticky top-[15vh]">
            <BrowserFrame>
              <div className="relative aspect-[16/10]">
                {RULES.map((r, i) => (
                  <div
                    key={r.title.en}
                    aria-hidden={active !== i}
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      active === i ? "scale-100 opacity-100" : "pointer-events-none scale-[0.97] opacity-0"
                    }`}
                  >
                    {r.panel(locale)}
                  </div>
                ))}
              </div>
            </BrowserFrame>
            <p className="mt-2.5 text-xs text-[#6F8285]">{c.demo}</p>
          </div>
        </div>
      </div>

      {/* Móvil y tablet: tarjetas apiladas */}
      <div className="flex flex-col gap-8 lg:hidden">
        {RULES.map((r) => (
          <div key={r.title.en} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <RuleTitle rule={r} locale={locale} zenLabel={c.zen} />
              <p className="text-base leading-relaxed text-[#B8C2C4]">{r.body[locale]}</p>
            </div>
            <BrowserFrame>
              <div className="relative aspect-[4/3] sm:aspect-[16/10]">{r.panel(locale)}</div>
            </BrowserFrame>
          </div>
        ))}
        <p className="text-xs text-[#6F8285]">{c.demo}</p>
      </div>
    </section>
  );
}

function RuleTitle({ rule, locale, zenLabel, dim = false }: { rule: Rule; locale: Locale; zenLabel: string; dim?: boolean }) {
  return (
    <span className={`flex items-center gap-2 text-lg font-bold ${dim ? "text-[#D5DCDD]" : "text-zen-anti-flash"}`}>
      {rule.title[locale]}
      {rule.zenOnly && (
        <span className="rounded-full border border-[#F5A524]/40 px-2 py-0.5 text-[11px] font-semibold text-[#F5A524]">{zenLabel}</span>
      )}
    </span>
  );
}

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-zen-anti-flash/10 bg-zen-rich-black shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
      <div className="flex h-9 items-center gap-2 border-b border-zen-anti-flash/[0.08] bg-[#00262A] px-3.5">
        <span className="h-[11px] w-[11px] rounded-full bg-zen-danger/80" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#F5A524]/80" />
        <span className="h-[11px] w-[11px] rounded-full bg-zen-caribbean-green/80" />
        <span className="ml-3 text-[13px] text-[#8FA0A3]">zen-trader.com</span>
      </div>
      {children}
    </div>
  );
}

/* ───────────── Paneles demo ───────────── */

const panelBase = "absolute inset-0 flex flex-col gap-3 p-4 sm:p-6 text-zen-anti-flash";
const card = "rounded-xl border border-zen-anti-flash/[0.08] bg-[#00252A] p-3 sm:p-4";
const label = "text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-[#8FA0A3]";

function DrawdownPanel({ l }: { l: Locale }) {
  const t = l === "en"
    ? { acct: "Apex 50K · Evaluation", bal: "Balance", floor: "Liquidation floor", left: "Room to floor", curve: "Balance vs. trailing floor" }
    : { acct: "Apex 50K · Evaluación", bal: "Balance", floor: "Piso de liquidación", left: "Margen al piso", curve: "Balance vs. piso trailing" };
  return (
    <div className={panelBase}>
      <div className="text-sm font-semibold text-[#D5DCDD]">{t.acct}</div>
      <div className={`grid grid-cols-3 gap-2 sm:gap-3 ${monoFont.className}`}>
        <div className={card}><div className={`${label} font-sans`}>{t.bal}</div><div className="text-sm font-bold sm:text-xl">$51,240</div></div>
        <div className={card}><div className={`${label} font-sans`}>{t.floor}</div><div className="text-sm font-bold text-zen-danger sm:text-xl">$49,240</div></div>
        <div className={card}><div className={`${label} font-sans`}>{t.left}</div><div className="text-sm font-bold text-[#F5A524] sm:text-xl">$2,000</div></div>
      </div>
      <div className={`${card} flex flex-1 flex-col`}>
        <div className={label}>{t.curve}</div>
        <svg viewBox="0 0 400 140" className="mt-2 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0 110 L50 96 L100 100 L150 78 L200 70 L250 52 L300 58 L350 40 L400 34" fill="none" stroke="#00C17C" strokeWidth="3" />
          <path d="M0 140 H50 V126 H150 V108 H200 V100 H250 V82 H350 V70 H400" fill="none" stroke="#E5484D" strokeWidth="2" strokeDasharray="7 5" />
        </svg>
      </div>
    </div>
  );
}

function ConsistencyPanel({ l }: { l: Locale }) {
  const t = l === "en"
    ? { title: "Consistency rule", share: "Best day share of net profit", limit: "Firm limit 50%", days: "Daily P&L", note: "Best day $1,140 of $3,000 net profit" }
    : { title: "Regla de consistencia", share: "Peso del mejor día en la ganancia neta", limit: "Límite de la firma 50%", days: "P&L diario", note: "Mejor día $1,140 de $3,000 de ganancia neta" };
  const bars = [320, -150, 1140, 410, -220, 560, 380, 560];
  return (
    <div className={panelBase}>
      <div className="text-sm font-semibold text-[#D5DCDD]">{t.title}</div>
      <div className={card}>
        <div className="flex items-end justify-between">
          <div className={label}>{t.share}</div>
          <div className={`${monoFont.className} text-2xl font-bold text-[#F5A524] sm:text-3xl`}>38%</div>
        </div>
        <div className="relative mt-3 h-3 rounded-full bg-zen-anti-flash/10">
          <div className="h-3 rounded-full bg-[#F5A524]" style={{ width: "38%" }} />
          <div className="absolute -top-1 h-5 w-0.5 bg-zen-danger" style={{ left: "50%" }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[#8FA0A3]"><span>{t.note}</span><span className="text-zen-danger">{t.limit}</span></div>
      </div>
      <div className={`${card} flex flex-1 flex-col`}>
        <div className={label}>{t.days}</div>
        <div className="mt-2 flex flex-1 items-center gap-1.5 sm:gap-2">
          {bars.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-center">
              <div className="flex h-1/2 items-end">
                {v > 0 && <div className={`w-full rounded-t ${v === 1140 ? "bg-[#F5A524]" : "bg-zen-caribbean-green"}`} style={{ height: `${(v / 1140) * 100}%` }} />}
              </div>
              <div className="flex h-1/2 items-start">
                {v < 0 && <div className="w-full rounded-b bg-zen-danger" style={{ height: `${(-v / 1140) * 100}%` }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopilotPanel({ l }: { l: Locale }) {
  const t = l === "en"
    ? {
        title: "Live Session · Discipline Copilot",
        a1: ["Mandatory pause", "You just took a loss. Wait 12 min before re-entering — this is how you avoid revenge trading."],
        a2: ["2 losses in a row", "The next trade is the most dangerous one. Does it 100% match your plan?"],
        a3: ["Watch your drawdown", "$880 of drawdown left. Size down or stop."],
      }
    : {
        title: "Sesión en vivo · Copiloto de Disciplina",
        a1: ["Pausa obligatoria", "Acabas de perder. Espera 12 min antes de volver a entrar — así se evita el revenge trading."],
        a2: ["2 pérdidas seguidas", "El siguiente trade es el más peligroso. ¿Cumple 100% tu plan?"],
        a3: ["Cuidado con el drawdown", "Te quedan $880 de drawdown. Baja el tamaño o para."],
      };
  const alerts = [
    { a: t.a1, tone: "border-[#F5A524] text-[#F5A524]" },
    { a: t.a2, tone: "border-[#F5A524]/60 text-[#F5A524]" },
    { a: t.a3, tone: "border-zen-danger/70 text-zen-danger" },
  ];
  return (
    <div className={panelBase}>
      <div className="text-sm font-semibold text-[#D5DCDD]">{t.title}</div>
      {alerts.map(({ a, tone }) => (
        <div key={a[0]} className={`rounded-xl border-l-4 bg-[#00252A] p-3 sm:p-4 ${tone}`}>
          <div className="text-sm font-bold sm:text-base">{a[0]}</div>
          <div className="mt-1 text-xs leading-snug text-[#D5DCDD] sm:text-sm">{a[1]}</div>
        </div>
      ))}
    </div>
  );
}

function CalendarPanel({ l }: { l: Locale }) {
  const t = l === "en"
    ? { title: "November · Trade calendar", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], revenge: "Revenge" }
    : { title: "Noviembre · Calendario", days: ["Lun", "Mar", "Mié", "Jue", "Vie"], revenge: "Venganza" };
  const cells: (number | null)[] = [240, -180, 410, null, 320, 560, -90, 180, -1340, 270, 390, -120, 610, 150, 0, 220, -260, 480, 300, 170];
  return (
    <div className={panelBase}>
      <div className="text-sm font-semibold text-[#D5DCDD]">{t.title}</div>
      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] text-[#8FA0A3] sm:gap-2 sm:text-xs">
        {t.days.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className={`grid flex-1 grid-cols-5 gap-1.5 sm:gap-2 ${monoFont.className}`}>
        {cells.map((v, i) => {
          const revenge = v === -1340;
          const tone = v === null || v === 0
            ? "border-zen-anti-flash/[0.06] text-[#6F8285]"
            : v > 0
              ? "border-zen-caribbean-green/30 bg-zen-caribbean-green/10 text-zen-caribbean-green"
              : "border-zen-danger/30 bg-zen-danger/10 text-zen-danger";
          return (
            <div key={i} className={`relative flex flex-col items-center justify-center rounded-lg border text-[10px] font-bold sm:text-sm ${tone}`}>
              {v === null ? "—" : `${v < 0 ? "-" : v > 0 ? "+" : ""}$${Math.abs(v).toLocaleString("en-US")}`}
              {revenge && (
                <span className="mt-0.5 rounded-full bg-orange-500 px-1.5 font-sans text-[8px] font-bold uppercase text-white sm:text-[10px]">
                  {t.revenge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
