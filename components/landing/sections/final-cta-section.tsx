"use client";

import CTAButton from "@/components/landing/cta-button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function FinalCTASection() {
  const ctaPoints = [
    "Setup en menos de 2 minutos",
    "Import CSV automático incluido",
    "Exporta tu trading plan profesional",
    "Cancela cuando quieras, sin compromisos",
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-transparent via-zen-dark-green/30 to-zen-rich-black overflow-hidden">
      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zen-caribbean-green/10 via-zen-caribbean-green/5 to-transparent" />
      
      {/* Background Pattern */}
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
          {/* Main CTA Copy */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-zen-anti-flash leading-tight">
              ¿Listo Para Pasar Tu
              <br />
              <span className="text-zen-caribbean-green">Próxima Evaluación?</span>
            </h2>
            <p className="text-xl md:text-2xl text-zen-text-muted max-w-3xl mx-auto">
              Únete a cientos de traders que ya usan ZenTrade para
              profesionalizar su trading y obtener funded accounts.
            </p>
          </div>

          {/* CTA Points Grid */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {ctaPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-zen-surface rounded-xl px-6 py-4 border border-zen-border-soft"
              >
                <CheckCircle2 className="h-5 w-5 text-zen-caribbean-green flex-shrink-0" />
                <span className="text-zen-anti-flash font-medium">{point}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton size="lg" />
            <CTAButton variant="secondary" size="lg" />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-zen-text-muted">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
              <span>Free Trial Disponible</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-zen-border-soft" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
              <span>Sin Tarjeta de Crédito</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-zen-border-soft" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
              <span>Setup Instantáneo</span>
            </div>
          </div>

          {/* Final Nudge */}
          <div className="pt-8 border-t border-zen-border-soft">
            <p className="text-lg text-zen-anti-flash font-semibold flex items-center justify-center space-x-2">
              <span>El próximo funded trader podrías ser tú</span>
              <ArrowRight className="h-5 w-5 text-zen-caribbean-green" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
