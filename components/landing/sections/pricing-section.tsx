"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export default function PricingSection() {
  const { t } = useI18n();
  const l = t.landing;

  return (
    <section id="pricing" className="relative py-32 bg-gradient-to-b from-transparent via-zen-dark-green/20 to-transparent overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0, 193, 124, 0.08) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(0, 46, 33, 0.15) 0%, transparent 50%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
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

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {l.pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative group transition-all duration-300 ${'highlight' in tier && tier.highlight ? 'md:scale-105 md:shadow-2xl md:shadow-zen-caribbean-green/20' : ''}`}
            >
              <div className={`relative h-full rounded-3xl border backdrop-blur-md transition-all duration-300 ${'highlight' in tier && tier.highlight ? 'bg-zen-surface/80 border-zen-caribbean-green/50 group-hover:border-zen-caribbean-green' : 'bg-zen-surface/40 border-zen-border-soft group-hover:border-zen-caribbean-green/30'} p-8`}>
                {tier.badge && (
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 ${'highlight' in tier && tier.highlight ? 'bg-zen-caribbean-green/20 text-zen-caribbean-green' : 'bg-zen-caribbean-green/10 text-zen-caribbean-green'}`}>
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-zen-anti-flash mb-2">{tier.name}</h3>
                <p className="text-zen-text-muted text-sm mb-6">{tier.description}</p>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-zen-anti-flash">${tier.price}</span>
                    <span className="text-zen-text-muted text-sm">{tier.period}</span>
                  </div>
                  <p className="text-zen-text-muted text-xs mt-2">{l.pricingBilling}</p>
                </div>
                <div className="mb-8">
                  <Link href="/register">
                    <Button className={`w-full group transition-all ${'highlight' in tier && tier.highlight ? 'bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold' : 'bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 text-zen-caribbean-green font-semibold border border-zen-caribbean-green/50 hover:border-zen-caribbean-green'}`}>
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4 pt-8 border-t border-zen-border-soft">
                  {tier.features.map((feature, fi) => (
                    <div key={fi} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-zen-caribbean-green flex-shrink-0 mt-0.5" />
                      <span className="text-zen-anti-flash text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              {'highlight' in tier && tier.highlight && (
                <div className="absolute inset-0 bg-zen-caribbean-green/5 rounded-3xl blur-xl -z-10 group-hover:blur-2xl transition-all" />
              )}
            </div>
          ))}
        </div>

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
