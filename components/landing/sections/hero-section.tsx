"use client";

import CTAButton from "@/components/landing/cta-button";
import { Sparkles, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function HeroSection() {
  const { t } = useI18n();
  const l = t.landing;
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background with Multiple Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zen-dark-green/30 to-zen-rich-black" />
      
      {/* Radial Gradient from Center */}
      <div className="absolute inset-0 bg-gradient-radial from-zen-caribbean-green/10 via-transparent to-transparent opacity-50" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at center, rgba(0, 193, 124, 0.1) 0%, transparent 50%)'
           }} 
      />
      
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 193, 124, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0, 193, 124, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-zen-surface-elevated border border-zen-caribbean-green/30 rounded-full px-4 py-2">
            <Sparkles className="h-4 w-4 text-zen-caribbean-green" />
            <span className="text-sm text-zen-caribbean-green font-medium">
              {l.heroBadge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-zen-anti-flash leading-tight">
            {l.heroHeadline1}
            <br />
            <span className="text-zen-caribbean-green">
              {l.heroHeadline2}
            </span>
          </h1>

          {/* Product descriptor — keyword-rich, above the fold para tráfico frío */}
          <p className="text-base md:text-lg text-zen-caribbean-green font-semibold tracking-wide -mt-2">
            {l.heroDescriptor}
          </p>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-zen-text-muted max-w-3xl mx-auto leading-relaxed">
            {l.heroSubPrefix}
            <span className="text-zen-anti-flash font-semibold">
              {l.heroSubHighlight}
            </span>
            {l.heroSubSuffix}
          </p>

          {/* Social Proof Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zen-text-muted">
            {[l.heroProof1, l.heroProof2, l.heroProof3, l.heroProof4].map((proof) => (
              <div key={proof} className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-zen-caribbean-green" />
                <span>{proof}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <CTAButton size="lg" />
            <a href="#pricing" className="w-full sm:w-auto">
              <button className="w-full border-zen-caribbean-green text-zen-caribbean-green hover:bg-zen-caribbean-green hover:text-zen-rich-black transition-all px-8 py-3 rounded-lg font-semibold border-2 group">
                {l.heroSeePlans}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 inline-block" />
              </button>
            </a>
          </div>

          {/* Microcopy under CTA */}
          {l.heroCtaMicrocopy && (
            <p className="text-xs text-zen-text-muted -mt-2">{l.heroCtaMicrocopy}</p>
          )}

          {/* Mini testimonial — social proof above the fold */}
          {l.heroMiniTestimonial && (
            <div className="mt-2 max-w-lg mx-auto bg-zen-surface-elevated border border-zen-caribbean-green/20 rounded-xl px-6 py-4">
              <p className="text-sm text-zen-anti-flash/80 italic leading-relaxed">{l.heroMiniTestimonial}</p>
              <p className="text-xs text-zen-caribbean-green font-medium mt-2">{l.heroMiniTestimonialAuthor}</p>
            </div>
          )}

          {/* Mini Stats */}
          <div className="flex items-center justify-center gap-12 pt-8 text-center">
            <div>
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-5 w-5 text-zen-caribbean-green" />
                <p className="text-3xl font-bold text-zen-anti-flash">{l.heroStat1Value}</p>
              </div>
              <p className="text-sm text-zen-text-muted mt-1">{l.heroStat1Label}</p>
            </div>
            <div className="h-12 w-px bg-zen-border-soft" />
            <div>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-5 w-5 text-zen-caribbean-green" />
                <p className="text-3xl font-bold text-zen-anti-flash">{l.heroStat2Value}</p>
              </div>
              <p className="text-sm text-zen-text-muted mt-1">{l.heroStat2Label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zen-rich-black to-transparent" />
    </section>
  );
}
