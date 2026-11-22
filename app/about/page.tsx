import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Target, DollarSign, Shield } from "lucide-react";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import CTAButton from "@/components/landing/cta-button";
import { T } from "@/components/shared/t";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "About Zentrade — The AI Trading Journal Built for Prop Firm Traders",
  description:
    "Zentrade was founded in 2024 by a futures trader to solve a real problem: no trading journal was built around prop firm rules like consistency, trailing drawdown and daily loss limits.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Zentrade — Story, Mission and Founder",
    description:
      "The story behind Zentrade, the AI trading journal built by a futures trader for traders working to pass prop firm evaluations.",
    type: "profile",
    url: `${SITE_URL}/about`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: "About Zentrade",
      url: `${SITE_URL}/about`,
      description:
        "Zentrade is an AI trading journal founded in 2024. Built for futures traders working to pass evaluations at Apex Trader Funding, TopStep, FTMO, Uprofit and Tradoverse.",
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
      jobTitle: "Founder, Zentrade",
      worksFor: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
      nationality: { "@type": "Country", name: "Colombia" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "About Zentrade", item: `${SITE_URL}/about` },
      ],
    },
  ],
};

const VALUES = [
  {
    icon: Target,
    title: { es: "Foco en resultados", en: "Built to get you funded" },
    desc: {
      es: "Cada feature existe para ayudarte a pasar evaluaciones y mantener cuentas fondeadas — no para agregar complejidad innecesaria.",
      en: "Every feature exists to help you pass evaluations and keep funded accounts. No bloat, no busywork.",
    },
  },
  {
    icon: DollarSign,
    title: { es: "Precio justo", en: "Fair pricing" },
    desc: {
      es: "Plan Free para siempre y planes de pago desde $9/mes. Pagar una evaluación ya es suficiente gasto.",
      en: "A free-forever plan and paid plans from $9/mo. Paying for evaluations is expensive enough.",
    },
  },
  {
    icon: Shield,
    title: { es: "Tus datos, solo tuyos", en: "Your data stays yours" },
    desc: {
      es: "Row Level Security estricta: ningún usuario puede ver los datos de otro. Tu información de trading es completamente privada.",
      en: "Strict Row Level Security: no user can see another user's data. Your trading history is private.",
    },
  },
];

const TIMELINE = [
  {
    date: "2024",
    title: { es: "Inicio del desarrollo", en: "Development starts" },
    desc: {
      es: "Primera versión de Zentrade: registro manual de trades, dashboard básico de KPIs y soporte para evaluaciones de FTMO.",
      en: "First version of Zentrade: manual trade logging, a core KPI dashboard and support for FTMO evaluations.",
    },
  },
  {
    date: { es: "Inicios 2025", en: "Early 2025" },
    title: { es: "Integración de IA", en: "AI comes in" },
    desc: {
      es: "Lanzamiento del análisis de revenge trading con Gemini AI y los primeros reportes semanales automáticos con análisis de patrones de trading.",
      en: "Revenge trading detection and the first automated weekly reports that analyze your trading patterns.",
    },
  },
  {
    date: "2026",
    title: { es: "Lanzamiento público", en: "Public launch" },
    desc: {
      es: "Apertura al público con 4 planes (Free → ZenMode), el Copiloto de Disciplina en vivo y soporte para FTMO, Apex, TopStep, Uprofit y Tradoverse.",
      en: "Open to everyone with 4 plans (Free to ZenMode), the Live Discipline Copilot and support for Apex, TopStep, FTMO, Uprofit and Tradoverse.",
    },
  },
];

