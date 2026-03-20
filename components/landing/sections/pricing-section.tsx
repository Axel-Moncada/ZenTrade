"use client";

import { useState } from "react";
import { Check, ArrowRight, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

type Interval = "monthly" | "annual";

export default function PricingSection() {
  const { t } = useI18n();
  const l = t.landing;
  const [interval, setInterval] = useState<Interval>("monthly");

  const isAnnual = interval === "annual";

  return (
    <section id="pricing" className="relative py-32 bg-gradient-to-b from-transparent via-zen-dark-green/20 to-transparent overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0, 193, 124, 0.08) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(0, 46, 33, 0.15) 0%, transparent 50%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-zen-surface border border-zen-caribbean-green/30 rounded-full px-4 py-2 mb-8">
            <span className="text-sm text-zen-caribbean-green font-medium">{l.pricingBadge}</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            {l.pricingTitle1}
            <br />
            <span className="text-zen-caribbean-green">{l.pricingTitle2}</span>
          </h2>
          <p className="text-lg md:text-xl text-zen-text-muted">{l.pricingSubtitle}</p>
        </div>

        {/* ── Coming soon wrapper — quitar cuando pagos estén activos ────────── */}
        <div className="relative">

          {/* Blur overlay — quitar este bloque cuando pagos estén activos */}
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-2xl"
            style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", background: "rgba(0,12,8,0.72)" }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zen-caribbean-green/40"
              style={{ background: "rgba(0,193,124,0.08)" }}
            >
              <Clock className="h-4 w-4 text-zen-caribbean-green" />
              <span className="text-sm font-semibold text-zen-caribbean-green">Muy pronto</span>
            </div>
            <p className="text-xl font-semibold text-zen-anti-flash text-center px-4">
              Los planes de pago llegan muy pronto
            </p>
            <p className="text-sm text-zen-text-muted text-center max-w-sm px-4">
              Por ahora disfruta Zentrade completamente gratis. Te avisaremos cuando los planes estén disponibles.
            </p>
            <Link href="/register">
              <Button className="bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold mt-1">
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* ── Billing toggle ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center mb-16">
          <div
            className="landing-billing-toggle relative flex items-center gap-1 rounded-full p-1.5"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Mensual */}
            <button
              onClick={() => setInterval("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                !isAnnual
                  ? "text-zen-rich-black"
                  : "text-zen-anti-flash/50 hover:text-zen-anti-flash/80"
              }`}
              style={!isAnnual ? { background: "#00C17C" } : undefined}
            >
              {l.pricingToggleMonthly}
            </button>

            {/* Anual */}
            <button
              onClick={() => setInterval("annual")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isAnnual
                  ? "text-zen-rich-black"
                  : "text-zen-anti-flash/50 hover:text-zen-anti-flash/80"
              }`}
              style={isAnnual ? { background: "#00C17C" } : undefined}
            >
              {l.pricingToggleAnnual}
              {/* Savings badge — siempre visible para generar curiosidad */}
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                  isAnnual
                    ? "bg-zen-rich-black/20 text-zen-rich-black"
                    : "bg-zen-caribbean-green/15 text-zen-caribbean-green"
                }`}
              >
                <Zap className="h-3 w-3" />
                {l.pricingAnnualBadge}
              </span>
            </button>
          </div>
        </div>

        {/* ── Cards — orden: ZenMode | Professional | Starter ─────────────────── */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {l.pricingTiers.map((tier, index) => {
            const isHighlighted = "highlight" in tier && tier.highlight;
            const isComingSoon  = "comingSoon" in tier && tier.comingSoon;
            const basePrice     = (tier as { price: number }).price ?? 0;
            const displayPrice  = isAnnual && "priceAnnual" in tier ? tier.priceAnnual : basePrice;
            const savingsAmount = "saveAnnual" in tier ? tier.saveAnnual : 0;
            const savingsPct    = basePrice > 0 ? Math.round((1 - ((displayPrice as number) / basePrice)) * 100) : 0;

            return (
              <div
                key={index}
                className={`relative group transition-all duration-300 ${isHighlighted ? "md:scale-105 md:shadow-2xl md:shadow-zen-caribbean-green/20" : ""}`}
              >
                <div
                  className={`relative h-full rounded-3xl border backdrop-blur-md transition-all duration-300 p-8 ${
                    isHighlighted
                      ? "bg-zen-surface/80 border-zen-caribbean-green/50 group-hover:border-zen-caribbean-green"
                      : isComingSoon
                        ? "bg-zen-surface/25 border-zen-border-soft/50"
                        : "bg-zen-surface/40 border-zen-border-soft group-hover:border-zen-caribbean-green/30"
                  }`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                        isComingSoon
                          ? "bg-zen-caribbean-green/8 text-zen-caribbean-green/60"
                          : isHighlighted
                            ? "bg-zen-caribbean-green/20 text-zen-caribbean-green"
                            : "bg-zen-caribbean-green/10 text-zen-caribbean-green"
                      }`}
                    >
                      {isComingSoon && <Clock className="h-3 w-3" />}
                      {tier.badge}
                    </div>
                  )}

                  {/* Name & description */}
                  <h3 className={`text-2xl font-bold mb-2 ${isComingSoon ? "text-zen-anti-flash/60" : "text-zen-anti-flash"}`}>
                    {tier.name}
                  </h3>
                  <p className="text-zen-text-muted text-sm mb-6">{tier.description}</p>

                  {/* ── Price block ──────────────────────────────────────────── */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl md:text-5xl font-bold transition-all duration-300 ${isComingSoon ? "text-zen-anti-flash/50" : "text-zen-anti-flash"}`}>
                        ${displayPrice}
                      </span>
                      <span className="text-zen-text-muted text-sm">
                        {isAnnual ? l.pricingAnnualNote : `/${tier.period}`}
                      </span>
                    </div>

                    {/* Ahorro anual — visible solo en modo anual para planes no coming-soon */}
                    {isAnnual && !isComingSoon && savingsPct > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className="landing-savings-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: "rgba(0,193,124,0.15)", color: "#00C17C" }}
                        >
                          <Zap className="h-3 w-3" />
                          {l.pricingAnnualSaveLabel} ${savingsAmount}{l.pricingAnnualSaveYear} · -{savingsPct}%
                        </span>
                      </div>
                    )}

                    {/* Texto de facturación */}
                    <p className="text-zen-text-muted text-xs mt-2">
                      {isAnnual ? l.pricingBillingAnnual : l.pricingBillingMonthly}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mb-8">
                    {isComingSoon ? (
                      <Button
                        disabled
                        className="w-full font-semibold cursor-not-allowed opacity-40 bg-zen-caribbean-green/10 text-zen-caribbean-green border border-zen-caribbean-green/20"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {tier.cta}
                      </Button>
                    ) : (
                      <Link href="/register">
                        <Button
                          className={`w-full group transition-all ${
                            isHighlighted
                              ? "bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold"
                              : "bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 text-zen-caribbean-green font-semibold border border-zen-caribbean-green/50 hover:border-zen-caribbean-green"
                          }`}
                        >
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="space-y-4 pt-8 border-t border-zen-border-soft">
                    {tier.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isComingSoon ? "text-zen-caribbean-green/40" : "text-zen-caribbean-green"}`} />
                        <span className={`text-sm leading-relaxed ${isComingSoon ? "text-zen-anti-flash/40" : "text-zen-anti-flash"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Glow solo para highlighted */}
                {isHighlighted && (
                  <div className="absolute inset-0 bg-zen-caribbean-green/5 rounded-3xl blur-xl -z-10 group-hover:blur-2xl transition-all" />
                )}
              </div>
            );
          })}
        </div>
        </div>{/* /coming-soon wrapper */}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto text-center pt-16 border-t border-zen-border-soft">
          <h3 className="text-2xl font-bold text-zen-anti-flash mb-6">{l.pricingFaqTitle}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {l.pricingFaq.map((item, i) => (
              <div key={i} className="bg-zen-surface/30 rounded-2xl p-6 border border-zen-border-soft hover:border-zen-caribbean-green/30 transition-colors">
                <h4 className="font-semibold text-zen-anti-flash mb-2">{item.title}</h4>
                <p className="text-zen-text-muted text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-2xl mx-auto mt-16 text-center bg-zen-caribbean-green/5 border border-zen-caribbean-green/20 rounded-2xl p-8">
          <p className="text-zen-anti-flash font-semibold mb-2">{l.pricingGuarantee}</p>
          <p className="text-zen-text-muted">{l.pricingGuaranteeDesc}</p>
        </div>
      </div>
    </section>
  );
}
