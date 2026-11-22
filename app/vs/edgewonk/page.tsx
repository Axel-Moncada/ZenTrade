import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ComparisonPage, type ComparisonFaq } from "@/components/vs/comparison-page";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade vs Edgewonk (2026): Which Journal Is Better for Prop Firm Traders?",
  description:
    "Zentrade vs Edgewonk for futures traders in prop firm evaluations. Compare pricing (free plan vs ~$197/year), prop firm rule tracking and AI features.",
  keywords: [
    "Zentrade vs Edgewonk",
    "Edgewonk alternative",
    "Edgewonk pricing",
    "prop firm trading journal",
    "futures trading journal",
  ],
  alternates: {
    canonical: `${SITE_URL}/vs/edgewonk`,
    languages: {
      en: `${SITE_URL}/vs/edgewonk`,
      es: `${SITE_URL}/es/vs/edgewonk`,
      "x-default": `${SITE_URL}/vs/edgewonk`,
    },
  },
  openGraph: {
    title: "Zentrade vs Edgewonk — The Prop Firm Trader's Comparison",
    description:
      "A free plan, monthly plans from $9 and a journal built around prop firm rules. See how Zentrade compares to Edgewonk.",
    type: "website",
    url: `${SITE_URL}/vs/edgewonk`,
  },
};

const faq: ComparisonFaq[] = [
  {
    q: "How much does Edgewonk cost compared to Zentrade?",
    a: "Edgewonk sells one plan at about $197 per year, with no free plan. Zentrade has a free-forever plan and paid plans from $9 per month ($84 per year).",
  },
  {
    q: "Can I try Zentrade before paying?",
    a: "Yes. The Free plan is free forever and needs no credit card. On paid plans, you can email support@zen-trader.com within 7 days of your first payment to request a refund.",
  },
  {
    q: "Is Zentrade built for prop firm evaluations?",
    a: "Yes. Each account tracks its own daily loss limit, trailing drawdown and consistency rule, and the ZenMode Live Discipline Copilot warns you during your session before you break a rule.",
  },
  {
    q: "Can I import my trades into Zentrade?",
    a: "Yes, on the Professional plan: NinjaTrader, Rithmic and Tradovate files import directly, and any other platform works through the Zentrade CSV template.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Zentrade vs Edgewonk", item: `${SITE_URL}/vs/edgewonk` },
      ],
    },
  ],
};

export default async function VsEdgewonkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ComparisonPage
      isAuthenticated={!!user}
      competitor="Edgewonk"
      intro="Edgewonk is a respected analytics journal. Zentrade is built around prop firm rules. Here's how they compare for futures traders working through evaluations."
      verdict="If your goal is passing Apex, TopStep or FTMO evaluations, Zentrade tracks the rules that decide your account and lets you start free. If you want a deep, general-purpose trading analytics tool and prefer one annual plan, Edgewonk is a well-known choice."
      rows={[
        { label: "Free plan", zentrade: "Yes, free forever", competitor: "No" },
        { label: "Pricing", zentrade: "$0 / $9 / $29 / $59 per month", competitor: "One plan, about $197/year" },
        { label: "Main focus", zentrade: "Futures traders in prop firm evaluations", competitor: "General trading analytics and psychology" },
        { label: "Refunds", zentrade: "Request by email within 7 days of first payment", competitor: "14-day money-back guarantee" },
      ]}
      sourceNote={{
        text: "Edgewonk pricing as listed in November 2026; taxes may apply. Prices can change.",
        href: "https://edgewonk.com/pricing",
      }}
      zentradeExtras={[
        "Separate evaluation and live accounts, each with its own rules",
        "Daily loss limit and trailing drawdown tracked per account",
        "Consistency rule check with the exact profit you still need",
        "Live Discipline Copilot: warnings during your session before you break a rule (ZenMode)",
        "Automatic revenge trading detection (ZenMode)",
        "Weekly AI performance report and Sunday Market Radar (ZenMode)",
        "CSV import from NinjaTrader, Rithmic and Tradovate (Professional)",
        "Payout tracker that checks the consistency rule before you withdraw",
      ]}
      chooseZentrade={[
        "trade futures at a prop firm and need to track evaluation rules",
        "want to start free and pay monthly",
        "want alerts during your session, not only after it",
      ]}
      chooseCompetitor={[
        "want one tool for many markets and deep custom analytics",
        "prefer paying once per year",
        "already have your history and setups built there",
      ]}
      faq={faq}
      jsonLd={jsonLd}
    />
  );
}
