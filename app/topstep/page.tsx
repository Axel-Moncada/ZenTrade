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
  title: "Best Trading Journal for TopStep Evaluations",
  description:
    "Zentrade tracks the TopStep Maximum Loss Limit, daily loss limit, profit target and 55% consistency target. The trading journal built for TopStep futures traders.",
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
      "Zentrade tracks the TopStep Maximum Loss Limit, daily loss limit, profit target and consistency target. The trading journal built for TopStep evaluations.",
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
        name: "What should a trading journal track for TopStep?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade tracks TopStep's Maximum Loss Limit, your daily P&L and the 55% consistency target per account, updating after every trade so you know your real buffer before the next one.",
        },
      },
      {
        "@type": "Question",
        name: "How does TopStep calculate the daily loss limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "On the Trading Combine the Daily Loss Limit is optional: if you add it at checkout it is $1,000 on the 50K ($2,000 on 100K, $3,000 on 150K). Separately, the Maximum Loss Limit ($2,000 on the 50K) trails your end-of-day balance. Zentrade tracks your daily P&L against the limit you set. Check Topstep's help center for current terms.",
        },
      },
      {
        "@type": "Question",
        name: "Does TopStep have a consistency rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, a consistency target. On the Combine your best day should be no more than 55% of your total profit (updated September 2026). If it is higher, the Combine is not failed: your profit target rises to your best day divided by 0.55. Zentrade shows your best day's share of profit live.",
        },
      },
    ],
  },
];

const TOPSTEP_RULES = [
  { label: "Profit Target", value: "$3,000", note: "50K Trading Combine ($6,000 on 100K, $9,000 on 150K)" },
  { label: "Maximum Loss Limit", value: "$2,000", note: "50K; trails your end-of-day balance (floor starts at $48,000)" },
  { label: "Daily Loss Limit", value: "Optional", note: "$1,000 on the 50K if you add it at checkout" },
  { label: "Consistency Target", value: "55%", note: "Best day ≤ 55% of total profit, or your profit target rises" },
];

const ZENTRADE_FEATURES = [
  "Daily P&L tracker with your daily loss limit alert",
  "Trailing Maximum Loss Limit tracking (end-of-day)",
  "Profit target progress bar ($3,000 on the 50K Combine)",
  "55% consistency target check",
  "Equity curve with drawdown limit line",
  "Import trades from NinjaTrader, Rithmic, Tradovate via CSV",
  "Multi-account dashboard — evaluation and funded side by side",
];

const TOPSTEP_SLUGS = [
  "how-to-pass-topstep-evaluation",
  "como-pasar-topstep-evaluacion",
  "max-daily-loss-fondeo-how-to-manage",
  "max-daily-loss-como-respetar",
  "trailing-drawdown-ftmo-vs-apex-vs-topstep",
  "what-is-drawdown-trading",
  "que-es-drawdown-trading",
  "best-prop-firms-futures-traders",
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
            TopStep&apos;s Maximum Loss Limit trails your end-of-day balance, and the daily loss limit can end your day early.
            Zentrade shows your live P&L against both after every single trade.
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
            TopStep&apos;s rules are simple: one profit target, one Maximum Loss Limit and a 55% consistency target —
            but the trailing loss limit is unforgiving.
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
          <p className="mt-4 text-xs text-zen-text-muted">
            Figures for the 50K account, last verified Nov 22, 2026 from Topstep&apos;s help center and 2026 rule guides. Rules vary by
            account size, account type and purchase date, and firms change them often.{" "}
            <a href="https://help.topstep.com/" target="_blank" rel="noopener noreferrer nofollow" className="text-zen-caribbean-green hover:underline">
              Confirm the current rules with Topstep
            </a>
            .
          </p>
        </section>

        {/* Features */}
        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            What Zentrade tracks for your TopStep account
          </h2>
          <p className="text-zen-text-muted mb-8">
            Losing the Maximum Loss Limit buffer is the evaluation killer. Zentrade puts a
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
                bad: "Hit the daily loss limit in the first hour of trading after a bad news event",
                good: "Daily P&L alert shows the exact dollar threshold for your account — you know when to walk away",
              },
              {
                bad: "Account is profitable overall but one bad day wipes the $2,000 Maximum Loss Limit buffer",
                good: "Equity curve with the drawdown line shows how much buffer you have left at all times",
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
            Set up your TopStep account in Zentrade with your plan size. Your loss
            limits will be right in front of you — no surprises, no spreadsheets.
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
