import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ComparisonPage, type ComparisonFaq } from "@/components/vs/comparison-page";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade vs TraderSync (2026): Pricing and Features for Prop Firm Traders",
  description:
    "Zentrade vs TraderSync for futures traders in prop firm evaluations. Compare pricing (free plan vs $29.95/mo), prop firm rule tracking and AI features.",
  keywords: ["Zentrade vs TraderSync", "TraderSync alternative", "TraderSync pricing", "prop firm trading journal", "futures trading journal"],
  alternates: { canonical: `${SITE_URL}/vs/tradersync` },
  openGraph: {
    title: "Zentrade vs TraderSync — The Prop Firm Trader's Comparison",
    description: "A free plan, paid plans from $9/mo and a journal built around prop firm rules. See how Zentrade compares to TraderSync.",
    type: "website",
    url: `${SITE_URL}/vs/tradersync`,
  },
};

const faq: ComparisonFaq[] = [
  {
    q: "Is Zentrade cheaper than TraderSync?",
    a: "Yes. Zentrade has a free-forever plan and paid plans at $9, $29 and $59 per month. TraderSync's plans are Pro at $29.95, Premium at $49.95 and Elite at $79.95 per month, with a 7-day free trial and no free plan (as listed in November 2026).",
  },
  {
    q: "Which is better for prop firm evaluations?",
    a: "Zentrade is built around prop firm rules: each account tracks its daily loss limit, trailing drawdown and consistency rule, and the ZenMode Live Discipline Copilot warns you during your session before you break a rule. TraderSync is a broad journal for stocks, options, futures and crypto.",
  },
  {
    q: "Can I try Zentrade before paying?",
    a: "Yes. The Free plan is free forever with no credit card. On paid plans, you can email support@zen-trader.com within 7 days of your first payment to request a refund.",
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
        { "@type": "ListItem", position: 2, name: "Zentrade vs TraderSync", item: `${SITE_URL}/vs/tradersync` },
      ],
    },
  ],
};

export default async function VsTradersyncPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ComparisonPage
      isAuthenticated={!!user}
      competitor="TraderSync"
      intro="TraderSync is a feature-rich journal for every market. Zentrade is built for futures traders working through prop firm evaluations. Here's how they compare."
      verdict="If you trade futures at Apex, TopStep or FTMO and want your evaluation rules tracked, Zentrade costs less and lets you start free. If you trade stocks, options and crypto and want broker sync plus trade replay, TraderSync is a strong all-markets option."
      rows={[
        { label: "Free plan", zentrade: "Yes, free forever", competitor: "No (7-day free trial)" },
        { label: "Cheapest paid plan", zentrade: "$9/mo (Starter)", competitor: "$29.95/mo (Pro)" },
        { label: "Mid tier", zentrade: "$29/mo (Professional)", competitor: "$49.95/mo (Premium)" },
        { label: "Top tier", zentrade: "$59/mo (ZenMode)", competitor: "$79.95/mo (Elite)" },
        { label: "Main focus", zentrade: "Futures traders in prop firm evaluations", competitor: "Stocks, options, futures and crypto" },
        { label: "Account sync", zentrade: "CSV import + manual logging (no live sync)", competitor: "Broker sync" },
        { label: "Refunds", zentrade: "Request by email within 7 days of first payment", competitor: "See TraderSync's terms" },
      ]}
      sourceNote={{ text: "TraderSync monthly prices as listed in November 2026. Prices can change.", href: "https://tradersync.com/pricing/" }}
      zentradeExtras={[
        "Separate evaluation and live accounts, each with its own rules",
        "Daily loss limit and trailing drawdown tracked per account",
        "Consistency rule check with the exact profit you still need",
        "Live Discipline Copilot: warnings during your session before you break a rule (ZenMode)",
        "Automatic revenge trading detection (ZenMode)",
        "Weekly AI performance report and Sunday Market Radar (ZenMode)",
        "CSV import from NinjaTrader, Rithmic and Tradovate (Professional)",
        "A free plan you can keep forever",
      ]}
      chooseZentrade={[
        "trade futures at a prop firm and need to track evaluation rules",
        "want to start free and pay $9/mo, not $29.95/mo",
        "want alerts during your session, not only after it",
      ]}
      chooseCompetitor={[
        "trade stocks, options and crypto in one journal",
        "want automatic broker sync and trade replay",
        "need deep options analytics",
      ]}
      faq={faq}
      jsonLd={jsonLd}
    />
  );
}
