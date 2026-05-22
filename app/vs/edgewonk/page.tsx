import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import CTAButton from "@/components/landing/cta-button";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade vs Edgewonk 2025: ¿Cuál es Mejor para Futuros y Prop Firms?",
  description:
    "Comparativa directa: Zentrade vs Edgewonk para traders de futuros. Precio, soporte para evaluaciones de FTMO/Apex/TopStep, idioma español y análisis con IA. Descubre la mejor alternativa a Edgewonk para LATAM.",
  keywords: [
    "Zentrade vs Edgewonk",
    "alternativa Edgewonk español",
    "mejor journal trading futuros 2025",
    "Edgewonk alternativa LATAM",
    "journal trading prop firm español",
    "trading journal evaluaciones fondeo",
  ],
  alternates: { canonical: `${SITE_URL}/vs/edgewonk` },
  openGraph: {
    title: "Zentrade vs Edgewonk — La Alternativa en Español para Prop Firms",
    description:
      "Comparativa directa entre Zentrade y Edgewonk. Precio, features, soporte prop firms y por qué Zentrade es la mejor alternativa para traders de futuros LATAM.",
    type: "website",
    url: `${SITE_URL}/vs/edgewonk`,
  },
};

const comparisonRows = [
  { label: "Precio de entrada", zentrade: "$0 (Free real)", edgewonk: "$169/año o ~$39/mes", zentradeBetter: true },
  { label: "Plan gratuito funcional", zentrade: "Sí — 1 cuenta, registro ilimitado", edgewonk: "No — solo demo limitado", zentradeBetter: true },
  { label: "Idioma", zentrade: "Español nativo + inglés", edgewonk: "Inglés (sin español real)", zentradeBetter: true },
  { label: "Plataforma", zentrade: "Web app (sin instalación)", edgewonk: "Software desktop", zentradeBetter: true },
  { label: "Soporte nativo prop firms", zentrade: "Sí — evaluation / live accounts", edgewonk: "No — sin cuentas de evaluación", zentradeBetter: true },
  { label: "Consistency score FTMO", zentrade: "Cálculo automático en dashboard", edgewonk: "Manual", zentradeBetter: true },
  { label: "Trailing drawdown tracker", zentrade: "Sí, en tiempo real", edgewonk: "No", zentradeBetter: true },
  { label: "Importación CSV", zentrade: "Automática (plan Professional+)", edgewonk: "Soportada, algunos formatos", zentradeBetter: null },
  { label: "Análisis con IA", zentrade: "Sí — Gemini (ZenMode)", edgewonk: "No", zentradeBetter: true },
  { label: "Reporte semanal automático", zentrade: "Sí — email + análisis IA", edgewonk: "No", zentradeBetter: true },
  { label: "Estadística avanzada profunda", zentrade: "Métricas clave de fondeo", edgewonk: "Muy profunda (Monte Carlo, etc.)", zentradeBetter: false },
  { label: "Soporte múltiples mercados", zentrade: "Futuros CME (especializado)", edgewonk: "Acciones, Forex, futuros", zentradeBetter: false },
];

const faqItems = [
  {
    q: "¿Puedo migrar mis trades de Edgewonk a Zentrade?",
    a: "Sí. Exporta tus trades de Edgewonk como CSV e impórtalos a Zentrade usando la función de importación (plan Professional). El mapeo de columnas es flexible.",
  },
  {
    q: "¿Edgewonk tiene soporte para la consistency rule de FTMO?",
    a: "No de forma nativa. Puedes calcular la consistency rule manualmente con los datos de Edgewonk, pero no hay un indicador automático que monitoree el porcentaje en tiempo real. Zentrade lo calcula automáticamente.",
  },
  {
    q: "¿Zentrade funciona para traders de acciones o Forex?",
    a: "Zentrade está optimizado para futuros de CME (NQ, MNQ, ES, GC, CL). El cálculo de PnL usa tick size y tick value de contratos de futuros. Para acciones o Forex puro, algunas métricas específicas de futuros no aplican.",
  },
  {
    q: "¿Por qué Edgewonk tiene estadística más profunda?",
    a: "Edgewonk tiene más de 10 años de desarrollo y está enfocado en análisis estadístico general para traders avanzados de múltiples mercados. Zentrade prioriza las métricas que más importan para pasar evaluaciones de prop firms, presentadas de forma clara para traders LATAM.",
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
        { "@type": "ListItem", position: 2, name: "Zentrade vs Edgewonk", item: `${SITE_URL}/vs/edgewonk` },
      ],
    },
  ],
};

