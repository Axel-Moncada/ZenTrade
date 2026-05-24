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
  title: "Mejor Journal de Trading para Apex Trader Funding",
  description:
    "Zentrade trackea el trailing drawdown de Apex Trader Funding, el límite de pérdida diaria y el profit target en tiempo real. El journal para evaluaciones de Apex.",
  keywords: [
    "journal para Apex Trader Funding",
    "mejor journal Apex Trader Funding",
    "tracker trailing drawdown Apex",
    "journal evaluación Apex",
    "app para Apex Trader Funding",
    "cómo pasar Apex Trader Funding",
    "journal prop firm Apex",
    "trailing drawdown Apex futuros",
  ],
  alternates: {
    canonical: `${SITE_URL}/es/apex-trader-funding`,
    languages: {
      en: `${SITE_URL}/apex-trader-funding`,
      es: `${SITE_URL}/es/apex-trader-funding`,
    },
  },
  openGraph: {
    title: "Mejor Journal para Apex Trader Funding | Zentrade",
    description:
      "Trackea el trailing drawdown y el límite de pérdida diaria de Apex en tiempo real. Diseñado para traders de futuros.",
    url: `${SITE_URL}/es/apex-trader-funding`,
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zentrade para Apex Trader Funding — Journal de Trading con IA",
    description:
      "Zentrade trackea el trailing drawdown de Apex Trader Funding, el límite de pérdida diaria y el profit target en tiempo real. El mejor journal para evaluaciones de Apex.",
    url: `${SITE_URL}/es/apex-trader-funding`,
    inLanguage: "es",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Journal para Apex Trader Funding", item: `${SITE_URL}/es/apex-trader-funding` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cuál es el mejor journal de trading para Apex Trader Funding?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade es el mejor journal para Apex Trader Funding porque trackea el mecanismo de trailing drawdown de forma nativa. A diferencia del drawdown estático de FTMO, Apex usa un trailing drawdown que sube junto con tu equity — Zentrade actualiza este valor en tiempo real para que siempre sepas cuál es tu margen real. También trackea el límite de pérdida diaria y el profit target para cada tamaño de cuenta de Apex.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo funciona el trailing drawdown de Apex Trader Funding?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El trailing drawdown de Apex comienza en un 6% por debajo del balance inicial y sube a medida que crece tu equity — pero nunca baja una vez que ha subido. Por ejemplo, en una cuenta de $50.000 el piso de drawdown empieza en $47.000. Si tu equity llega a $52.000, el piso del trailing drawdown sube a $49.000. Zentrade calcula y muestra este piso actualizado después de cada trade.",
        },
      },
      {
        "@type": "Question",
        name: "¿Apex Trader Funding tiene consistency rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Apex Trader Funding no tiene consistency rule, lo que es una de sus principales ventajas sobre FTMO. Puedes tener un día muy bueno sin que cuente en tu contra. Zentrade igual trackea tu performance diaria para que puedas identificar tus mejores días y replicarlos.",
        },
      },
    ],
  },
];

const APEX_RULES = [
  { label: "Profit Target", value: "9%", note: "Ej. $4.500 en cuenta de $50K" },
  { label: "Trailing Drawdown", value: "6%", note: "Sube con el equity, nunca baja" },
  { label: "Límite pérdida diaria", value: "Variable", note: "Desde $500 ($25K) hasta $4.500 ($300K)" },
  { label: "Consistency Rule", value: "No tiene", note: "Ventaja clave sobre FTMO" },
  { label: "Días mínimos", value: "No tiene", note: "Pasa a tu propio ritmo" },
  { label: "Reparto ganancias", value: "Hasta 90%", note: "Después del PA program" },
];

const ZENTRADE_FEATURES = [
  "Piso de trailing drawdown — recalculado en vivo después de cada trade",
  "Tracker de P&L diario con alerta de límite de pérdida diaria por tamaño de cuenta",
  "Barra de progreso hacia el profit target (objetivo 9%)",
  "Equity curve con línea del piso de trailing drawdown",
  "Import de trades desde Rithmic, Tradovate, NinjaTrader via CSV",
  "Detección de revenge trading — crítica en cuentas sin consistency rule",
];

