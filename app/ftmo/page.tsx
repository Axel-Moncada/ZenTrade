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
  title: "Best Trading Journal for FTMO Evaluations | Zentrade",
  description:
    "Zentrade tracks every FTMO rule in real time: consistency score, 5% max daily loss, 10% trailing drawdown and profit target. Pass your FTMO evaluation with data, not luck.",
  keywords: [
    "FTMO trading journal",
    "FTMO journal app",
    "best journal for FTMO",
    "FTMO evaluation tracker",
    "FTMO consistency score",
    "FTMO drawdown tracker",
    "how to pass FTMO",
    "FTMO prop firm journal",
  ],
  alternates: {
    canonical: `${SITE_URL}/ftmo`,
    languages: { en: `${SITE_URL}/ftmo`, es: `${SITE_URL}/es/ftmo` },
  },
  openGraph: {
    title: "Best Trading Journal for FTMO | Zentrade",
    description:
      "Track your FTMO consistency score, daily loss and trailing drawdown in real time. Built for futures traders.",
    url: `${SITE_URL}/ftmo`,
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zentrade for FTMO — AI Trading Journal",
    description:
      "Zentrade tracks every FTMO evaluation rule in real time: consistency score, max daily loss, max drawdown and profit target. The best trading journal for FTMO futures traders.",
    url: `${SITE_URL}/ftmo`,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FTMO Journal", item: `${SITE_URL}/ftmo` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best trading journal for FTMO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade is the best trading journal for FTMO because it was built specifically for futures traders doing prop firm evaluations. It automatically tracks the consistency score (no day can exceed 30% of net profit), the 5% max daily loss, the 10% max overall drawdown, and your profit target progress — in real time. Unlike generic journals, Zentrade shows you exactly if you're at risk of failing the evaluation before it's too late.",
        },
      },
      {
        "@type": "Question",
        name: "Does Zentrade track the FTMO consistency rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Zentrade calculates the consistency score in real time: it shows what percentage of your net profit came from your best day. The FTMO rule requires that no single day exceeds 30% of total net profit. Zentrade alerts you when you're approaching this limit so you can adjust your trading for the rest of the evaluation.",
        },
      },
      {
        "@type": "Question",
        name: "How does FTMO calculate the max daily loss?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FTMO allows a maximum daily loss of 5% of the initial account balance (e.g., $5,000 on a $100,000 account). This is calculated from the balance at the start of each trading day. Zentrade tracks your daily P&L and shows you how much room you have left before hitting the daily loss limit.",
        },
      },
    ],
  },
];

const FTMO_RULES = [
  { label: "Profit Target (Phase 1)", value: "10%", note: "5% in Verification" },
  { label: "Max Daily Loss", value: "5%", note: "From start-of-day balance" },
  { label: "Max Overall Drawdown", value: "10%", note: "From initial capital (static)" },
  { label: "Consistency Rule", value: "30%", note: "No single day > 30% of net profit" },
  { label: "Min Trading Days", value: "4 days", note: "Both phases" },
  { label: "Profit Split", value: "Up to 90%", note: "After scaling plan" },
];

const ZENTRADE_FEATURES = [
  "Consistency score — live % of your best day vs. total net profit",
  "Daily P&L tracker with max daily loss alert",
  "Equity curve with static drawdown limit line",
  "Profit target progress bar per account",
  "Revenge trading detection (ZenMode)",
  "Import trades from NinjaTrader, Rithmic, Tradovate via CSV",
];

const FTMO_SLUGS = [
  "how-to-pass-ftmo-evaluation",
  "como-pasar-evaluacion-ftmo-journal-trading",
  "consistency-rule-prop-firm-explained",
  "regla-consistencia-ftmo-explicada",
  "max-daily-loss-fondeo-how-to-manage",
  "max-daily-loss-como-respetar",
  "what-is-drawdown-trading",
  "que-es-drawdown-trading",
  "pasos-evaluacion-ftmo",
  "ftmo-payout-reparto-ganancias",
  "ftmo-swing-account-vs-regular-cuando-elegir",
  "reglas-riesgo-ftmo-futuros-drawdown-consistency",
];

export default async function FtmoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => FTMO_SLUGS.includes(p.slug));

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
          <span className="text-zen-anti-flash/80">FTMO</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Prop Firm Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            The trading journal{" "}
            <span className="text-zen-caribbean-green">built for FTMO</span>
          </h1>
          <p className="text-zen-text-muted text-xl max-w-2xl mx-auto mb-8">
            Zentrade tracks your consistency score, max daily loss and trailing
            drawdown in real time — the exact metrics FTMO uses to evaluate you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="zenGreen" size="lg" className="group">
                Start tracking FTMO for free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/blog/how-to-pass-ftmo-evaluation">
              <Button variant="ghost" size="lg" className="text-zen-text-muted hover:text-zen-caribbean-green">
                Read the FTMO guide →
              </Button>
            </Link>
          </div>
        </div>

        {/* FTMO rules */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">FTMO evaluation rules</h2>
          <p className="text-zen-text-muted mb-8">
            Every rule FTMO will judge you on — and how Zentrade tracks each one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FTMO_RULES.map((rule) => (
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
        </section>

        {/* Zentrade features for FTMO */}
        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            What Zentrade tracks for your FTMO account
          </h2>
          <p className="text-zen-text-muted mb-8">
            Set up your FTMO account in Zentrade, enter your capital and limits,
            and every trade you log is automatically evaluated against FTMO's rules.
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

        {/* Why most traders fail FTMO */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-6">
            Why traders fail the FTMO evaluation (and how to avoid it)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                bad: "Reach the profit target but get rejected for consistency rule violation",
                good: "Zentrade shows your consistency score every day — you know before it's too late",
              },
              {
                bad: "Hit the 5% daily loss limit on a bad day and lose the entire evaluation",
                good: "Daily P&L alert tells you exactly how much room you have left today",
              },
              {
                bad: "Revenge trade after a loss and blow the drawdown in one session",
                good: "Revenge trading detection flags the pattern before you make it worse",
              },
              {
                bad: "Can't see if the evaluation is on track without manual spreadsheet math",
                good: "Dashboard shows profit target progress, drawdown used, and days remaining",
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

        {/* FTMO guides */}
        {posts.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">FTMO guides</h2>
            <p className="text-zen-text-muted mb-8">
              Everything you need to know to pass the FTMO Challenge and Verification.
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
            Ready to pass your FTMO evaluation?
          </h2>
          <p className="text-zen-text-muted mb-8 max-w-xl mx-auto">
            Create a free Zentrade account, set up your FTMO account with your capital
            and limits, and start trading with full visibility over every rule.
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
