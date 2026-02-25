"use client";

import CTAButton from "@/components/landing/cta-button";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function FinalCTASection() {
  const { t } = useI18n();
  const l = t.landing;

  return (
    <section className="relative py-32 bg-gradient-to-b from-transparent via-zen-dark-green/30 to-zen-rich-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zen-caribbean-green/10 via-zen-caribbean-green/5 to-transparent" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 193, 124, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0, 193, 124, 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-zen-anti-flash leading-tight">
              {l.ctaSection1}
              <br />
              <span className="text-zen-caribbean-green">{l.ctaSection2}</span>
            </h2>
            <p className="text-xl md:text-2xl text-zen-text-muted max-w-3xl mx-auto">{l.ctaSectionSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {l.ctaSectionPoints.map((point, index) => (
              <div key={index} className="flex items-center space-x-3 bg-zen-surface rounded-xl px-6 py-4 border border-zen-border-soft">
                <CheckCircle2 className="h-5 w-5 text-zen-caribbean-green flex-shrink-0" />
                <span className="text-zen-anti-flash font-medium">{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton size="lg" />
            <CTAButton variant="secondary" size="lg" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-zen-text-muted">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
              <span>{l.ctaTrust1}</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-zen-border-soft" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
              <span>{l.ctaTrust2}</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-zen-border-soft" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
              <span>{l.ctaTrust3}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