const APEX_SLUGS = [
  "como-pasar-apex-trader-funding",
  "how-to-pass-apex-trader-funding",
  "apex-trader-funding-trailing-drawdown-guia",
  "drawdown-trailing-vs-estatico-prop-firms",
  "que-es-drawdown-trading",
  "what-is-drawdown-trading",
  "mejores-empresas-fondeo-futuros-2025",
  "best-prop-firms-futures-traders-2025",
];

export default async function ApexEsPage() {
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

        <nav className="flex items-center gap-1.5 text-xs text-zen-anti-flash/50 mb-10">
          <Link href="/" className="hover:text-zen-caribbean-green transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zen-anti-flash/80">Apex Trader Funding</span>
        </nav>

        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Journal para Prop Firms
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            El journal diseñado para{" "}
            <span className="text-zen-caribbean-green">Apex Trader Funding</span>
          </h1>
          <p className="text-zen-text-muted text-xl max-w-2xl mx-auto mb-8">
            Zentrade trackea el piso de trailing drawdown de Apex en tiempo real — la
            métrica que sorprende a la mayoría de traders cuando su equity sube y luego retrocede.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="zenGreen" size="lg" className="group">
                Empezar a trackear Apex gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/blog/como-pasar-apex-trader-funding">
              <Button variant="ghost" size="lg" className="text-zen-text-muted hover:text-zen-caribbean-green">
                Leer la guía de Apex →
              </Button>
            </Link>
          </div>
        </div>

        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Reglas de la evaluación de Apex Trader Funding</h2>
          <p className="text-zen-text-muted mb-8">
            Las reglas que determinan si pasas la evaluación de Apex — y cómo Zentrade trackea cada una.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APEX_RULES.map((rule) => (
              <div key={rule.label} className="rounded-xl border border-zen-border-soft bg-zen-surface p-5">
                <div className="text-2xl font-bold text-zen-caribbean-green mb-1">{rule.value}</div>
                <div className="text-sm font-semibold text-zen-anti-flash mb-1">{rule.label}</div>
                <div className="text-xs text-zen-text-muted">{rule.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            Qué trackea Zentrade en tu cuenta de Apex
          </h2>
          <p className="text-zen-text-muted mb-8">
            El trailing drawdown es la regla más difícil de trackear manualmente porque cambia
            cada vez que tu equity alcanza un nuevo máximo. Zentrade lo hace automáticamente.
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
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-6">
            Por qué los traders fallan Apex (y cómo evitarlo)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                bad: "El equity llega a un nuevo máximo, el piso sube — luego una retracción normal destruye la cuenta",
                good: "Zentrade muestra el piso de trailing drawdown en vivo para que siempre sepas tu margen real",
              },
              {
                bad: "Superan el límite de pérdida diaria después de un evento de noticias sin saber el umbral exacto de su tamaño de cuenta",
                good: "La alerta de pérdida diaria muestra el límite exacto en dólares para tu plan de Apex",
              },
              {
                bad: "La ausencia de consistency rule genera exceso de confianza — los traders toman riesgo exagerado en una racha ganadora",
                good: "El historial de tamaño de posición y la equity curve muestran cuándo estás desviándote de tu perfil de riesgo normal",
              },
              {
                bad: "Pasan la evaluación pero pierden la cuenta fondeada porque sus hábitos de trading cambian bajo presión",
                good: "Mismo dashboard para evaluación y cuenta fondeada — sin cambio de comportamiento requerido",
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

        {posts.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Guías sobre Apex Trader Funding</h2>
            <p className="text-zen-text-muted mb-8">
              Guías sobre las reglas de Apex, el trailing drawdown y comparativas con otras prop firms.
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

        <section className="rounded-2xl border border-zen-caribbean-green/30 bg-gradient-to-br from-zen-dark-green/40 to-zen-rich-black p-10 text-center">
          <h2 className="text-3xl font-bold text-zen-anti-flash mb-4">
            ¿Listo para pasar tu evaluación de Apex?
          </h2>
          <p className="text-zen-text-muted mb-8 max-w-xl mx-auto">
            Configura tu cuenta de Apex en Zentrade con el tamaño de tu plan. El trailing
            drawdown va a estar frente a tus ojos en tiempo real — sin sorpresas, sin Excel.
          </p>
          <Link href="/register">
            <Button variant="zenGreen" size="lg" className="group">
              Empezar gratis — sin tarjeta de crédito
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
