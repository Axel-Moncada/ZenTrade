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
  title: "Mejor Journal de Trading para TopStep",
  description:
    "Zentrade sigue el Maximum Loss Limit de TopStep, el límite de pérdida diaria, el profit target y el objetivo de consistencia del 55%.",
  keywords: [
    "journal de trading para TopStep",
    "mejor journal TopStep",
    "app para TopStep evaluación",
    "tracker TopStep",
    "límite pérdida diaria TopStep",
    "cómo pasar TopStep",
    "journal prop firm TopStep",
    "TopStep futuros journal",
  ],
  alternates: {
    canonical: `${SITE_URL}/es/topstep`,
    languages: {
      en: `${SITE_URL}/topstep`,
      es: `${SITE_URL}/es/topstep`,
    },
  },
  openGraph: {
    title: "Mejor Journal para TopStep | Zentrade",
    description:
      "Sigue el límite de pérdida diaria y el drawdown de TopStep en tiempo real. Diseñado para traders de futuros.",
    url: `${SITE_URL}/es/topstep`,
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Zentrade para TopStep — Journal de Trading con IA",
    description:
      "Zentrade sigue el Maximum Loss Limit, el límite de pérdida diaria, el profit target y el objetivo de consistencia de TopStep.",
    url: `${SITE_URL}/es/topstep`,
    inLanguage: "es",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Journal para TopStep", item: `${SITE_URL}/es/topstep` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué debe medir un journal de trading para TopStep?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zentrade sigue el Maximum Loss Limit de TopStep, tu P&L diario y el objetivo de consistencia del 55% por cuenta, y se actualiza después de cada trade para que sepas tu margen real antes del siguiente.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo calcula TopStep el límite de pérdida diaria?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "En el Trading Combine el límite de pérdida diaria es opcional: si lo agregas al comprar es de $1.000 en la de 50K ($2.000 en 100K, $3.000 en 150K). Aparte, el Maximum Loss Limit ($2.000 en la de 50K) sigue tu balance de fin de día. Zentrade sigue tu P&L diario contra el límite que configures. Revisa el centro de ayuda de Topstep para los términos vigentes.",
        },
      },
      {
        "@type": "Question",
        name: "¿TopStep tiene consistency rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, un objetivo de consistencia. En el Combine tu mejor día no debe superar el 55% de tu ganancia total (actualizado en septiembre de 2026). Si lo supera, el Combine no se pierde: el profit target sube a tu mejor día dividido entre 0,55. Zentrade te muestra en vivo qué parte de tu ganancia viene de tu mejor día.",
        },
      },
    ],
  },
];

const TOPSTEP_RULES = [
  { label: "Profit Target", value: "$3.000", note: "Trading Combine de 50K ($6.000 en 100K, $9.000 en 150K)" },
  { label: "Maximum Loss Limit", value: "$2.000", note: "50K; sigue tu balance de fin de día (el piso empieza en $48.000)" },
  { label: "Límite de pérdida diaria", value: "Opcional", note: "$1.000 en la de 50K si lo agregas al comprar" },
  { label: "Objetivo de consistencia", value: "55%", note: "Tu mejor día ≤ 55% de la ganancia total, o sube el profit target" },
];

const ZENTRADE_FEATURES = [
  "Tracker de P&L diario con alerta de tu límite de pérdida diaria",
  "Tracking del Maximum Loss Limit con trailing de fin de día",
  "Barra de progreso hacia el profit target ($3.000 en el Combine de 50K)",
  "Chequeo del objetivo de consistencia del 55%",
  "Equity curve con línea de límite de drawdown",
  "Import de trades desde NinjaTrader, Rithmic, Tradovate via CSV",
  "Dashboard multi-cuenta — evaluación y cuenta fondeada lado a lado",
];

const TOPSTEP_SLUGS = [
  "como-pasar-topstep-evaluacion",
  "how-to-pass-topstep-evaluation",
  "max-daily-loss-como-respetar",
  "max-daily-loss-fondeo-how-to-manage",
  "que-es-drawdown-trading",
  "what-is-drawdown-trading",
  "mejores-empresas-fondeo-futuros-2025",
  "best-prop-firms-futures-traders",
];

