"use client";

import { Brain, TrendingUp, Zap, Award, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { MIN_PUBLIC_TESTIMONIALS, type PublicTestimonial } from "@/lib/reviews/reviews";

const ICONS = [Brain, TrendingUp, Zap, Award];

interface BenefitsSectionProps {
  /** Testimonios reales aprobados (lib/reviews). Si hay suficientes, reemplazan a los de ejemplo. */
  realTestimonials?: PublicTestimonial[];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function BenefitsSection({ realTestimonials = [] }: BenefitsSectionProps) {
  const useReal = realTestimonials.length >= MIN_PUBLIC_TESTIMONIALS;
  const { t } = useI18n();
  const l = t.landing;

  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/20 to-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-zen-caribbean-green/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-6">
            {l.benefitsTitle1}
            <br />
            <span className="text-zen-caribbean-green">{l.benefitsTitle2}</span>
          </h2>
          <p className="text-lg text-zen-text-muted">{l.benefitsSubtitle}</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {l.benefitsList.map((benefit, index) => {
            const Icon = ICONS[index];
            return (
              <div key={index} className="relative bg-zen-surface rounded-2xl p-8 border border-zen-border-soft overflow-hidden group hover:border-zen-caribbean-green/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-zen-caribbean-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-zen-caribbean-green/10 rounded-2xl flex items-center justify-center group-hover:bg-zen-caribbean-green/20 transition-colors">
                    <Icon className="h-7 w-7 text-zen-caribbean-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-zen-anti-flash mb-3">{benefit.title}</h3>
                    <p className="text-zen-text-muted leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials Row */}
        {useReal ? (
          <div className="grid md:grid-cols-2 gap-8">
            {realTestimonials.slice(0, 4).map((review) => (
              <div
                key={review.id}
                className="bg-zen-surface-elevated rounded-2xl p-8 border border-zen-caribbean-green/30"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "fill-zen-caribbean-green text-zen-caribbean-green"
                          : "text-zen-caribbean-green/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-zen-anti-flash text-lg mb-4">“{review.testimonial}”</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-zen-caribbean-green/20 text-zen-caribbean-green font-bold flex items-center justify-center">
                    {initials(review.displayName)}
                  </div>
                  <div>
                    <p className="text-zen-anti-flash font-semibold">{review.displayName}</p>
                    {review.roleLabel && <p className="text-zen-text-muted text-sm">{review.roleLabel}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zen-surface-elevated rounded-2xl p-8 border border-zen-caribbean-green/30">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-zen-caribbean-green text-zen-caribbean-green" />)}
              </div>
              <p className="text-zen-anti-flash text-lg mb-4">{l.benefitsReview1}</p>
              <div className="flex items-center space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/80?img=12"
                  alt={l.benefitsReview1Author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-zen-anti-flash font-semibold">{l.benefitsReview1Author}</p>
                  <p className="text-zen-text-muted text-sm">{l.benefitsReview1Role}</p>
                </div>
              </div>
            </div>

            <div className="bg-zen-surface-elevated rounded-2xl p-8 border border-zen-caribbean-green/30">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-zen-caribbean-green text-zen-caribbean-green" />)}
              </div>
              <p className="text-zen-anti-flash text-lg mb-4">{l.benefitsReview2}</p>
              <div className="flex items-center space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.pravatar.cc/80?img=47"
                  alt={l.benefitsReview2Author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-zen-anti-flash font-semibold">{l.benefitsReview2Author}</p>
                  <p className="text-zen-text-muted text-sm">{l.benefitsReview2Role}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
