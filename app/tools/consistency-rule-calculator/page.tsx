import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ToolPage, type ToolFaq } from "@/components/tools/tool-page";
import { ConsistencyCalculator } from "@/components/tools/consistency-calculator";

const SITE_URL = "https://www.zen-trader.com";
const URL = `${SITE_URL}/tools/consistency-rule-calculator`;

export const metadata: Metadata = {
  title: "Prop Firm Consistency Rule Calculator (Free) — Apex, TopStep, FTMO",
  description:
    "Free consistency rule calculator for prop firm traders. Paste your daily P&L to see if your best day is under the limit and exactly how much more profit you need before a payout.",
  keywords: [
    "consistency rule calculator",
    "Apex consistency rule calculator",
    "prop firm consistency rule",
    "Apex 50% consistency rule",
    "consistency rule prop firm",
    "payout consistency calculator",
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: "Free Prop Firm Consistency Rule Calculator",
    description: "Check if your best day breaks the consistency rule and how much more profit you need.",
    type: "website",
    url: URL,
  },
};

const faq: ToolFaq[] = [
  {
    q: "What is the consistency rule in a prop firm?",
    a: "The consistency rule limits how much of your total net profit can come from a single day. If your best day is too large a share of your profit, your payout or pass is blocked until you earn more profit on other days.",
  },
  {
    q: "How do I calculate the consistency rule?",
    a: "Divide your best winning day by your total net profit. If the result is under your firm's threshold (for example 50%), you meet the rule. The minimum net profit you need is your best day divided by the threshold.",
  },
  {
    q: "What is Apex Trader Funding's consistency rule?",
    a: "Apex's help center describes a 50% consistency requirement for Performance Accounts, measured on net profit since your last approved payout, while legacy accounts bought before its March 2026 update may still use 30%. Confirm which rule applies to your account in Apex's help center.",
  },
  {
    q: "Does breaking the consistency rule fail my account?",
    a: "At most firms it does not fail the account; it delays the payout or the pass until your profit is spread more evenly. Check your firm's terms, because rules differ by firm and program.",
  },
  {
    q: "Is this calculator free?",
    a: "Yes. It runs in your browser and does not store your numbers. Zentrade's free plan can also track the rule automatically from the trades you log.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Prop Firm Consistency Rule Calculator",
      url: URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Free tools", item: `${SITE_URL}/tools` },
        { "@type": "ListItem", position: 3, name: "Consistency Rule Calculator", item: URL },
      ],
    },
  ],
};

export default async function ConsistencyToolPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ToolPage
      isAuthenticated={!!user}
      badge="Free tool"
      title="Prop Firm Consistency Rule Calculator"
      intro="Paste your daily P&L, pick your firm's threshold and see instantly whether your best day breaks the consistency rule, and how much more profit you need before your payout."
      calculator={<ConsistencyCalculator />}
      sections={[
        {
          h: "How does the consistency rule work?",
          body: (
            <>
              <p>
                <strong>The consistency rule caps how much of your total profit can come from one day.</strong> Prop firms use it
                so a single lucky session can&apos;t carry an evaluation or a payout. If your best day is above the threshold, you
                keep trading until the rest of your days catch up.
              </p>
              <p>
                Formula: <strong>best winning day ÷ total net profit</strong>. You meet the rule when that number is under your
                firm&apos;s threshold. Rearranged: <strong>minimum net profit = best day ÷ threshold</strong>.
              </p>
            </>
          ),
        },
        {
          h: "Example: does a $980 day block my payout?",
          body: (
            <p>
              Say your days were +$450, −$120, +$300, +$980, −$200 and +$250. Net profit is $1,660 and your best day is $980,
              which is 59% of your profit. Under a 50% rule you&apos;d need at least $1,960 in net profit ($980 ÷ 0.5), so you need
              $300 more without beating your $980 day. That&apos;s the example loaded in the calculator above.
            </p>
          ),
        },
        {
          h: "Which threshold should I use?",
          body: (
            <p>
              It depends on your firm, your program and when you bought the account. Apex&apos;s help center describes 50% for
              Performance Accounts since its March 2026 update, with 30% still used on legacy accounts. Other firms use different
              percentages or measure it per trade instead of per day. Always check the current terms of your own account.
            </p>
          ),
        },
      ]}
      faq={faq}
      related={[
        { href: "/blog/apex-consistency-rule-explained-2026", label: "Apex consistency rule explained (2026)" },
        { href: "/blog/consistency-rule-prop-firm-explained", label: "The consistency rule in prop firms, explained" },
        { href: "/tools/trailing-drawdown-calculator", label: "Free trailing drawdown calculator" },
        { href: "/apex-trader-funding", label: "Zentrade for Apex Trader Funding" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
