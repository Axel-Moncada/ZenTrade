import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ComparisonPage, type ComparisonFaq } from "@/components/vs/comparison-page";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade vs Tradervue (2026): Which Journal Is Better for Prop Firm Traders?",
  description:
    "Zentrade vs Tradervue for futures traders in prop firm evaluations. Compare free plans, paid pricing ($9/mo vs $29.95/mo), prop firm rule tracking and AI features.",
  keywords: ["Zentrade vs Tradervue", "Tradervue alternative", "Tradervue pricing", "free trading journal", "prop firm trading journal"],
  alternates: { canonical: `${SITE_URL}/vs/tradervue` },
  openGraph: {
    title: "Zentrade vs Tradervue — The Prop Firm Trader's Comparison",
    description: "Both have a free plan. See which one is built around prop firm evaluation rules.",
    type: "website",
    url: `${SITE_URL}/vs/tradervue`,
  },
};

const faq: ComparisonFaq[] = [
  {
    q: "Do Zentrade and Tradervue both have a free plan?",
    a: "Yes. Zentrade's Free plan includes 1 account and unlimited manual trade logging with no time limit. Tradervue's free plan caps the number of trades per month (as listed in November 2026); check tradervue.com for the current limit.",
  },
  {
    q: "How much do the paid plans cost?",
    a: "Zentrade's paid plans are $9, $29 and $59 per month. Tradervue's paid plans are Silver at $29.95 and Gold at $49.95 per month, with a 7-day free trial.",
  },
  {
    q: "Which is better for prop firm evaluations?",
    a: "Zentrade is built around prop firm rules: each account tracks its daily loss limit, trailing drawdown and consistency rule, and the ZenMode Live Discipline Copilot warns you during your session before you break a rule. Tradervue is a long-standing general trading journal.",
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
      mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Zentrade vs Tradervue", item: `${SITE_URL}/vs/tradervue` },
      ],
    },
  ],
};

export default async function VsTradervuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ComparisonPage
      isAuthenticated={!!user}
      competitor="Tradervue"
      intro="Tradervue is one of the original trading journals. Zentrade is built for futures traders working through prop firm evaluations. Here's how they compare."
      verdict="If you're working through Apex, TopStep or FTMO evaluations, Zentrade tracks the rules that decide your account, with a free plan that doesn't cap your trades. If you want a proven general journal with broker sync and a community trade-sharing feature, Tradervue is a well-established choice."
      rows={[
        { label: "Free plan", zentrade: "Yes: 1 account, unlimited manual trades", competitor: "Yes, with a monthly trade cap" },
        { label: "Cheapest paid plan", zentrade: "$9/mo (Starter)", competitor: "$29.95/mo (Silver)" },
        { label: "Next tier", zentrade: "$29/mo (Professional)", competitor: "$49.95/mo (Gold)" },
        { label: "AI tier", zentrade: "$59/mo (ZenMode)", competitor: "See Tradervue's plans" },
        { label: "Main focus", zentrade: "Futures traders in prop firm evaluations", competitor: "General journal, many markets" },
        { label: "Account sync", zentrade: "CSV import + manual logging (no live sync)", competitor: "Broker sync on paid plans" },
      ]}
      sourceNote={{ text: "Tradervue prices and free-plan limits as listed in November 2026. Prices can change.", href: "https://www.tradervue.com/plans" }}
      zentradeExtras={[
        "Separate evaluation and live accounts, each with its own rules",
        "Daily loss limit and trailing drawdown tracked per account",
        "Consistency rule check with the exact profit you still need",
        "Live Discipline Copilot: warnings during your session before you break a rule (ZenMode)",
        "Automatic revenge trading detection (ZenMode)",
        "Weekly AI performance report and Sunday Market Radar (ZenMode)",
        "CSV import from NinjaTrader, Rithmic and Tradovate (Professional)",
        "Free plan with no monthly trade cap",
      ]}
      chooseZentrade={[
        "trade futures at a prop firm and need to track evaluation rules",
        "want a free plan without a monthly trade cap",
        "want alerts during your session, not only after it",
      ]}
      chooseCompetitor={[
        "trade stocks and want a long-established general journal",
        "want automatic broker sync",
        "want to share trades with a community",
      ]}
      faq={faq}
      jsonLd={jsonLd}
    />
  );
}
