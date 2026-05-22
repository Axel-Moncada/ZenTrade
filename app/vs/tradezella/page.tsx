import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import CTAButton from "@/components/landing/cta-button";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade vs TradeZella 2025: ¿Cuál es Mejor para Prop Firms en LATAM?",
  description:
    "Comparativa directa: Zentrade vs TradeZella para traders de futuros. Precio, soporte en español, evaluaciones de FTMO/Apex/TopStep y análisis con IA. Descubre la mejor alternativa a TradeZella para LATAM.",
  keywords: [
    "Zentrade vs TradeZella",
    "alternativa TradeZella español",
    "mejor journal trading prop firms LATAM",
    "TradeZella alternativa LATAM",
    "journal trading prop firm español",
    "diario trading evaluaciones fondeo",
  ],
  alternates: { canonical: `${SITE_URL}/vs/tradezella` },
  openGraph: {
    title: "Zentrade vs TradeZella — La Alternativa en Español para LATAM",
    description:
      "Comparativa directa entre Zentrade y TradeZella. Precio, features, soporte para evaluaciones de fondeo y por qué Zentrade es la mejor alternativa para traders de futuros en español.",
    type: "website",
    url: `${SITE_URL}/vs/tradezella`,
  },
};

const comparisonRows = [
  { label: "Plan de entrada", zentrade: "$0 (Free real)", tradezella: "$29/mes mínimo para análisis", zentradeBetter: true },
  { label: "Plan gratuito funcional", zentrade: "Sí — 1 cuenta, registro ilimitado", tradezella: "Demo muy limitado", zentradeBetter: true },
  { label: "Idioma", zentrade: "Español nativo + inglés", tradezella: "Solo inglés", zentradeBetter: true },
  { label: "Soporte nativo prop firms", zentrade: "Sí — evaluation / live accounts", tradezella: "Parcial — sin reglas LATAM", zentradeBetter: true },
  { label: "Consistency score FTMO", zentrade: "Cálculo automático en dashboard", tradezella: "No (solo FTMO via integración paga)", zentradeBetter: true },
  { label: "Trailing drawdown tracker", zentrade: "Sí, en tiempo real", tradezella: "Parcial", zentradeBetter: true },
  { label: "Detección de revenge trading", zentrade: "Sí — IA exclusiva ZenMode", tradezella: "No", zentradeBetter: true },
  { label: "Reporte semanal con IA", zentrade: "Sí — email + análisis Gemini", tradezella: "No", zentradeBetter: true },
  { label: "Plan con IA completa", zentrade: "$59/mes (ZenMode)", tradezella: "$59/mes (Essential+)", zentradeBetter: null },
  { label: "Soporte en español", zentrade: "Sí", tradezella: "No", zentradeBetter: true },
  { label: "Enfoque en futuros CME", zentrade: "Nativo — NQ, ES, GC, CL, MES, MNQ", tradezella: "Acciones, opciones, futuros (genérico)", zentradeBetter: true },
  { label: "Comunidad y recursos LATAM", zentrade: "Sí — blog en español, soporte en español", tradezella: "Contenido en inglés", zentradeBetter: true },
];

const faqItems = [
  {
    q: "¿TradeZella tiene versión en español?",
    a: "No. TradeZella está principalmente en inglés. No hay versión en español de la interfaz ni del soporte. Para traders de Colombia, México, Chile y LATAM, Zentrade es la opción nativa en español.",
  },
  {
    q: "¿TradeZella soporta evaluaciones de FTMO o Apex?",
    a: "TradeZella tiene algunas integraciones con prop firms, pero sin las reglas LATAM específicas y sin la calculadora automática de consistency score de FTMO. Zentrade fue diseñado desde cero para este caso de uso.",
  },
  {
    q: "¿Puedo migrar mis trades de TradeZella a Zentrade?",
    a: "Sí. Si exportas tus trades de TradeZella como CSV, puedes importarlos a Zentrade con el plan Professional. El mapeo de columnas es flexible.",
  },
  {
    q: "¿Zentrade es más barato que TradeZella?",
    a: "Sí para la mayoría de casos. Zentrade tiene plan Free permanente (TradeZella no). Para análisis con IA, ambos tienen planes a $59/mes. Para análisis básico, Zentrade Starter es $9/mes vs. los $29/mes mínimos de TradeZella para funciones similares.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Zentrade vs TradeZella", item: `${SITE_URL}/vs/tradezella` },
      ],
    },
  ],
};

