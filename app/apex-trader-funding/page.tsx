import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import { createClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Best Trading Journal for Apex Trader Funding",
  description:
    "Zentrade tracks the Apex Trader Funding trailing drawdown, daily loss limit and profit target in real time. The trading journal built for Apex futures evaluations.",
  keywords: [
    "Apex Trader Funding journal",
    "best journal for Apex Trader Funding",
    "Apex trailing drawdown tracker",
    "Apex evaluation journal",
    "Apex Trader Funding tracker",
    "trading journal for Apex",
    "how to pass Apex Trader Funding",
    "Apex prop firm journal",
  ],
  alternates: {
    canonical: `${SITE_URL}/apex-trader-funding`,
    languages: { en: `${SITE_URL}/apex-trader-funding`, es: `${SITE_URL}/es/apex-trader-funding` },
  },
  openGraph: {
    title: "Best Trading Journal for Apex Trader Funding",
    description:
      "Track your Apex trailing drawdown and daily loss limit in real time. Built for futures traders.",
    url: `${SITE_URL}/apex-trader-funding`,
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zentrade for Apex Trader Funding — AI Trading Journal",
    description:
      "Zentrade tracks the Apex Trader Funding trailing drawdown, daily loss limit, profit target and payout consistency rule. The trading journal built for Apex futures evaluations.",
    url: `${SITE_URL}/apex-trader-funding`,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Apex Trader Funding Journal", item: `${SITE_URL}/apex-trader-funding` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What should a trading journal track for Apex Trader Funding?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade tracks the Apex trailing drawdown per account: it updates your liquidation floor after every trade so you always know your real buffer, along with your daily P&L, your profit target progress and, on Performance Accounts, the 50% consistency rule for payouts.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Apex Trader Funding trailing drawdown work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "On a 50K Apex evaluation the trailing drawdown is $2,000, so the floor starts at $48,000 and rises with your highest balance. For example, if your balance peaks at $51,000, the floor moves to $49,000. Apex offers intraday and end-of-day versions, and where the drawdown stops trailing differs between evaluations and Performance Accounts, so check Apex's help center for your account.",
        },
      },
      {
        "@type": "Question",
        name: "Does Apex Trader Funding have a consistency rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not during the evaluation. On Performance Accounts, Apex applies a 50% consistency rule for payouts: your largest profitable day must be under 50% of your net profit since your last approved payout (updated March 2026; legacy accounts may still use 30%). Zentrade calculates this for you.",
        },
      },
    ],
  },
];

const APEX_RULES = [
  { label: "Profit Target", value: "$3,000", note: "50K evaluation" },
  { label: "Trailing Drawdown", value: "$2,000", note: "50K; intraday or end-of-day version" },
  { label: "Daily Loss Limit", value: "EOD only", note: "$1,000 on the 50K EOD evaluation; none on Intraday" },
  { label: "Consistency Rule", value: "50% (PA)", note: "None in the evaluation; 50% for payouts on Performance Accounts" },
  { label: "Min Trading Days", value: "None", note: "In the evaluation" },
  { label: "Time Limit", value: "30 days", note: "Per evaluation" },
];

const ZENTRADE_FEATURES = [
  "Trailing drawdown floor — recalculated live after every trade",
  "Daily P&L tracker with daily loss limit alert per account size",
  "Profit target progress bar ($3,000 on a 50K evaluation)",
  "Equity curve with trailing drawdown floor overlay",
  "Import trades from Rithmic, Tradovate, NinjaTrader via CSV",
  "50% consistency rule check before you request a payout",
  "Revenge trading detection (ZenMode)",
];

const APEX_SLUGS = [
  "how-to-pass-apex-trader-funding",
  "como-pasar-apex-trader-funding",
  "apex-trader-funding-trailing-drawdown-guia",
  "trailing-drawdown-ftmo-vs-apex-vs-topstep",
  "drawdown-trailing-vs-estatico-prop-firms",
  "what-is-drawdown-trading",
  "que-es-drawdown-trading",
  "best-prop-firms-futures-traders",
  "mejores-empresas-fondeo-futuros-2025",
];

