import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ComparisonPage, type ComparisonFaq } from "@/components/vs/comparison-page";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade vs TradeZella (2026): Pricing and Features for Prop Firm Traders",
  description:
    "Zentrade vs TradeZella for futures traders in prop firm evaluations. Compare pricing ($0 free plan vs $35/mo), prop firm rule tracking and AI features.",
  keywords: [
    "Zentrade vs TradeZella",
    "TradeZella alternative",
    "TradeZella pricing",
    "cheaper TradeZella alternative",
    "prop firm trading journal",
    "best trading journal for prop firms",
  ],
  alternates: {
    canonical: `${SITE_URL}/vs/tradezella`,
    languages: {
      en: `${SITE_URL}/vs/tradezella`,
      es: `${SITE_URL}/es/vs/tradezella`,
      "x-default": `${SITE_URL}/vs/tradezella`,
    },
  },
  openGraph: {
    title: "Zentrade vs TradeZella — The Prop Firm Trader's Comparison",
    description:
      "Free plan, $9/mo paid plans and a journal built around prop firm rules. See how Zentrade compares to TradeZella.",
    type: "website",
    url: `${SITE_URL}/vs/tradezella`,
  },
};

const faq: ComparisonFaq[] = [
  {
    q: "Is Zentrade cheaper than TradeZella?",
    a: "Yes. Zentrade has a free-forever plan and paid plans at $9, $29 and $59 per month. TradeZella's plans are Essential at $35, Pro at $59 and Ultra at $99 per month (pricing effective July 14, 2026), with no free plan.",
  },
  {
    q: "Does Zentrade have a free plan?",
    a: "Yes. The Free plan includes 1 account, unlimited manual trade logging, a KPI dashboard and a monthly calendar, with no credit card required.",
  },
  {
    q: "Can I move my trades from TradeZella to Zentrade?",
    a: "Yes. Export your trades as CSV and import them on the Professional plan. Zentrade imports NinjaTrader, Rithmic and Tradovate files directly, and any other platform through the Zentrade CSV template.",
  },
  {
    q: "Which one is better for prop firm evaluations?",
    a: "Zentrade is built specifically for prop firm traders: each account tracks its daily loss limit, trailing drawdown and consistency rule, and the ZenMode Live Discipline Copilot warns you during your session before you break a rule.",
  },
  {
    q: "What if Zentrade isn't right for me?",
    a: "Start on the Free plan. On paid plans, you can email support@zen-trader.com within 7 days of your first payment to request a refund.",
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
        { "@type": "ListItem", position: 2, name: "Zentrade vs TradeZella", item: `${SITE_URL}/vs/tradezella` },
      ],
    },
  ],
};

export default async function VsTradezellaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ComparisonPage
      isAuthenticated={!!user}
      competitor="TradeZella"
      intro="Which trading journal helps you pass a prop firm evaluation, and which one costs less? A straight comparison for futures traders."
      verdict="If you trade futures and you're working through Apex, TopStep or FTMO evaluations, Zentrade gives you prop firm rule tracking for a fraction of the price, plus a free plan. If you trade many asset classes and want a large general-purpose journal, TradeZella is a solid established option."
      rows={[
        { label: "Free plan", zentrade: "Yes, free forever", competitor: "No" },
        { label: "Cheapest paid plan", zentrade: "$9/mo (Starter)", competitor: "$35/mo (Essential)" },
        { label: "Mid tier", zentrade: "$29/mo (Professional)", competitor: "$59/mo (Pro)" },
        { label: "Top tier", zentrade: "$59/mo (ZenMode)", competitor: "$99/mo (Ultra)" },
        { label: "Annual billing", zentrade: "$84 / $249 / $499 per year", competitor: "$315 / $531 / $891 per year" },
        { label: "Main focus", zentrade: "Futures traders in prop firm evaluations", competitor: "General-purpose journal for many markets" },
        { label: "Refunds", zentrade: "Request by email within 7 days of first payment", competitor: "See TradeZella's terms" },
      ]}
      sourceNote={{
        text: "TradeZella prices as listed in November 2026 (pricing effective July 14, 2026). Prices can change.",
        href: "https://www.tradezella.com/pricing",
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
        "trade futures (NQ, ES, GC, CL and micros) at a prop firm",
        "want to track your evaluation rules, not just your P&L",
        "want to start free and pay $9/mo, not $35/mo",
        "want alerts during your session, not only after it",
      ]}
      chooseCompetitor={[
        "trade stocks, options and crypto in the same journal",
        "already have years of history and workflows set up there",
        "want a large established community around your journal",
      ]}
      faq={faq}
      blogHref="/blog/zentrade-vs-tradezella-comparison"
      jsonLd={jsonLd}
    />
  );
}
