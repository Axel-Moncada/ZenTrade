import type { ReactNode } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import CTAButton from "@/components/landing/cta-button";

export interface ToolFaq {
  q: string;
  a: string;
}

interface ToolPageProps {
  isAuthenticated: boolean;
  badge: string;
  title: string;
  intro: string;
  calculator: ReactNode;
  /** Secciones explicativas (H2 en forma de pregunta + respuesta directa) */
  sections: { h: string; body: ReactNode }[];
  faq: ToolFaq[];
  related: { href: string; label: string }[];
  jsonLd: Record<string, unknown>;
}

/** Layout de las herramientas gratis (English-first, pensado para SEO/GEO). */
export function ToolPage(props: ToolPageProps) {
  return (
    <div className="min-h-screen bg-zen-rich-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(props.jsonLd) }} />
      <PublicNavbar isAuthenticated={props.isAuthenticated} />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-zen-caribbean-green/20 bg-zen-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zen-caribbean-green">
            {props.badge}
          </span>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-zen-anti-flash md:text-5xl">{props.title}</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zen-anti-flash/70">{props.intro}</p>
        </div>

        {props.calculator}

        <article className="mx-auto mt-16 max-w-3xl space-y-10">
          {props.sections.map((s) => (
            <section key={s.h}>
              <h2 className="mb-3 text-2xl font-bold text-zen-anti-flash">{s.h}</h2>
              <div className="space-y-3 leading-relaxed text-zen-anti-flash/75">{s.body}</div>
            </section>
          ))}

          <section>
            <h2 className="mb-4 text-2xl font-bold text-zen-anti-flash">FAQ</h2>
            <div className="space-y-4">
              {props.faq.map((f) => (
                <div key={f.q} className="rounded-xl border border-zen-border-soft bg-zen-surface p-5">
                  <h3 className="mb-2 text-sm font-semibold text-zen-anti-flash">{f.q}</h3>
                  <p className="text-sm leading-relaxed text-zen-anti-flash/65">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zen-border-soft bg-zen-surface p-6">
            <h2 className="mb-3 text-lg font-bold text-zen-anti-flash">Related guides and tools</h2>
            <ul className="space-y-2 text-sm">
              {props.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="text-zen-caribbean-green hover:underline">{r.label}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-10 text-center">
            <h2 className="text-2xl font-bold text-zen-anti-flash">Stop calculating by hand</h2>
            <p className="text-sm text-zen-anti-flash/60">
              Zentrade tracks your consistency rule, trailing drawdown and daily loss limit on every account automatically.
              Free plan forever, no credit card.
            </p>
            <CTAButton size="lg" />
          </section>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
