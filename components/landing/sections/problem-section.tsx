"use client";

import { AlertTriangle, Shuffle, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const ICONS = [AlertTriangle, Shuffle, RotateCcw];

export default function ProblemSection() {
  const { t } = useI18n();
  const l = t.landing;

  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/20 to-transparent">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zen-caribbean-green/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-6">
            {l.problemTitle}
          </h2>
          <p className="text-lg text-zen-text-muted">{l.problemSubtitle}</p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {l.problemPoints.map((pain, index) => {
            const Icon = ICONS[index];
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-zen-surface to-zen-surface/80 rounded-2xl p-8 border border-zen-border-soft hover:border-zen-caribbean-green/50 transition-all group backdrop-blur-sm"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zen-danger/10 rounded-xl flex items-center justify-center group-hover:bg-zen-danger/20 transition-colors">
                    <Icon className="h-6 w-6 text-zen-danger" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-zen-anti-flash mb-3">{pain.title}</h3>
                    <p className="text-zen-text-muted leading-relaxed">{pain.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emphasis Text */}
        <div className="mt-16 text-center">
          <p className="text-2xl text-zen-caribbean-green font-semibold">{l.problemEmphasis}</p>
        </div>
      </div>
    </section>
  );
}
