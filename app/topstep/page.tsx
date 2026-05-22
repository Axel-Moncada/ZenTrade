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
  title: "Best Trading Journal for TopStep Evaluations | Zentrade",
  description:
    "Zentrade tracks the TopStep 3% daily loss limit, 6% max drawdown and profit target in real time. The trading journal built for TopStep futures traders.",
  keywords: [
    "TopStep trading journal",
    "best journal for TopStep",
    "TopStep journal app",
    "TopStep evaluation tracker",
    "TopStep daily loss limit",
    "trading journal for TopStep",
    "how to pass TopStep",
    "TopStep prop firm journal",
  ],
  alternates: {
    canonical: `${SITE_URL}/topstep`,
    languages: { en: `${SITE_URL}/topstep`, es: `${SITE_URL}/es/topstep` },
  },
  openGraph: {
    title: "Best Trading Journal for TopStep | Zentrade",
    description:
      "Track your TopStep daily loss limit, drawdown and profit target in real time. Built for futures traders.",
    url: `${SITE_URL}/topstep`,
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zentrade for TopStep — AI Trading Journal",
    description:
      "Zentrade tracks the TopStep 3% daily loss limit, 6% max drawdown and profit target in real time. The best journal for TopStep futures evaluations.",
    url: `${SITE_URL}/topstep`,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "TopStep Journal", item: `${SITE_URL}/topstep` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best trading journal for TopStep?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade is the best journal for TopStep because it tracks the 3% daily loss limit and 6% max drawdown automatically. TopStep's strict daily loss rule is the most common reason traders fail evaluations, and Zentrade shows you your live daily P&L against that limit after every trade so you can stop trading before hitting it.",
        },
      },
      {
        "@type": "Question",
        name: "How does TopStep calculate the daily loss limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TopStep's daily loss limit is 3% of the account size — for example, $1,500 on a $50,000 account. It's measured from your starting balance for that trading day. Zentrade tracks your intraday P&L and alerts you when you're approaching the 3% threshold so you know to stop trading for the day.",
        },
      },
      {
        "@type": "Question",
        name: "Does TopStep have a consistency rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. TopStep does not have a consistency rule like FTMO. You just need to hit the 6% profit target while staying within the 6% max drawdown and 3% daily loss limit. There are also no minimum trading days required, which makes it possible to pass very quickly with a good setup.",
        },
      },
    ],
  },
];

const TOPSTEP_RULES = [
  { label: "Profit Target", value: "6%", note: "E.g. $3,000 on $50K account" },
  { label: "Max Drawdown", value: "6%", note: "From initial account balance (static)" },
  { label: "Daily Loss Limit", value: "3%", note: "Strictest daily rule among top prop firms" },
  { label: "Consistency Rule", value: "None", note: "No consistency requirement" },
  { label: "Min Trading Days", value: "None", note: "Pass as fast as you can" },
  { label: "Profit Split", value: "Up to 90%", note: "Funded account" },
];

const ZENTRADE_FEATURES = [
  "Daily P&L tracker with live 3% daily loss limit alert",
  "Static drawdown tracking from initial balance (6% floor)",
  "Profit target progress bar (6% goal)",
  "Equity curve with drawdown limit line",
  "Import trades from NinjaTrader, Rithmic, Tradovate via CSV",
  "Multi-account dashboard — evaluation and funded side by side",
];

const TOPSTEP_SLUGS = [
  "how-to-pass-topstep-evaluation",
  "como-pasar-topstep-evaluacion",
  "max-daily-loss-fondeo-how-to-manage",
  "max-daily-loss-como-respetar",
  "what-is-drawdown-trading",
  "que-es-drawdown-trading",
  "best-prop-firms-futures-traders-2025",
  "mejores-empresas-fondeo-futuros-2025",
];

export default async function TopStepPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => TOPSTEP_SLUGS.includes(p.slug));

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
          <span className="text-zen-anti-flash/80">TopStep</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Prop Firm Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            The trading journal built for{" "}
            <span className="text-zen-caribbean-green">TopStep</span>
          </h1>
          <p className="text-zen-text-muted text-xl max-w-2xl mx-auto mb-8">
            TopStep has the strictest daily loss limit in the prop firm industry — 3%.
            Zentrade shows your live P&L against that limit after every single trade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="zenGreen" size="lg" className="group">
                Start tracking TopStep for free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/blog/how-to-pass-topstep-evaluation">
              <Button variant="ghost" size="lg" className="text-zen-text-muted hover:text-zen-caribbean-green">
                Read the TopStep guide →
              </Button>
            </Link>
          </div>
        </div>

        {/* Rules */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">TopStep evaluation rules</h2>
          <p className="text-zen-text-muted mb-8">
            TopStep is one of the most beginner-friendly prop firms — no consistency rule, no min days —
            but the 3% daily loss limit is unforgiving.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPSTEP_RULES.map((rule) => (
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

        {/* Features */}
        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            What Zentrade tracks for your TopStep account
          </h2>
          <p className="text-zen-text-muted mb-8">
            The TopStep 3% daily loss limit is the evaluation killer. Zentrade puts a
            live counter in front of you so you never accidentally cross it.
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
            Why traders fail TopStep (and how to avoid it)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                bad: "Hit the 3% daily loss limit in the first hour of trading after a bad news event",
                good: "Daily P&L alert shows the exact dollar threshold for your account — you know when to walk away",
              },
              {
                bad: "Account is profitable overall but one bad day wipes the 6% drawdown buffer",
                good: "Equity curve with static drawdown line shows how much buffer you have left at all times",
              },
              {
                bad: "No minimum trading days creates a 'go big early' mentality that blows accounts fast",
                good: "Position size history and daily average help you trade consistently, not aggressively",
              },
              {
                bad: "Lose track of where the profit target and drawdown stand when trading across multiple sessions",
                good: "Dashboard shows profit target progress and drawdown used — updated after every trade logged",
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

        {/* TopStep guides */}
        {posts.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">TopStep guides</h2>
            <p className="text-zen-text-muted mb-8">
              Guides on the TopStep evaluation rules, daily loss limit management, and comparison with FTMO and Apex.
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
            Ready to pass your TopStep evaluation?
          </h2>
          <p className="text-zen-text-muted mb-8 max-w-xl mx-auto">
            Set up your TopStep account in Zentrade with your plan size. The 3% daily
            loss limit will be right in front of you — no surprises, no spreadsheets.
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
