import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ToolPage, type ToolFaq } from "@/components/tools/tool-page";
import { DrawdownCalculator } from "@/components/tools/drawdown-calculator";

const SITE_URL = "https://www.zen-trader.com";
const URL = `${SITE_URL}/tools/trailing-drawdown-calculator`;

export const metadata: Metadata = {
  title: "Trailing Drawdown Calculator (Free) — Apex, TopStep and Prop Firms",
  description:
    "Free trailing drawdown calculator for prop firm accounts. Enter your starting balance, max drawdown and highest balance to see your liquidation floor and how much room you have left.",
  keywords: [
    "trailing drawdown calculator",
    "Apex trailing drawdown calculator",
    "TopStep drawdown calculator",
    "prop firm drawdown calculator",
    "trailing threshold calculator",
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: "Free Trailing Drawdown Calculator for Prop Firm Traders",
    description: "See your liquidation floor and how much drawdown you have left.",
    type: "website",
    url: URL,
  },
};

const faq: ToolFaq[] = [
  {
    q: "What is a trailing drawdown?",
    a: "A trailing drawdown is a loss limit that moves up as your account balance makes new highs. Your liquidation floor is your highest balance minus the max drawdown, so profits raise the floor and losses don't lower it.",
  },
  {
    q: "How is trailing drawdown different from static drawdown?",
    a: "A static drawdown floor stays fixed at your starting balance minus the max drawdown. A trailing floor follows your highest balance, so the room you have left can shrink even when you're in profit.",
  },
  {
    q: "When does the trailing drawdown stop trailing?",
    a: "At many futures prop firms the floor stops rising once it reaches your starting balance (some lock it slightly above, such as starting balance plus $100). After that it behaves like a static floor. Check your firm's terms for the exact level.",
  },
  {
    q: "Does the trailing drawdown use open P&L?",
    a: "Some firms trail your intraday peak including unrealized profit, others only use closed trades or end-of-day balances. This calculator uses the highest balance you enter, so enter the peak your firm measures.",
  },
  {
    q: "Is this calculator free?",
    a: "Yes. It runs in your browser and does not store your numbers. Zentrade can also track your floor automatically on every account.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Trailing Drawdown Calculator",
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
        { "@type": "ListItem", position: 3, name: "Trailing Drawdown Calculator", item: URL },
      ],
    },
  ],
};

export default async function DrawdownToolPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ToolPage
      isAuthenticated={!!user}
      badge="Free tool"
      title="Trailing Drawdown Calculator"
      intro="Enter your account size, max drawdown and highest balance to see your liquidation floor and exactly how much room you have left before you lose the account."
      calculator={<DrawdownCalculator />}
      sections={[
        {
          h: "How do I calculate my trailing drawdown floor?",
          body: (
            <>
              <p>
                <strong>Floor = highest balance − max drawdown, capped at your starting balance.</strong> The room you have left is
                your current balance minus that floor.
              </p>
              <p>
                Example: a $50,000 account with a $2,500 trailing drawdown that peaked at $51,200 has a floor of $48,700. At a
                current balance of $50,400 you have $1,700 left, so you have already used 32% of your drawdown even though
                you&apos;re in profit. That&apos;s the example loaded above.
              </p>
            </>
          ),
        },
        {
          h: "Why do traders fail on trailing drawdown while in profit?",
          body: (
            <p>
              Because the floor follows your best balance, not your starting balance. A good morning raises the floor, and a
              normal pullback in the afternoon can hit it. Knowing your exact floor before each trade is what keeps a winning
              evaluation from turning into a failed one.
            </p>
          ),
        },
        {
          h: "Does every prop firm calculate it the same way?",
          body: (
            <p>
              No. Firms differ on whether they trail intraday open P&amp;L or closed balances, and on where the floor stops
              trailing. Use this calculator with the peak your firm actually measures, and confirm the details in your
              account&apos;s terms.
            </p>
          ),
        },
      ]}
      faq={faq}
      related={[
        { href: "/blog/trailing-drawdown-ftmo-vs-apex-vs-topstep", label: "Trailing drawdown: FTMO vs Apex vs TopStep" },
        { href: "/tools/consistency-rule-calculator", label: "Free consistency rule calculator" },
        { href: "/topstep", label: "Zentrade for TopStep" },
        { href: "/apex-trader-funding", label: "Zentrade for Apex Trader Funding" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