function Bi({ text }: { text: string | { es: string; en: string } }) {
  return typeof text === "string" ? <>{text}</> : <T es={text.es} en={text.en} />;
}

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
              <T es="Sobre Zentrade" en="About Zentrade" />
            </span>
            <div className="h-px flex-1 bg-zen-border-soft" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-zen-anti-flash leading-tight mb-6">
            <T es="Construido por un trader," en="Built by a trader," />{" "}
            <span className="text-zen-caribbean-green"><T es="para traders" en="for traders" /></span>
          </h1>
          <p className="text-zen-anti-flash/60 text-lg leading-relaxed max-w-2xl">
            <T
              es="Zentrade nació en 2024 para resolver un problema real: ningún journal de trading estaba diseñado alrededor de las reglas de las prop firms."
              en="Zentrade started in 2024 to fix a real problem: no trading journal was built around the rules prop firms actually grade you on."
            />
          </p>
        </div>

        {/* ── Origin story ── */}
        <section className="mb-16">
          <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-zen-anti-flash">
              <T es="El problema que nos trajo aquí" en="The problem that started it" />
            </h2>
            <p className="text-zen-anti-flash/70 leading-relaxed">
              <T
                es="Operar futuros en una evaluación de Apex o TopStep no es solo tener una buena estrategia. Hay reglas estrictas: consistency score, trailing drawdown, max daily loss, profit target. Un trader puede llegar al objetivo de ganancia y ser rechazado por violar la regla de consistencia en el último día."
                en="Trading futures in an Apex or TopStep evaluation takes more than a good strategy. The rules are strict: consistency score, trailing drawdown, max daily loss, profit target. You can hit your profit target and still fail because one day broke the consistency rule."
              />
            </p>
            <p className="text-zen-anti-flash/70 leading-relaxed">
              <T
                es="Las herramientas populares — TradeZella, Edgewonk, Tradervue — son journals generales, pensados para todo tipo de trader y no alrededor de las reglas de una evaluación. Queríamos ver en todo momento las métricas que deciden si pasas o no."
                en="The popular tools, like TradeZella, Edgewonk and Tradervue, are general-purpose journals built for every kind of trader, not around evaluation rules. We wanted the metrics that decide whether you get funded front and center, all the time."
              />
            </p>
            <p className="text-zen-anti-flash/70 leading-relaxed">
              <T
                es="Zentrade se construyó para cerrar ese gap: un journal de trading diseñado desde cero para las reglas de Apex Trader Funding, TopStep, FTMO, Uprofit y Tradoverse, con inteligencia artificial integrada para detectar patrones de error antes de que cuesten una evaluación."
                en="Zentrade was built to close that gap: a trading journal designed from day one around the rules of Apex Trader Funding, TopStep, FTMO, Uprofit and Tradoverse, with AI that flags your costly patterns before they blow an evaluation."
              />
            </p>
          </div>
        </section>

        {/* ── Founder ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zen-anti-flash mb-6"><T es="Fundador" en="Founder" /></h2>
          <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 flex items-center justify-center shrink-0">
                <span className="text-zen-caribbean-green text-2xl font-bold">A</span>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-zen-anti-flash">Axel Moncada</h3>
                  <p className="text-sm text-zen-caribbean-green font-medium"><T es="Fundador y CEO, Zentrade" en="Founder & CEO, Zentrade" /></p>
                </div>
                <div className="flex items-center gap-4 text-xs text-zen-anti-flash/50">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Colombia
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> <T es="Fundado en 2024" en="Founded in 2024" />
                  </span>
                </div>
                <p className="text-zen-anti-flash/70 text-sm leading-relaxed">
                  <T
                    es="Trader de futuros de CME enfocado en NQ y GC. Construyó Zentrade después de vivir en primera persona la falta de herramientas para gestionar evaluaciones de prop firms con precisión. Combina experiencia en trading con desarrollo de producto."
                    en="CME futures trader focused on NQ and GC. He built Zentrade after struggling firsthand to track prop firm evaluations with any precision, combining trading experience with product development."
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & values ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zen-anti-flash mb-6"><T es="Misión y valores" en="Mission and values" /></h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title.en} className="bg-zen-surface border border-zen-border-soft rounded-xl p-6">
                <div className="w-9 h-9 rounded-lg bg-zen-caribbean-green/10 flex items-center justify-center mb-4">
                  <Icon className="w-4.5 h-4.5 text-zen-caribbean-green" />
                </div>
                <h3 className="text-sm font-bold text-zen-anti-flash mb-2"><Bi text={title} /></h3>
                <p className="text-xs text-zen-anti-flash/60 leading-relaxed"><Bi text={desc} /></p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-zen-anti-flash mb-6"><T es="Historia" en="Our story" /></h2>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-zen-caribbean-green shrink-0 mt-1" />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-zen-border-soft mt-2" />}
                </div>
                <div className="pb-2">
                  <span className="text-xs font-semibold text-zen-caribbean-green uppercase tracking-widest"><Bi text={item.date} /></span>
                  <h3 className="text-sm font-bold text-zen-anti-flash mt-1 mb-1"><Bi text={item.title} /></h3>
                  <p className="text-sm text-zen-anti-flash/60 leading-relaxed"><Bi text={item.desc} /></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="mb-16">
          <div className="bg-zen-surface border border-zen-border-soft rounded-2xl p-8">
            <h2 className="text-lg font-bold text-zen-anti-flash mb-4"><T es="Contacto" en="Contact" /></h2>
            <div className="space-y-2 text-sm text-zen-anti-flash/70">
              <p><T es="Soporte y preguntas" en="Support and questions" />: <a href="mailto:support@zen-trader.com" className="text-zen-caribbean-green hover:underline">support@zen-trader.com</a></p>
              <p><T es="Sede: Colombia — disponible globalmente" en="Based in Colombia, available worldwide" /></p>
              <p><T es="Plataforma" en="Platform" />: <a href={SITE_URL} className="text-zen-caribbean-green hover:underline">zen-trader.com</a></p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-zen-anti-flash"><T es="¿Listo para empezar?" en="Ready to get funded?" /></h2>
          <p className="text-zen-anti-flash/60 text-sm">
            <T
              es="Crea tu cuenta gratis y empieza a registrar tus trades hoy. Sin tarjeta de crédito."
              en="Create your free account and start logging your trades today. No credit card required."
            />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton size="lg" />
            <Link href="/blog" className="text-sm text-zen-anti-flash/60 hover:text-zen-caribbean-green transition-colors flex items-center gap-1">
              <T es="Explorar el blog" en="Read the blog" /> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
