import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import CTAButton from "@/components/landing/cta-button";

export interface ComparisonRow {
  label: string;
  zentrade: string;
  competitor: string;
}

export interface ComparisonFaq {
  q: string;
  a: string;
}

export interface ComparisonPageProps {
  isAuthenticated: boolean;
  competitor: string;
  /** Texto corto del hero, debajo del título */
  intro: string;
  verdict: string;
  rows: ComparisonRow[];
  /** Fecha y fuente de los datos del competidor (transparencia) */
  sourceNote: { text: string; href: string };
  /** Lo que Zentrade agrega para traders de prop firms (sin afirmar lo que el otro no tiene) */
  zentradeExtras: string[];
  chooseZentrade: string[];
  chooseCompetitor: string[];
  faq: ComparisonFaq[];
  blogHref?: string;
  jsonLd: Record<string, unknown>;
}

/** Página comparativa "Zentrade vs X" en inglés (English-first). Solo datos verificables. */
export function ComparisonPage(props: ComparisonPageProps) {
  const { competitor } = props;
  return (
    <div className="min-h-screen bg-zen-rich-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(props.jsonLd) }} />
      <PublicNavbar isAuthenticated={props.isAuthenticated} />

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-16 px-6 lg:px-8 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(0,193,124,0.08) 0%, transparent 60%)" }}
          />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-zen-surface border border-zen-caribbean-green/20 rounded-full px-4 py-1.5 text-xs font-semibold text-zen-caribbean-green uppercase tracking-widest">
              2026 Comparison
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash leading-tight">
              Zentrade vs <span className="text-zen-caribbean-green">{competitor}</span>
            </h1>
            <p className="text-xl text-zen-anti-flash/70 max-w-2xl mx-auto leading-relaxed">{props.intro}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <CTAButton size="lg" />
              {props.blogHref && (
                <Link
                  href={props.blogHref}
                  className="text-sm text-zen-anti-flash/60 hover:text-zen-caribbean-green transition-colors flex items-center gap-1"
                >
                  Read the full breakdown <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Verdict ── */}
        <section className="px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Sparkles className="w-6 h-6 text-zen-caribbean-green shrink-0" />
            <p className="text-zen-anti-flash/80 text-sm leading-relaxed">
              <strong className="text-zen-anti-flash">Quick verdict:</strong> {props.verdict}
            </p>
          </div>
        </section>

        {/* ── Table ── */}
        <section className="px-6 lg:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-8 text-center">Side by side</h2>
            <div className="rounded-2xl border border-zen-border-soft overflow-hidden">
              <div className="grid grid-cols-3 bg-zen-surface-elevated border-b border-zen-border-soft">
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-anti-flash/50">Criteria</div>
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-caribbean-green border-l border-zen-border-soft text-center">
                  Zentrade
                </div>
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-anti-flash/50 border-l border-zen-border-soft text-center">
                  {competitor}
                </div>
              </div>
              {props.rows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 border-b border-zen-border-soft last:border-0 ${i % 2 === 0 ? "bg-zen-rich-black" : "bg-zen-surface/30"}`}
                >
                  <div className="p-4 text-sm text-zen-anti-flash/70 flex items-center">{row.label}</div>
                  <div className="p-4 text-sm border-l border-zen-border-soft text-zen-anti-flash font-medium flex items-center">{row.zentrade}</div>
                  <div className="p-4 text-sm border-l border-zen-border-soft text-zen-anti-flash/60 flex items-center">{row.competitor}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zen-anti-flash/40 text-center">
              {props.sourceNote.text}{" "}
              <a href={props.sourceNote.href} target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-zen-caribbean-green">
                Check their current pricing
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Zentrade extras ── */}
        <section className="px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-6 text-center">Built around prop firm rules</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {props.zentradeExtras.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-zen-caribbean-green/5 border border-zen-caribbean-green/20">
                  <CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />
                  <span className="text-sm text-zen-anti-flash">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who should pick which ── */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-6">
              <h3 className="font-bold text-zen-caribbean-green mb-4">Choose Zentrade if you...</h3>
              <ul className="space-y-2 text-sm text-zen-anti-flash/80">
                {props.chooseZentrade.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-6">
              <h3 className="font-bold text-zen-anti-flash/80 mb-4">Choose {competitor} if you...</h3>
              <ul className="space-y-2 text-sm text-zen-anti-flash/60">
                {props.chooseCompetitor.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-2xl mx-auto text-center space-y-4 bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold text-zen-anti-flash">Try Zentrade free</h2>
            <p className="text-zen-anti-flash/60 text-sm">
              Set up your evaluation account, log your trades and see your prop firm metrics in minutes. No credit card required.
            </p>
            <CTAButton size="lg" />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 lg:px-8 pb-24">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-8 text-center">FAQ</h2>
            <div className="space-y-4">
              {props.faq.map((item) => (
                <div key={item.q} className="bg-zen-surface border border-zen-border-soft rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zen-anti-flash mb-2">{item.q}</h3>
                  <p className="text-sm text-zen-anti-flash/60 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
