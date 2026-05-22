import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Target, Users, Shield } from "lucide-react";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import CTAButton from "@/components/landing/cta-button";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Sobre Zentrade — El Journal de Trading con IA para Prop Firms | Historia y Equipo",
  description:
    "Zentrade nació en Colombia en 2024 para resolver un problema real: los traders de futuros LATAM no tenían un journal diseñado para pasar evaluaciones de FTMO, Apex y TopStep en español.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "Sobre Zentrade — Historia, Misión y Equipo",
    description:
      "Conoce la historia detrás de Zentrade, el journal de trading con IA creado en Colombia para traders de futuros que buscan pasar evaluaciones de prop firms.",
    type: "profile",
    url: `${SITE_URL}/about`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: "Sobre Zentrade",
      url: `${SITE_URL}/about`,
      description:
        "Zentrade es un journal de trading con IA fundado en Colombia en 2024. Diseñado para traders de futuros que buscan pasar evaluaciones de FTMO, Apex Trader Funding, TopStep, Uprofit y Tradoverse.",
      publisher: {
        "@type": "Organization",
        name: "Zentrade",
        url: SITE_URL,
        foundingDate: "2024",
        foundingLocation: { "@type": "Place", name: "Colombia" },
      },
    },
    {
      "@type": "Person",
      name: "Axel Moncada",
      jobTitle: "Fundador, Zentrade",
      worksFor: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
      nationality: { "@type": "Country", name: "Colombia" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Sobre Zentrade", item: `${SITE_URL}/about` },
      ],
    },
  ],
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24">

        {/* ── Header ── */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-zen-border-soft" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zen-caribbean-green px-1">
              Sobre Zentrade
            </span>
            <div className="h-px flex-1 bg-zen-border-soft" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-zen-anti-flash leading-tight mb-6">
            Construido por un trader,{" "}
            <span className="text-zen-caribbean-green">para traders</span>
          </h1>
          <p className="text-zen-anti-flash/60 text-lg leading-relaxed max-w-2xl">
            Zentrade nació en Colombia en 2024 para resolver un problema real: los traders de futuros en LATAM
            no tenían un journal diseñado específicamente para pasar evaluaciones de prop firms en español.
          </p>
        </div>

        {/* ── Origin story ── */}
        <section className="mb-16">
          <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-zen-anti-flash">El problema que nos trajo aquí</h2>
            <p className="text-zen-anti-flash/70 leading-relaxed">
              Operar futuros en una evaluación de FTMO o Apex no es solo tener una buena estrategia. Hay reglas estrictas:
              consistency score, trailing drawdown, max daily loss, profit target. Un trader puede llegar al 9% de ganancia y
              ser rechazado por violar la regla de consistencia en el último día.
            </p>
            <p className="text-zen-anti-flash/70 leading-relaxed">
              Las herramientas disponibles — TradeZella, Edgewonk, Tradervue — estaban en inglés, no entendían las reglas
              específicas de las prop firms, y no tenían concepto de "cuenta de evaluación vs. cuenta live". Para un trader
              de Colombia, México o Argentina, esto significaba operar a ciegas respecto a las métricas que realmente importaban.
            </p>
            <p className="text-zen-anti-flash/70 leading-relaxed">
              Zentrade se construyó para cerrar ese gap: un journal de trading en español, diseñado desde cero para las
              reglas de FTMO, Apex Trader Funding, TopStep, Uprofit y Tradoverse, con inteligencia artificial integrada
              para detectar patrones de error antes de que cuesten una evaluación.
            </p>
          </div>
        </section>

        {/* ── Founder ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zen-anti-flash mb-6">Fundador</h2>
          <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 flex items-center justify-center shrink-0">
                <span className="text-zen-caribbean-green text-2xl font-bold">A</span>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-zen-anti-flash">Axel Moncada</h3>
                  <p className="text-sm text-zen-caribbean-green font-medium">Fundador &amp; CEO, Zentrade</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-zen-anti-flash/50">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Colombia
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Fundado en 2024
                  </span>
                </div>
                <p className="text-zen-anti-flash/70 text-sm leading-relaxed">
                  Trader de futuros de CME enfocado en NQ y GC. Construyó Zentrade después de experimentar en primera persona
                  la falta de herramientas en español para gestionar evaluaciones de prop firms con precisión.
                  Combina experiencia en trading con desarrollo de producto para crear herramientas que los traders LATAM
                  realmente necesitan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & values ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zen-anti-flash mb-6">Misión y valores</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                title: "Foco en resultados",
                desc: "Cada feature existe para ayudarte a pasar evaluaciones y mantener cuentas fondeadas — no para agregar complejidad innecesaria.",
              },
              {
                icon: Users,
                title: "Hecho para LATAM",
                desc: "Español nativo, soporte en tu idioma, y precios accesibles para traders de Colombia, México, Argentina, Chile y toda la región.",
              },
              {
                icon: Shield,
                title: "Tus datos, solo tuyos",
                desc: "Row Level Security estricta: ningún usuario puede ver los datos de otro. Tu información de trading es completamente privada.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-zen-surface border border-zen-border-soft rounded-xl p-6">
                <div className="w-9 h-9 rounded-lg bg-zen-caribbean-green/10 flex items-center justify-center mb-4">
                  <Icon className="w-4.5 h-4.5 text-zen-caribbean-green" />
                </div>
                <h3 className="text-sm font-bold text-zen-anti-flash mb-2">{title}</h3>
                <p className="text-xs text-zen-anti-flash/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zen-anti-flash mb-6">Historia</h2>
          <div className="space-y-0">
            {[
              {
                date: "2024",
                title: "Inicio del desarrollo",
                desc: "Primera versión de Zentrade: registro manual de trades, dashboard básico de KPIs y soporte para evaluaciones de FTMO.",
              },
              {
                date: "Inicios 2025",
                title: "Integración de IA",
                desc: "Lanzamiento del análisis de revenge trading con Gemini AI y los primeros reportes semanales automáticos con análisis de patrones de trading.",
              },
              {
                date: "2026",
                title: "Lanzamiento público",
                desc: "Apertura al público con 4 planes (Free → ZenMode), blog bilingüe de 40+ artículos, y soporte completo para FTMO, Apex, TopStep, Uprofit y Tradoverse.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-zen-caribbean-green shrink-0 mt-1" />
                  {i < 2 && <div className="w-px flex-1 bg-zen-border-soft mt-2" />}
                </div>
                <div className="pb-2">
                  <span className="text-xs font-semibold text-zen-caribbean-green uppercase tracking-widest">{item.date}</span>
                  <h3 className="text-sm font-bold text-zen-anti-flash mt-1 mb-1">{item.title}</h3>
                  <p className="text-sm text-zen-anti-flash/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="mb-16">
          <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8">
            <h2 className="text-lg font-bold text-zen-anti-flash mb-4">Contacto</h2>
            <div className="space-y-2 text-sm text-zen-anti-flash/70">
              <p>Soporte y preguntas: <a href="mailto:support@zen-trader.com" className="text-zen-caribbean-green hover:underline">support@zen-trader.com</a></p>
              <p>Sede: Colombia — disponible globalmente</p>
              <p>Plataforma: <a href={SITE_URL} className="text-zen-caribbean-green hover:underline">zen-trader.com</a></p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-zen-anti-flash">¿Listo para empezar?</h2>
          <p className="text-zen-anti-flash/60 text-sm">
            Crea tu cuenta gratis y empieza a registrar tus trades hoy. Sin tarjeta de crédito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton size="lg" />
            <Link href="/blog" className="text-sm text-zen-anti-flash/60 hover:text-zen-caribbean-green transition-colors flex items-center gap-1">
              Explorar el blog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
