"use client";

import { features } from "@/data/landing/features";

export default function FeaturesSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/10 to-transparent">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-6">
            Todo Lo Que Necesitas Para
            <br />
            <span className="text-zen-caribbean-green">Trading Profesional</span>
          </h2>
          <p className="text-lg text-zen-text-muted">
            Herramientas diseñadas específicamente para traders que buscan pasar
            evaluaciones de prop firms y escalar su capital.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-zen-caribbean-green/0 to-zen-caribbean-green/0 group-hover:from-zen-caribbean-green/10 group-hover:to-zen-caribbean-green/5 transition-all" />

                {/* Border effect */}
                <div className="relative bg-zen-surface rounded-2xl p-8 border border-zen-border-soft group-hover:border-zen-caribbean-green/50 transition-all group-hover:shadow-2xl group-hover:shadow-zen-caribbean-green/10">
                  <div className="w-14 h-14 bg-zen-caribbean-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zen-caribbean-green/20 group-hover:scale-110 transition-all">
                    <Icon className="h-7 w-7 text-zen-caribbean-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-zen-anti-flash mb-3 group-hover:text-zen-caribbean-green transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-zen-text-muted leading-relaxed group-hover:text-zen-anti-flash/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl text-zen-anti-flash font-semibold mb-2">
            Integración Completa Con Tu Flujo de Trabajo
          </p>
          <p className="text-zen-text-muted">
            Compatible con NinjaTrader, MT5, TradingView, cTrader y más
          </p>
        </div>
      </div>
    </section>
  );
}
