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
  title: "Mejor Journal de Trading para Evaluaciones de FTMO | Zentrade",
  description:
    "Zentrade trackea en tiempo real cada regla de FTMO: consistency score, max daily loss 5%, trailing drawdown 10% y profit target. Pasa tu evaluación de FTMO con datos, no con suerte.",
  keywords: [
    "journal de trading para FTMO",
    "mejor journal FTMO",
    "app para evaluación FTMO",
    "tracker FTMO evaluación",
    "consistency score FTMO",
    "drawdown FTMO journal",
    "cómo pasar FTMO futuros",
    "journal prop firm FTMO",
  ],
  alternates: {
    canonical: `${SITE_URL}/es/ftmo`,
    languages: {
      en: `${SITE_URL}/ftmo`,
      es: `${SITE_URL}/es/ftmo`,
    },
  },
  openGraph: {
    title: "Mejor Journal de Trading para FTMO | Zentrade",
    description:
      "Trackea tu consistency score, max daily loss y drawdown de FTMO en tiempo real. Diseñado para traders de futuros.",
    url: `${SITE_URL}/es/ftmo`,
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zentrade para FTMO — Journal de Trading con IA",
    description:
      "Zentrade trackea en tiempo real cada regla de la evaluación de FTMO: consistency score, max daily loss, max drawdown y profit target. El mejor journal de trading para traders de futuros que quieren pasar FTMO.",
    url: `${SITE_URL}/es/ftmo`,
    inLanguage: "es",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Journal para FTMO", item: `${SITE_URL}/es/ftmo` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cuál es el mejor journal de trading para FTMO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade es el mejor journal de trading para FTMO porque fue diseñado específicamente para traders de futuros que hacen evaluaciones de prop firms. Calcula automáticamente el consistency score (ningún día puede superar el 30% de la ganancia neta), el max daily loss del 5%, el drawdown máximo del 10% y el progreso hacia el profit target, en tiempo real. A diferencia de los journals genéricos, Zentrade te avisa antes de que estés a punto de violar una regla.",
        },
      },
      {
        "@type": "Question",
        name: "¿Zentrade calcula el consistency score de FTMO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Zentrade calcula el consistency score en tiempo real: muestra qué porcentaje de tu ganancia neta total provino de tu mejor día. La regla de FTMO exige que ningún día individual supere el 30% de la ganancia neta total. Zentrade te alerta cuando te estás acercando a ese límite para que puedas ajustar tu operativa antes de que sea tarde.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo calcula FTMO el max daily loss?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FTMO permite una pérdida diaria máxima del 5% del balance inicial de la cuenta (por ejemplo, $5.000 en una cuenta de $100.000). Se calcula desde el balance al inicio de cada día de trading. Zentrade registra tu P&L diario y te muestra cuánto espacio te queda antes de llegar al límite diario.",
        },
      },
    ],
  },
];

const FTMO_RULES = [
  { label: "Profit Target (Fase 1)", value: "10%", note: "5% en Verificación" },
  { label: "Max Daily Loss", value: "5%", note: "Desde el balance de inicio del día" },
  { label: "Max Drawdown", value: "10%", note: "Desde el capital inicial (estático)" },
  { label: "Consistency Rule", value: "30%", note: "Ningún día > 30% de la ganancia neta" },
  { label: "Días mínimos", value: "4 días", note: "En ambas fases" },
  { label: "Reparto de ganancias", value: "Hasta 90%", note: "Con scaling plan" },
];

const ZENTRADE_FEATURES = [
  "Consistency score — porcentaje de tu mejor día sobre la ganancia neta total, en vivo",
  "Tracker de P&L diario con alerta de max daily loss",
  "Equity curve con línea de límite de drawdown estático",
  "Barra de progreso hacia el profit target por cuenta",
  "Detección de revenge trading (ZenMode)",
  "Import de trades desde NinjaTrader, Rithmic, Tradovate via CSV",
];

