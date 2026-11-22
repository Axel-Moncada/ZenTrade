"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { track } from "@/lib/analytics/track";
import { monoFont } from "@/components/landing/fonts";
import { SIGNUP_HREF } from "@/components/landing/sections/replay-hero";

const ZENMODE_MONTHLY = 59; // fuente: components/shared/plan-features.tsx / pricing

const COPY = {
  en: {
    title: "How much have resets cost you this year?",
    sub: "Most failed evals don't come from a bad strategy. They come from one bad hour.",
    sub2: "Reset and eval prices vary by firm and account size. Enter what you actually paid.",
    resets: "Resets you paid",
    price: "Price per reset (USD)",
    lost: "Lost to resets",
    months: (n: number) => `That's ${n} ${n === 1 ? "month" : "months"} of ZenMode, the plan with the Live Copilot.`,
    zero: "Zero resets? Keep it that way.",
    cta: "Start free. Protect the next account.",
  },
  es: {
    title: "¿Cuánto te han costado los resets este año?",
    sub: "La mayoría de las evaluaciones perdidas no vienen de una mala estrategia. Vienen de una mala hora.",
    sub2: "El precio de los resets cambia según la firma y el tamaño de la cuenta. Pon lo que pagaste de verdad.",
    resets: "Resets que pagaste",
    price: "Precio por reset (USD)",
    lost: "Perdido en resets",
    months: (n: number) => `Eso son ${n} ${n === 1 ? "mes" : "meses"} de ZenMode, el plan con el Copiloto en vivo.`,
    zero: "¿Cero resets? Que siga así.",
    cta: "Empieza gratis. Protege la próxima cuenta.",
  },
} as const;

export default function ResetCalculator() {
  const { locale } = useI18n();
  const c = COPY[locale];
  const [resets, setResets] = useState(3);
  const [price, setPrice] = useState(99);
  const used = useRef(false);

  const markUsed = () => {
    if (used.current) return;
    used.current = true;
    track("calculator_used");
  };

  const lost = Math.max(0, resets * (Number.isFinite(price) ? price : 0));
  const months = Math.floor(lost / ZENMODE_MONTHLY);

  return (
    <section id="resets" className="border-y border-zen-anti-flash/[0.06] bg-[#00161A]">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-12 px-4 py-20 sm:px-6 md:py-[88px]">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <h2 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] text-zen-anti-flash md:text-[46px]">
            {c.title}
          </h2>
          <p className="text-[17px] leading-relaxed text-[#B8C2C4]">{c.sub}</p>
          <p className="text-sm text-[#8FA0A3]">{c.sub2}</p>
        </div>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5 rounded-[18px] border border-zen-anti-flash/10 bg-[#00252A] p-6 sm:p-7">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="zt-resets" className="flex justify-between text-[15px] font-semibold text-[#D5DCDD]">
              <span>{c.resets}</span>
              <span className={`${monoFont.className} text-zen-anti-flash`}>{resets}</span>
            </label>
            <input
              id="zt-resets"
              type="range"
              min={0}
              max={15}
              step={1}
              value={resets}
              onChange={(e) => {
                setResets(Number(e.target.value));
                markUsed();
              }}
              className="h-7 w-full accent-zen-caribbean-green"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="zt-price" className="text-[15px] font-semibold text-[#D5DCDD]">
              {c.price}
            </label>
            <input
              id="zt-price"
              type="number"
              inputMode="numeric"
              min={0}
              max={10000}
              step={1}
              value={Number.isFinite(price) ? price : ""}
              onChange={(e) => {
                const v = e.target.value === "" ? 0 : Number(e.target.value);
                setPrice(Math.min(10000, Math.max(0, v)));
                markUsed();
              }}
              className={`${monoFont.className} w-full rounded-[10px] border border-zen-anti-flash/20 bg-zen-rich-black px-3.5 py-3 text-lg text-zen-anti-flash focus:border-zen-caribbean-green focus:outline-none`}
            />
          </div>
          <div className="flex flex-col gap-1 border-t border-zen-anti-flash/10 pt-4">
            <div className="text-[13px] uppercase tracking-[0.08em] text-[#8FA0A3]">{c.lost}</div>
            <div
              className={`${monoFont.className} text-[44px] font-bold tracking-[-0.02em] text-zen-danger sm:text-[52px]`}
              aria-live="polite"
            >
              ${lost.toLocaleString("en-US")}
            </div>
            <div className="text-sm text-[#B8C2C4]">{lost === 0 ? c.zero : months >= 1 ? c.months(months) : null}</div>
          </div>
          <Link
            href={SIGNUP_HREF}
            onClick={() => track("cta_click", { section: "reset_calculator" })}
            className="rounded-xl bg-zen-caribbean-green p-4 text-center text-[17px] font-extrabold text-zen-rich-black transition hover:bg-[#3FE0A6]"
          >
            {c.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
