"use client";

import { Sparkles, Radio, ShieldAlert, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const ICON_MAP = {
  report: Radio,
  radar: Sparkles,
  guard: ShieldAlert,
};

export default function AiFeaturesSection() {
  const { t } = useI18n();
  const l = t.landing;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zen-caribbean-green/5 to-transparent" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,193,124,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-zen-surface-elevated border border-zen-caribbean-green/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-zen-caribbean-green" />
            <span className="text-xs font-semibold text-zen-caribbean-green tracking-wider uppercase">
              {l.aiSectionBadge}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-6">
            {l.aiSectionTitle1}
            <br />
            <span className="text-zen-caribbean-green">{l.aiSectionTitle2}</span>
          </h2>
          <p className="text-lg text-zen-text-muted leading-relaxed">
            {l.aiSectionSubtitle}
          </p>
        </div>

        {/* AI Feature Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {l.aiFeatures.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon as keyof typeof ICON_MAP] ?? Sparkles;
            const isHighlight = feature.highlight;

            return (
              <div
                key={index}
                className={`relative rounded-2xl p-8 border transition-all duration-300 group ${
                  isHighlight
                    ? "bg-gradient-to-br from-zen-surface-elevated to-zen-dark-green border-zen-caribbean-green/50 shadow-xl shadow-zen-caribbean-green/10"
                    : "bg-zen-surface border-zen-border-soft hover:border-zen-caribbean-green/40"
                }`}
              >
                {/* Highlight indicator */}
                {isHighlight && (
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-zen-caribbean-green to-transparent" />
                )}

                {/* Badge */}
                <div className="mb-5">
                  <span
                    className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                      isHighlight
                        ? "bg-zen-caribbean-green/20 text-zen-caribbean-green border border-zen-caribbean-green/40"
                        : "bg-zen-surface-elevated text-zen-text-muted border border-zen-border-soft"
                    }`}
                  >
                    {feature.badge}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${
                    isHighlight
                      ? "bg-zen-caribbean-green/20"
                      : "bg-zen-caribbean-green/10 group-hover:bg-zen-caribbean-green/20"
                  }`}
                >
                  <Icon className="h-7 w-7 text-zen-caribbean-green" />
                </div>

                {/* Content */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    isHighlight ? "text-zen-caribbean-green" : "text-zen-anti-flash"
                  }`}
                >
                  {feature.title}
                </h3>
                <p className="text-zen-text-muted leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Highlight marker — for radar card, show sample events */}
                {isHighlight && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zen-text-muted">
                      <span className="w-2 h-2 rounded-full bg-zen-caribbean-green/60 shrink-0" />
                      FOMC Minutes · High volatility NQ/ES · Wed 2PM ET
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zen-text-muted">
                      <span className="w-2 h-2 rounded-full bg-amber-400/60 shrink-0" />
                      CPI Release · Watch GC and CL · Tue premarket
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zen-text-muted">
                      <span className="w-2 h-2 rounded-full bg-red-400/60 shrink-0" />
                      Geopolitical risk · Bullish GC, bearish ES
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA strip */}
        <div className="text-center bg-zen-surface-elevated border border-zen-border-soft rounded-2xl px-8 py-6">
          <p className="text-zen-anti-flash font-medium mb-4">{l.aiSectionCta}</p>
          <a href="#pricing">
            <button className="inline-flex items-center gap-2 bg-zen-caribbean-green text-zen-rich-black font-bold px-6 py-3 rounded-xl text-sm hover:brightness-110 transition-all">
              {l.aiSectionCtaButton}
              <ArrowRight className="h-4 w-4" />
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
