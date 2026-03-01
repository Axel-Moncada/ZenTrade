"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function FaqSection() {
  const { t } = useI18n();
  const l = t.landing;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section id="faq" className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/15 to-transparent">
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            {l.faqBadge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-4">
            {l.faqTitle1}{" "}
            <span className="text-zen-caribbean-green">{l.faqTitle2}</span>
          </h2>
          <p className="text-zen-text-muted">{l.faqSubtitle}</p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {l.faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-zen-caribbean-green/40 bg-zen-surface"
                    : "border-zen-border-soft bg-zen-surface hover:border-zen-caribbean-green/20"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                >
                  <span
                    className={`font-medium text-sm leading-snug transition-colors ${
                      isOpen ? "text-zen-caribbean-green" : "text-zen-anti-flash"
                    }`}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-zen-caribbean-green transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 border-t border-zen-caribbean-green/10">
                    <p className="text-zen-text-muted text-sm leading-relaxed pt-4">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <p className="text-center mt-10 text-zen-text-muted text-sm">
          {l.faqContact}
        </p>
      </div>
    </section>
  );
}