export default async function VsEdgewonkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicNavbar isAuthenticated={!!user} />

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-zen-caribbean-green/5 via-transparent to-transparent pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(0,193,124,0.08) 0%, transparent 60%)" }} />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-zen-surface border border-zen-caribbean-green/20 rounded-full px-4 py-1.5 text-xs font-semibold text-zen-caribbean-green uppercase tracking-widest">
              Comparativa 2025
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-zen-anti-flash leading-tight">
              Zentrade vs{" "}
              <span className="text-zen-caribbean-green">Edgewonk</span>
            </h1>
            <p className="text-xl text-zen-anti-flash/70 max-w-2xl mx-auto leading-relaxed">
              La comparativa definitiva para traders de futuros que hacen evaluaciones de prop firms.
              Precio, soporte FTMO/Apex, idioma y análisis con IA — todo en un vistazo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <CTAButton size="lg" />
              <Link href="/blog/zentrade-vs-edgewonk"
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
                <strong className="text-zen-anti-flash">Veredicto rápido:</strong> Si eres trader de futuros en evaluación de prop firm y operas en español,{" "}
                <strong className="text-zen-caribbean-green">Zentrade está diseñado específicamente para ti</strong>.
                Si eres un trader avanzado de múltiples mercados que quiere el análisis estadístico más profundo del mercado, Edgewonk sigue siendo sólido — aunque más caro y sin soporte nativo para evaluaciones.
              </p>
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-zen-anti-flash mb-8 text-center">Comparativa directa</h2>
            <div className="rounded-2xl border border-zen-border-soft overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-zen-surface-elevated border-b border-zen-border-soft">
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-anti-flash/50">Criterio</div>
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-caribbean-green border-l border-zen-border-soft text-center">
                  Zentrade
                </div>
                <div className="p-4 text-xs font-semibold uppercase tracking-widest text-zen-anti-flash/50 border-l border-zen-border-soft text-center">
                  Edgewonk
                </div>
              </div>
              {/* Rows */}
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
                      {row.edgewonk}
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

            {/* Prop firm support */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zen-surface border border-zen-caribbean-green/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-zen-caribbean-green" />
                  <h3 className="font-bold text-zen-anti-flash">Zentrade — diseñado para evaluaciones</h3>
                </div>
                <p className="text-sm text-zen-anti-flash/70 leading-relaxed">
                  Cada cuenta en Zentrade es de tipo <strong className="text-zen-anti-flash">Evaluation</strong> o <strong className="text-zen-anti-flash">Live</strong>.
                  Configuras el Max Daily Loss, Max Drawdown y Profit Target de tu evaluación, y el dashboard los monitorea en tiempo real.
                  La Consistency Rule de FTMO se calcula automáticamente. El calendario muestra qué días violaste una regla.
                </p>
              </div>
              <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-6 opacity-70">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-zen-anti-flash/30" />
                  <h3 className="font-bold text-zen-anti-flash/60">Edgewonk — análisis general</h3>
                </div>
                <p className="text-sm text-zen-anti-flash/50 leading-relaxed">
                  Edgewonk no tiene el concepto de cuenta de evaluación. No puedes configurar parámetros de Max Daily Loss o trailing drawdown
                  para monitorearlos en el dashboard. Los traders en evaluación lo usan manualmente, sin integración nativa con las reglas de su prop firm.
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
                  <div className="text-3xl font-bold text-zen-anti-flash/60 mb-1">$169<span className="text-base font-normal text-zen-anti-flash/40">/año</span></div>
                  <div className="text-sm text-zen-anti-flash/50 font-semibold mb-3">Edgewonk</div>
                  <ul className="space-y-2 text-sm text-zen-anti-flash/50">
                    <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />Sin plan gratuito permanente</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />$169/año (pago único anual)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />~$39/mes en plan mensual</li>
                    <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-zen-anti-flash/30 shrink-0 mt-0.5" />Compromiso alto para traders en evaluación</li>
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
                  { text: "Trader LATAM que prefiere trabajar en español", rec: "zentrade" },
                  { text: "Trader que quiere empezar sin costo", rec: "zentrade" },
                  { text: "Trader que quiere análisis con IA de sus patrones", rec: "zentrade" },
                  { text: "Trader avanzado con estadística profunda de múltiples mercados", rec: "edgewonk" },
                  { text: "Trader de acciones/Forex con historial en Edgewonk", rec: "edgewonk" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.rec === "zentrade" ? "bg-zen-caribbean-green/5 border-zen-caribbean-green/20" : "bg-zen-surface border-zen-border-soft opacity-60"}`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.rec === "zentrade" ? "text-zen-caribbean-green" : "text-zen-anti-flash/30"}`} />
                    <span className={`text-sm ${item.rec === "zentrade" ? "text-zen-anti-flash" : "text-zen-anti-flash/50"}`}>{item.text}</span>
                    <span className={`ml-auto text-xs font-bold shrink-0 ${item.rec === "zentrade" ? "text-zen-caribbean-green" : "text-zen-anti-flash/30"}`}>
                      {item.rec === "zentrade" ? "Zentrade" : "Edgewonk"}
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
            <h2 className="text-2xl font-bold text-zen-anti-flash">Prueba Zentrade gratis hoy</h2>
            <p className="text-zen-anti-flash/60 text-sm">
              Crea tu primera cuenta de evaluación, registra tus trades y ve el dashboard en acción.
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
              <Link href="/blog/zentrade-vs-edgewonk"
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