export default async function VsTradezellaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicNavbar isAuthenticated={!!user} />

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(0,193,124,0.08) 0%, transparent 60%)" }} />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-zen-surface border border-zen-caribbean-green/20 rounded-full px-4 py-1.5 text-xs font-semibold text-zen-caribbean-green uppercase tracking-widest">
              Comparativa 2025
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash leading-tight">
              Zentrade vs{" "}
              <span className="text-zen-caribbean-green">TradeZella</span>
            </h1>
            <p className="text-xl text-zen-anti-flash/70 max-w-2xl mx-auto leading-relaxed">
              ¿Cuál es el mejor journal de trading para pasar evaluaciones de prop firms en LATAM?
              Precio, español nativo, FTMO/Apex y análisis con IA — comparativa directa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <CTAButton size="lg" />
              <Link href="/blog/zentrade-vs-tradezella"
                className="text-sm text-zen-anti-flash/60 hover:text-zen-caribbean-green transition-colors flex items-center gap-1">
                Leer análisis completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Verdict banner ── */}
        <section className="px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <Sparkles className="w-6 h-6 text-zen-caribbean-green shrink-0 mt-0.5 md:mt-0" />
              <p className="text-zen-anti-flash/80 text-sm leading-relaxed">
                <strong className="text-zen-anti-flash">Veredicto rápido:</strong> Si operas futuros, buscas pasar evaluaciones de FTMO, Apex o TopStep, y necesitas una herramienta en español,{" "}
                <strong className="text-zen-caribbean-green">Zentrade es la opción más completa para este caso de uso</strong>.
                Si ya tienes cuenta en TradeZella y operas principalmente acciones o forex en inglés, cambiar no es urgente. Pero si empiezas desde cero, los números cuentan una historia clara.
              </p>
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-8 text-center">Comparativa directa</h2>
            <div className="rounded-2xl border border-zen-border-soft overflow-hidden">
              <div className="grid grid-cols-3 bg-zen-surface-elevated border-b border-zen-border-soft">
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-anti-flash/50">Criterio</div>
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-caribbean-green border-l border-zen-border-soft text-center">
                  Zentrade
                </div>
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-anti-flash/50 border-l border-zen-border-soft text-center">
                  TradeZella
                </div>
              </div>
              {comparisonRows.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 border-b border-zen-border-soft last:border-0 ${i % 2 === 0 ? "bg-zen-rich-black" : "bg-zen-surface/30"}`}>
                  <div className="p-4 text-sm text-zen-anti-flash/70 flex items-center">{row.label}</div>
                  <div className="p-4 text-sm border-l border-zen-border-soft flex items-center gap-2">
                    {row.zentradeBetter === true && <CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0" />}
                    {row.zentradeBetter === false && <XCircle className="w-4 h-4 text-zen-anti-flash/30 shrink-0" />}
                    {row.zentradeBetter === null && <span className="w-4 h-4 shrink-0" />}
                    <span className={row.zentradeBetter === true ? "text-zen-anti-flash font-medium" : "text-zen-anti-flash/60"}>
                      {row.zentrade}
                    </span>
                  </div>
                  <div className="p-4 text-sm border-l border-zen-border-soft flex items-center gap-2">
                    {row.zentradeBetter === false && <CheckCircle2 className="w-4 h-4 text-zen-anti-flash/40 shrink-0" />}
                    {row.zentradeBetter === true && <XCircle className="w-4 h-4 text-zen-anti-flash/20 shrink-0" />}
                    {row.zentradeBetter === null && <span className="w-4 h-4 shrink-0" />}
                    <span className={row.zentradeBetter === false ? "text-zen-anti-flash/80" : "text-zen-anti-flash/40"}>
                      {row.tradezella}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Key differentiators ── */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-2xl font-bold text-zen-anti-flash text-center">Las diferencias que importan</h2>

            {/* Español */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-zen-caribbean-green" />
                  <h3 className="font-bold text-zen-anti-flash">Zentrade — español nativo</h3>
                </div>
                <p className="text-sm text-zen-anti-flash/70 leading-relaxed">
                  Toda la interfaz, mensajes de error, labels del dashboard y notificaciones están en español desde el diseño — no como traducción.
                  Para traders de Colombia, México, Chile y LATAM, esto reduce la curva de aprendizaje significativamente y elimina la fricción diaria de operar en otro idioma.
                </p>
              </div>
              <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-6 opacity-70">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-zen-anti-flash/30" />
                  <h3 className="font-bold text-zen-anti-flash/60">TradeZella — solo inglés</h3>
                </div>
                <p className="text-sm text-zen-anti-flash/50 leading-relaxed">
                  TradeZella está íntegramente en inglés. No hay versión en español de la interfaz.
                  Para traders LATAM que prefieren trabajar en su idioma, esta es una fricción diaria que afecta la consistencia de uso del journal.
                </p>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8">
              <h3 className="text-xl font-bold text-zen-anti-flash mb-6">Precio: ¿cuánto cuesta cada uno?</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold text-zen-caribbean-green mb-1">$0 — $59<span className="text-base font-normal text-zen-anti-flash/50">/mes</span></div>
                  <div className="text-sm text-zen-anti-flash font-semibold mb-3">Zentrade</div>
                  <ul className="space-y-2 text-sm text-zen-anti-flash/70">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />Plan Free real — 1 cuenta, registro ilimitado</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />Starter $9/mes — 2 cuentas, export CSV</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />Professional $29/mes — import CSV, análisis avanzado</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-caribbean-green shrink-0 mt-0.5" />ZenMode $59/mes — IA Gemini + alertas de riesgo</li>
                  </ul>
                </div>
                <div className="opacity-70">
                  <div className="text-3xl font-bold text-zen-anti-flash/60 mb-1">$29<span className="text-base font-normal text-zen-anti-flash/40">/mes mínimo</span></div>
                  <div className="text-sm text-zen-anti-flash/50 font-semibold mb-3">TradeZella</div>
                  <ul className="space-y-2 text-sm text-zen-anti-flash/50">
                    <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />Sin plan gratuito funcional</li>
                    <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />Plan básico desde ~$29/mes</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />Plan con IA desde $59/mes</li>
                    <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />Sin soporte en español</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Para quién */}
            <div>
              <h3 className="text-xl font-bold text-zen-anti-flash mb-6 text-center">¿Para quién es cada uno?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { text: "Trader de futuros en evaluación de FTMO, Apex o TopStep", rec: "zentrade" },
                  { text: "Trader LATAM que necesita interfaz en español", rec: "zentrade" },
                  { text: "Trader que quiere empezar sin costo con plan gratuito real", rec: "zentrade" },
                  { text: "Trader que quiere consistency score automático de FTMO", rec: "zentrade" },
                  { text: "Trader de acciones/opciones que ya usa TradeZella en inglés", rec: "tradezella" },
                  { text: "Trader con alto volumen de operaciones multi-mercado", rec: "tradezella" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.rec === "zentrade" ? "bg-zen-caribbean-green/5 border-zen-caribbean-green/20" : "bg-zen-surface border-zen-border-soft opacity-60"}`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.rec === "zentrade" ? "text-zen-caribbean-green" : "text-zen-anti-flash/30"}`} />
                    <span className={`text-sm ${item.rec === "zentrade" ? "text-zen-anti-flash" : "text-zen-anti-flash/50"}`}>{item.text}</span>
                    <span className={`ml-auto text-xs font-bold shrink-0 ${item.rec === "zentrade" ? "text-zen-caribbean-green" : "text-zen-anti-flash/30"}`}>
                      {item.rec === "zentrade" ? "Zentrade" : "TradeZella"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA mid-page ── */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-2xl mx-auto text-center space-y-4 bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold text-zen-anti-flash">Empieza gratis hoy</h2>
            <p className="text-zen-anti-flash/60 text-sm">
              Crea tu primera cuenta de evaluación en Zentrade, registra tus trades y ve el dashboard en acción.
              Sin tarjeta de crédito. Sin instalaciones.
            </p>
            <CTAButton size="lg" />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 lg:px-8 pb-24">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-8 text-center">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="bg-zen-surface border border-zen-border-soft rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zen-anti-flash mb-2">{item.q}</h3>
                  <p className="text-sm text-zen-anti-flash/60 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog/zentrade-vs-tradezella"
                className="inline-flex items-center gap-2 text-sm text-zen-caribbean-green hover:text-zen-caribbean-green/80 transition-colors font-medium">
                Leer el análisis completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