export default async function ApexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => APEX_SLUGS.includes(p.slug));

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zen-anti-flash/50 mb-10">
          <Link href="/" className="hover:text-zen-caribbean-green transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zen-anti-flash/80">Apex Trader Funding</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Prop Firm Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            The trading journal built for{" "}
            <span className="text-zen-caribbean-green">Apex Trader Funding</span>
          </h1>
          <p className="text-zen-text-muted text-xl max-w-2xl mx-auto mb-8">
            Zentrade tracks the Apex trailing drawdown floor in real time — the metric
            that catches most traders off guard when their equity peaks and then retraces.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="zenGreen" size="lg" className="group">
                Start tracking Apex for free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/blog/how-to-pass-apex-trader-funding">
              <Button variant="ghost" size="lg" className="text-zen-text-muted hover:text-zen-caribbean-green">
                Read the Apex guide →
              </Button>
            </Link>
          </div>
        </div>

        {/* Apex rules */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Apex Trader Funding evaluation rules</h2>
          <p className="text-zen-text-muted mb-8">
            The rules that decide your Apex evaluation and payouts, and how Zentrade tracks each one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APEX_RULES.map((rule) => (
              <div
                key={rule.label}
                className="rounded-xl border border-zen-border-soft bg-zen-surface p-5"
              >
                <div className="text-2xl font-bold text-zen-caribbean-green mb-1">{rule.value}</div>
                <div className="text-sm font-semibold text-zen-anti-flash mb-1">{rule.label}</div>
                <div className="text-xs text-zen-text-muted">{rule.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zen-text-muted">
            Figures for the 50K account, last verified Nov 22, 2026 from Apex&apos;s help center and 2026 rule guides. Rules vary by
            account size, account type and purchase date, and firms change them often.{" "}
            <a href="https://support.apextraderfunding.com/hc/en-us" target="_blank" rel="noopener noreferrer nofollow" className="text-zen-caribbean-green hover:underline">
              Confirm the current rules with Apex
            </a>
            .
          </p>
        </section>

        {/* Features */}
        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            What Zentrade tracks for your Apex account
          </h2>
          <p className="text-zen-text-muted mb-8">
            The trailing drawdown is the hardest rule to track manually because it changes
            every time your equity hits a new high. Zentrade does it automatically.
          </p>
          <ul className="space-y-3">
            {ZENTRADE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-zen-caribbean-green shrink-0 mt-0.5" />
                <span className="text-zen-anti-flash/90 text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="zenGreen" className="group">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Why traders fail */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-6">
            Why traders fail Apex (and how to avoid it)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                bad: "Equity spikes to a new high, trailing floor moves up — then a normal retracement kills the account",
                good: "Zentrade shows the live trailing floor so you always know your real buffer, not just your current P&L",
              },
              {
                bad: "Hit the daily loss limit after a news event and fail without knowing the exact threshold for your account size",
                good: "Daily loss tracking against the exact dollar limit you set for your account",
              },
              {
                bad: "One oversized winning day breaks the 50% consistency rule and delays your first payout",
                good: "Zentrade shows your best day's share of profit and how much more you need before requesting a payout",
              },
              {
                bad: "Pass the evaluation but lose the funded account because trading habits change under pressure",
                good: "Same dashboard for evaluation and funded account — no behavior change required",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-zen-border-soft bg-zen-surface p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-zen-danger/70 shrink-0 mt-0.5" />
                  <p className="text-sm text-zen-anti-flash/60">{item.bad}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />
                  <p className="text-sm text-zen-anti-flash/90">{item.good}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Apex guides */}
        {posts.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Apex Trader Funding guides</h2>
            <p className="text-zen-text-muted mb-8">
              Guides on the Apex evaluation rules, trailing drawdown mechanics, and comparison with other prop firms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-xl border border-zen-border-soft bg-zen-surface hover:border-zen-caribbean-green/40 transition-colors p-5 group"
                >
                  <span className="text-xs font-semibold text-zen-caribbean-green uppercase tracking-wider">
                    {post.lang === "en" || post.author === "Zentrade Team" ? "EN" : "ES"}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-zen-anti-flash group-hover:text-zen-caribbean-green transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-zen-text-muted line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="rounded-2xl border border-zen-caribbean-green/30 bg-gradient-to-br from-zen-dark-green/40 to-zen-rich-black p-10 text-center">
          <h2 className="text-3xl font-bold text-zen-anti-flash mb-4">
            Ready to pass your Apex evaluation?
          </h2>
          <p className="text-zen-text-muted mb-8 max-w-xl mx-auto">
            Set up your Apex account in Zentrade with your plan size and limits.
            Every trade you log is automatically measured against Apex&apos;s trailing drawdown.
          </p>
          <Link href="/register">
            <Button variant="zenGreen" size="lg" className="group">
              Start free — no credit card required
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