const FTMO_SLUGS = [
  "como-pasar-evaluacion-ftmo-journal-trading",
  "how-to-pass-ftmo-evaluation",
  "regla-consistencia-ftmo-explicada",
  "consistency-rule-prop-firm-explained",
  "max-daily-loss-como-respetar",
  "max-daily-loss-fondeo-how-to-manage",
  "que-es-drawdown-trading",
  "pasos-evaluacion-ftmo",
  "ftmo-payout-reparto-ganancias",
  "ftmo-swing-account-vs-regular-cuando-elegir",
  "reglas-riesgo-ftmo-futuros-drawdown-consistency",
];

export default async function FtmoEsPage() {
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
          <Link href="/" className="hover:text-zen-caribbean-green transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zen-anti-flash/80">FTMO</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Journal para Prop Firms
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            El journal de trading{" "}
            <span className="text-zen-caribbean-green">diseñado para FTMO</span>
          </h1>
          <p className="text-zen-text-muted text-xl max-w-2xl mx-auto mb-8">
            Zentrade trackea tu consistency score, max daily loss y trailing drawdown
            en tiempo real — las métricas exactas con las que FTMO te evalúa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="zenGreen" size="lg" className="group">
                Empezar a trackear FTMO gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/blog/como-pasar-evaluacion-ftmo-journal-trading">
              <Button variant="ghost" size="lg" className="text-zen-text-muted hover:text-zen-caribbean-green">
                Leer la guía de FTMO →
              </Button>
            </Link>
          </div>
        </div>

        {/* Reglas FTMO */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Reglas de la evaluación de FTMO</h2>
          <p className="text-zen-text-muted mb-8">
            Cada regla con la que FTMO te va a evaluar — y cómo Zentrade trackea cada una.
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

        {/* Features Zentrade para FTMO */}
        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            Qué trackea Zentrade en tu cuenta de FTMO
          </h2>
          <p className="text-zen-text-muted mb-8">
            Configura tu cuenta de FTMO en Zentrade con tu capital y límites, y cada trade
            que registres es evaluado automáticamente contra las reglas de FTMO.
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

        {/* Por qué fallan */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-6">
            Por qué los traders fallan FTMO (y cómo evitarlo)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                bad: "Llegan al profit target pero son rechazados en Verificación por violar la consistency rule",
                good: "Zentrade muestra tu consistency score cada día — sabes antes de que sea demasiado tarde",
              },
              {
                bad: "Superan el 5% de pérdida diaria en un mal día y pierden toda la evaluación",
                good: "La alerta de P&L diario te dice exactamente cuánto espacio te queda antes de llegar al límite",
              },
              {
                bad: "Hacen revenge trading después de una pérdida y vuelan el drawdown en una sesión",
                good: "La detección de revenge trading marca el patrón antes de que empeores la situación",
              },
              {
                bad: "No pueden ver si la evaluación va bien sin hacer cálculos manuales en una hoja de Excel",
                good: "El dashboard muestra el progreso del profit target, el drawdown usado y los días disponibles",
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

        {/* Guías FTMO */}
        {posts.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Guías sobre FTMO</h2>
            <p className="text-zen-text-muted mb-8">
              Todo lo que necesitas saber para pasar el FTMO Challenge y la Verificación.
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

        {/* CTA final */}
        <section className="rounded-2xl border border-zen-caribbean-green/30 bg-gradient-to-br from-zen-dark-green/40 to-zen-rich-black p-10 text-center">
          <h2 className="text-3xl font-bold text-zen-anti-flash mb-4">
            ¿Listo para pasar tu evaluación de FTMO?
          </h2>
          <p className="text-zen-text-muted mb-8 max-w-xl mx-auto">
            Crea una cuenta gratuita en Zentrade, configura tu cuenta de FTMO con tu
            capital y límites, y empieza a operar con visibilidad total sobre cada regla.
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