export default async function TopStepEsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => TOPSTEP_SLUGS.includes(p.slug));

  return (
    <div lang="es" className="min-h-screen bg-zen-rich-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-24">

        <nav className="flex items-center gap-1.5 text-xs text-zen-anti-flash/50 mb-10">
          <Link href="/" className="hover:text-zen-caribbean-green transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zen-anti-flash/80">TopStep</span>
        </nav>

        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Journal para Prop Firms
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash mb-6 leading-tight">
            El journal diseñado para{" "}
            <span className="text-zen-caribbean-green">TopStep</span>
          </h1>
          <p className="text-zen-text-muted text-xl max-w-2xl mx-auto mb-8">
            El Maximum Loss Limit de TopStep sigue tu balance de fin de día, y el límite diario puede cortarte el día.
            Zentrade muestra tu P&L contra ambos después de cada trade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="zenGreen" size="lg" className="group">
                Empezar a trackear TopStep gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/blog/como-pasar-topstep-evaluacion">
              <Button variant="ghost" size="lg" className="text-zen-text-muted hover:text-zen-caribbean-green">
                Leer la guía de TopStep →
              </Button>
            </Link>
          </div>
        </div>

        <section className="mb-20">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Reglas de la evaluación de TopStep</h2>
          <p className="text-zen-text-muted mb-8">
            Las reglas de TopStep son simples: un profit target, un Maximum Loss Limit y un objetivo de consistencia del 55% —
            pero el Maximum Loss Limit con trailing no perdona.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPSTEP_RULES.map((rule) => (
              <div key={rule.label} className="rounded-xl border border-zen-border-soft bg-zen-surface p-5">
                <div className="text-2xl font-bold text-zen-caribbean-green mb-1">{rule.value}</div>
                <div className="text-sm font-semibold text-zen-anti-flash mb-1">{rule.label}</div>
                <div className="text-xs text-zen-text-muted">{rule.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zen-text-muted">
            Cifras de la cuenta de 50K, verificadas el 22 de noviembre de 2026 en el centro de ayuda de Topstep y guías de reglas de 2026. Las reglas
            cambian según el tamaño, el tipo de cuenta y la fecha de compra.{" "}
            <a href="https://help.topstep.com/" target="_blank" rel="noopener noreferrer nofollow" className="text-zen-caribbean-green hover:underline">
              Confirma las reglas vigentes con Topstep
            </a>
            .
          </p>
        </section>

        <section className="mb-20 rounded-2xl border border-zen-caribbean-green/20 bg-zen-surface p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">
            Qué trackea Zentrade en tu cuenta de TopStep
          </h2>
          <p className="text-zen-text-muted mb-8">
            Quedarte sin colchón en el Maximum Loss Limit es lo que destruye evaluaciones.
            Zentrade pone un contador en vivo frente a ti para que nunca lo cruces accidentalmente.
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
            Por qué los traders fallan TopStep (y cómo evitarlo)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                bad: "Superan el límite de pérdida diaria en la primera hora después de un evento de noticias",
                good: "La alerta de P&L diario muestra el umbral exacto en dólares para tu cuenta — sabes cuándo parar",
              },
              {
                bad: "La cuenta es rentable en general pero un mal día se come el colchón de $2.000 del Maximum Loss Limit",
                good: "La equity curve con la línea de drawdown muestra cuánto margen te queda en todo momento",
              },
              {
                bad: "La ausencia de días mínimos genera mentalidad de 'ir fuerte desde el inicio' que quiebra las cuentas rápido",
                good: "El historial de tamaño de posición y el promedio diario te ayudan a operar con consistencia, no con agresividad",
              },
              {
                bad: "Se pierde el tracking del profit target y el drawdown cuando se opera en múltiples sesiones",
                good: "El dashboard muestra el progreso del profit target y el drawdown usado — actualizado después de cada trade",
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
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-2">Guías sobre TopStep</h2>
            <p className="text-zen-text-muted mb-8">
              Guías sobre las reglas de TopStep, el manejo del límite de pérdida diaria y comparativas con FTMO y Apex.
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
            ¿Listo para pasar tu evaluación de TopStep?
          </h2>
          <p className="text-zen-text-muted mb-8 max-w-xl mx-auto">
            Configura tu cuenta de TopStep en Zentrade con el tamaño de tu plan. Tus límites
            de pérdida van a estar frente a tus ojos — sin sorpresas, sin Excel.
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
