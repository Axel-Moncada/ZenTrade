import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, TrendingDown, FileSpreadsheet, ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Free Tools for Prop Firm Traders — Calculators and Journal Template",
  description:
    "Free tools for futures traders in prop firm evaluations: consistency rule calculator, trailing drawdown calculator and a free trading journal template.",
  alternates: { canonical: `${SITE_URL}/tools` },
};

const TOOLS = [
  {
    href: "/tools/consistency-rule-calculator",
    icon: Calculator,
    title: "Consistency Rule Calculator",
    desc: "Check if your best day breaks the consistency rule and how much more profit you need before a payout.",
  },
  {
    href: "/tools/trailing-drawdown-calculator",
    icon: TrendingDown,
    title: "Trailing Drawdown Calculator",
    desc: "See your liquidation floor and exactly how much room you have left on a trailing drawdown account.",
  },
  {
    href: "/trading-journal-template",
    icon: FileSpreadsheet,
    title: "Free Trading Journal Template",
    desc: "A free spreadsheet template to start journaling your trades today, built for futures and prop firm traders.",
  },
];

export default async function ToolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <PublicNavbar isAuthenticated={!!user} />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32 lg:px-8">
        <h1 className="mb-4 text-center text-4xl font-bold text-zen-anti-flash md:text-5xl">Free tools for prop firm traders</h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-zen-anti-flash/70">
          Calculators and templates for futures traders working through Apex, TopStep and FTMO evaluations. Free, no sign-up.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {TOOLS.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-zen-border-soft bg-zen-surface p-6 transition-colors hover:border-zen-caribbean-green/50"
            >
              <Icon className="mb-4 h-8 w-8 text-zen-caribbean-green" />
              <h2 className="mb-2 font-bold text-zen-anti-flash">{title}</h2>
              <p className="mb-4 text-sm text-zen-anti-flash/60">{desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-zen-caribbean-green">
                Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
