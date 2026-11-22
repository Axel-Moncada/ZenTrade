"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { track } from "@/lib/analytics/track";
import { SIGNUP_HREF } from "@/components/landing/sections/replay-hero";

const COPY = {
  en: {
    a: "Same trader. Same strategy.",
    b: "One alert.",
    sub: "Start your next eval with the rules on your screen, not in an email after you've already failed.",
    cta: "Start free",
    note: "No card required · Free plan forever · Upgrade only if it earns its keep",
  },
  es: {
    a: "Mismo trader. Misma estrategia.",
    b: "Una alerta.",
    sub: "Empieza tu próxima evaluación con las reglas en pantalla, no en un email cuando ya perdiste.",
    cta: "Empieza gratis",
    note: "Sin tarjeta · Plan gratis para siempre · Mejora de plan solo si te sirve",
  },
} as const;

export default function FinalCta() {
  const { locale } = useI18n();
  const c = COPY[locale];
  return (
    <section className="border-t border-zen-anti-flash/[0.06]">
      <div className="mx-auto flex max-w-[880px] flex-col items-center gap-5 px-4 pb-28 pt-24 text-center sm:px-6">
        <h2 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.035em] text-zen-anti-flash md:text-[54px]">
          {c.a} <span className="text-zen-caribbean-green">{c.b}</span>
        </h2>
        <p className="max-w-[600px] text-lg text-[#B8C2C4]">{c.sub}</p>
        <Link
          href={SIGNUP_HREF}
          onClick={() => track("cta_click", { section: "final_cta" })}
          className="rounded-xl bg-zen-caribbean-green px-9 py-4 text-lg font-extrabold text-zen-rich-black shadow-[0_0_40px_rgba(0,193,124,0.35)] transition hover:bg-[#3FE0A6]"
        >
          {c.cta}
        </Link>
        <span className="text-sm text-[#8FA0A3]">{c.note}</span>
      </div>
    </section>
  );
}
