import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PricingSection from "@/components/landing/sections/pricing-section";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade Pricing — Free Trading Journal, Paid Plans from $9/mo",
  description:
    "Zentrade has a free-forever plan. Starter $9/mo, Professional $29/mo and ZenMode with AI $59/mo. No credit card required to start.",
  keywords: [
    "Zentrade pricing",
    "trading journal pricing",
    "free trading journal",
    "futures trading journal price",
    "prop firm trading journal",
    "Zentrade vs TradeZella price",
    "cheap trading journal",
  ],
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing | Zentrade — Trading Journal for Prop Firm Traders",
    description:
      "Free plan available. Paid plans from $9/mo with prop firm metrics, a full analytics dashboard and AI that catches revenge trading.",
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
};

const pricingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does Zentrade cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade has 4 plans: Free (free forever), Starter at $9/month, Professional at $29/month and ZenMode at $59/month. Annual plans are discounted: Starter $84/year, Professional $249/year and ZenMode $499/year. No credit card is required to start.",
      },
    },
    {
      "@type": "Question",
      name: "Does Zentrade have a free plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Free plan is free forever and includes 1 trading account, unlimited manual trade logging, a core KPI dashboard and a monthly calendar. It never expires and requires no credit card.",
      },
    },
    {
      "@type": "Question",
      name: "Is Zentrade cheaper than TradeZella?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade paid plans start at $9/month and there is a free-forever plan. Zentrade is built specifically for futures traders in prop firm evaluations, with a live discipline copilot, revenge trading detection and a weekly Market Radar.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my subscription at any time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, with no commitments or penalties. Cancel from your billing page at any time and keep access until the end of your paid period.",
      },
    },
    {
      "@type": "Question",
      name: "What does ZenMode add?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ZenMode adds the live discipline copilot (alerts before you break your daily loss, drawdown or trade limits), automatic revenge trading detection, ZenCoach AI, a weekly AI performance report and the Sunday Market Radar of high-impact events.",
      },
    },
  ],
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }}
      />

      <PublicNavbar isAuthenticated={!!user} />

      <main className="pt-20">
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-zen-caribbean-green font-semibold mb-3">
            Pricing
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-zen-anti-flash mb-4">
            Start free. Upgrade when you&apos;re ready.
          </h1>
          <p className="text-zen-anti-flash/60 text-lg max-w-xl mx-auto">
            No credit card required. No commitments. Cancel anytime.
          </p>
        </div>

        <PricingSection />
      </main>

      <PublicFooter />
    </div>
  );
}
