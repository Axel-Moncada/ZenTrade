"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingTier {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: 9,
    period: "USD/mes",
    description: "Perfecto para comenzar tu journal de trading",
    badge: "Ideal para Empezar",
    features: [
      "1 Cuenta de Trading",
      "Registro manual de trades",
      "Dashboard básico",
      "Métricas esenciales (Win Rate, PnL, Drawdown)",
      "Calendario de trades",
      "Soporte por email",
    ],
    cta: "Comenzar Ahora",
  },
  {
    name: "Professional",
    price: 29,
    period: "USD/mes",
    description: "Todo lo que necesitas para ser rentable y consistente",
    highlight: true,
    badge: "Lo Más Popular",
    features: [
      "3 Cuentas de trading (Apex, TopStep, Uprofit, Tradoverse, Personal)",
      "Import CSV automático (Rithmic, NinjaTrader, Tradoverse)",
      "Dashboard analítico completo con todos los KPIs",
      "Trading Plan digital exportable en PDF",
      "Calendario con notas y emociones",
      "Filtros avanzados por instrumento, sesión, setup",
      "Análisis de consistencia y profit factor",
      "Export CSV/PDF/Excel ilimitado",
      "Gráficas de equity curve y distribución",
      "Soporte prioritario",
    ],
    cta: "Probar Gratis 14 Días",
  },
  {
    name: "ZenMode",
    price: 59,
    period: "USD/mes",
    description: "El máximo nivel con IA y automatización",
    badge: "Próximamente",
    features: [
      "TODO en Professional +",
      "IA Coach: Análisis automático de tus errores",
      "Sugerencias personalizadas para mejorar",
      "Reportes semanales/mensuales por email",
      "Análisis predictivo de patrones",
      "Copy Trading entre cuentas (próximamente)",
      "Alertas inteligentes de performance",
      "Detección de revenge trading",
      "Soporte dedicado 24/7",
      "Coaching 1-a-1 mensual (30 min)",
    ],
    cta: "Próximamente",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 bg-gradient-to-b from-transparent via-zen-dark-green/20 to-transparent overflow-hidden">
      {/* Radial Gradient Glows */}
      <div className="absolute inset-0"
           style={{ 
             backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0, 193, 124, 0.08) 0%, transparent 50%)'
           }} 
      />
      <div className="absolute inset-0"
           style={{ 
             backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(0, 46, 33, 0.15) 0%, transparent 50%)'
           }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 bg-zen-surface border border-zen-caribbean-green/30 rounded-full px-4 py-2 mb-8">
            <span className="text-sm text-zen-caribbean-green font-medium">
              Precios Transparentes
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            Un Plan Para
            <br />
            <span className="text-zen-caribbean-green">Cada Trader</span>
          </h2>

          <p className="text-lg md:text-xl text-zen-text-muted">
            Sin sorpresas. Sin contratos de larga duración. Cancela cuando quieras.
            Todos los planes incluyen prueba gratis por 14 días.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative group transition-all duration-300 ${
                tier.highlight
                  ? "md:scale-105 md:shadow-2xl md:shadow-zen-caribbean-green/20"
                  : ""
              }`}
            >
              {/* Card Background */}
              <div
                className={`relative h-full rounded-3xl border backdrop-blur-md transition-all duration-300 ${
                  tier.highlight
                    ? "bg-zen-surface/80 border-zen-caribbean-green/50 group-hover:border-zen-caribbean-green"
                    : "bg-zen-surface/40 border-zen-border-soft group-hover:border-zen-caribbean-green/30"
                } p-8`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                      tier.highlight
                        ? "bg-zen-caribbean-green/20 text-zen-caribbean-green"
                        : "bg-zen-caribbean-green/10 text-zen-caribbean-green"
                    }`}
                  >
                    {tier.badge}
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-2xl font-bold text-zen-anti-flash mb-2">
                  {tier.name}
                </h3>

                {/* Description */}
                <p className="text-zen-text-muted text-sm mb-6">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-zen-anti-flash">
                      ${tier.price}
                    </span>
                    <span className="text-zen-text-muted text-sm">
                      {tier.period}
                    </span>
                  </div>
                  <p className="text-zen-text-muted text-xs mt-2">
                    Facturación mensual • Cancela cuando quieras
                  </p>
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  <Link href="/register">
                    <Button
                      className={`w-full group transition-all ${
                        tier.highlight
                          ? "bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold"
                          : "bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 text-zen-caribbean-green font-semibold border border-zen-caribbean-green/50 hover:border-zen-caribbean-green"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>

                {/* Features List */}
                <div className="space-y-4 pt-8 border-t border-zen-border-soft">
                  {tier.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-3 group/item"
                    >
                      <Check className="h-5 w-5 text-zen-caribbean-green flex-shrink-0 mt-0.5" />
                      <span className="text-zen-anti-flash text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glow effect para highlighted */}
              {tier.highlight && (
                <div className="absolute inset-0 bg-zen-caribbean-green/5 rounded-3xl blur-xl -z-10 group-hover:blur-2xl transition-all" />
              )}
            </div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="max-w-3xl mx-auto text-center pt-16 border-t border-zen-border-soft">
          <h3 className="text-2xl font-bold text-zen-anti-flash mb-6">
            ¿Preguntas sobre los planes?
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zen-surface/30 rounded-2xl p-6 border border-zen-border-soft hover:border-zen-caribbean-green/30 transition-colors">
              <h4 className="font-semibold text-zen-anti-flash mb-2">
                ¿Puedo cambiar de plan?
              </h4>
              <p className="text-zen-text-muted text-sm">
                Sí, actualiza o cambia de plan en cualquier momento. Los cambios se aplican en tu próximo ciclo de facturación.
              </p>
            </div>

            <div className="bg-zen-surface/30 rounded-2xl p-6 border border-zen-border-soft hover:border-zen-caribbean-green/30 transition-colors">
              <h4 className="font-semibold text-zen-anti-flash mb-2">
                ¿Hay período de prueba?
              </h4>
              <p className="text-zen-text-muted text-sm">
                14 días gratis en todos los planes. Sin tarjeta de crédito requerida.
              </p>
            </div>

            <div className="bg-zen-surface/30 rounded-2xl p-6 border border-zen-border-soft hover:border-zen-caribbean-green/30 transition-colors">
              <h4 className="font-semibold text-zen-anti-flash mb-2">
                ¿Qué incluye la prueba gratis?
              </h4>
              <p className="text-zen-text-muted text-sm">
                Acceso completo a Professional. Perfecto para probar todas las funcionalidades.
              </p>
            </div>

            <div className="bg-zen-surface/30 rounded-2xl p-6 border border-zen-border-soft hover:border-zen-caribbean-green/30 transition-colors">
              <h4 className="font-semibold text-zen-anti-flash mb-2">
                ¿Cómo funciona la IA en ZenMode?
              </h4>
              <p className="text-zen-text-muted text-sm">
                Analiza tus patrones de trading y te alerta sobre errores recurrentes, revenge trading y oportunidades de mejora.
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="max-w-2xl mx-auto mt-16 text-center bg-zen-caribbean-green/5 border border-zen-caribbean-green/20 rounded-2xl p-8">
          <p className="text-zen-anti-flash font-semibold mb-2">
            Garantía de Satisfacción
          </p>
          <p className="text-zen-text-muted">
            Si no te convence en los primeros 7 días, te devolvemos el 100% de tu dinero. Sin preguntas.
          </p>
        </div>
      </div>
    </section>
  );
}
