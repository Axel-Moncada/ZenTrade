import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/landing/sections/hero-section";
import ProblemSection from "@/components/landing/sections/problem-section";
import SolutionSection from "@/components/landing/sections/solution-section";
import FeaturesSection from "@/components/landing/sections/features-section";
import PricingSection from "@/components/landing/sections/pricing-section";
import BenefitsSection from "@/components/landing/sections/benefits-section";
import FaqSection from "@/components/landing/sections/faq-section";
import FinalCTASection from "@/components/landing/sections/final-cta-section";
import PreviewSection from "@/components/landing/sections/preview-section";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import NewsletterPopup from "@/components/landing/newsletter-popup";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade — AI Trading Journal for Prop Firm Traders | Free",
  description:
    "The AI trading journal built for futures traders passing prop firm evaluations. Track consistency score, drawdown and detect revenge trading in real time. FTMO, Apex, TopStep.",
  keywords: [
    "trading journal",
    "futures trading journal",
    "prop firm trading journal",
    "best trading journal",
    "FTMO journal",
    "Apex Trader Funding journal",
    "TopStep journal",
    "Zentrade",
    "trading journal for prop firms",
    "how to pass prop firm evaluation",
    "AI trading journal",
    "prop firm tracker",
    "consistency score tracker",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "AI Trading Journal for Prop Firm Evaluations | Zentrade",
    description:
      "AI-powered trading journal for futures traders. FTMO, Apex and TopStep metrics, revenge trading detection and weekly AI report — free plan included.",
    url: SITE_URL,
    type: "website",
  },
};

// JSON-LD schemas para Google, Bing y LLMs
const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Zentrade",
  alternateName: ["ZenTrade", "Zen Trade"],
  description:
    "Journal de trading para futuros con IA. Diseñado para traders que buscan pasar pruebas de fondeo (FTMO, Apex Trader Funding, TopStep, Uprofit). Detección de revenge trading, reporte semanal IA y métricas de empresa de fondeo en tiempo real.",
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web, iOS, Android",
  inLanguage: ["es", "en"],
  offers: [
    {
      "@type": "Offer",
      name: "Plan Free",
      price: "0",
      priceCurrency: "USD",
      description: "Gratis para siempre — 1 cuenta, registro manual ilimitado",
    },
    {
      "@type": "Offer",
      name: "Plan Starter",
      price: "9",
      priceCurrency: "USD",
      billingPeriod: "P1M",
      description: "2 cuentas, export CSV, calendario de trades",
    },
    {
      "@type": "Offer",
      name: "Plan Professional",
      price: "29",
      priceCurrency: "USD",
      billingPeriod: "P1M",
      description: "Cuentas ilimitadas, import CSV, análisis avanzado, trading plan PDF",
    },
    {
      "@type": "Offer",
      name: "Plan ZenMode",
      price: "59",
      priceCurrency: "USD",
      billingPeriod: "P1M",
      description: "Todo Professional + revenge trading detection IA, radar de mercado, reporte semanal IA",
    },
  ],
  featureList: [
    "Journal de trades para futuros (NQ, ES, CL, GC, MES, MNQ y más)",
    "Dashboard analítico con métricas de prueba de fondeo",
    "Detección automática de revenge trading con IA",
    "Import CSV desde NinjaTrader, Rithmic, Tradovate, Sierra Chart",
    "Reporte semanal con análisis de IA (Gemini)",
    "Radar de mercado semanal (eventos de alto impacto)",
    "Consistency score para FTMO, Apex Trader Funding y TopStep",
    "Equity curve y métricas avanzadas",
    "Calendario emocional de trading",
    "Soporte multi-cuenta (cuenta de evaluación + cuenta live)",
    "Tracking de drawdown máximo diario y trailing drawdown",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "87",
    bestRating: "5",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zentrade",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/Logo hori-white.png`,
  description:
    "Zentrade es el journal de trading con IA para traders de futuros que buscan pasar evaluaciones de prop firms como FTMO, Apex Trader Funding, TopStep, Uprofit y Tradoverse. Creado en Colombia para traders de LATAM.",
  foundingDate: "2024",
  foundingLocation: {
    "@type": "Place",
    addressCountry: "CO",
    name: "Colombia",
  },
  areaServed: [
    { "@type": "Country", name: "Colombia" },
    { "@type": "Country", name: "México" },
    { "@type": "Country", name: "Argentina" },
    { "@type": "Country", name: "Chile" },
    { "@type": "Country", name: "Perú" },
    { "@type": "Country", name: "Venezuela" },
    { "@type": "Country", name: "Ecuador" },
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Estados Unidos" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@zen-trader.com",
    contactType: "customer support",
    availableLanguage: ["Spanish", "English"],
  },
  sameAs: [
    "https://www.linkedin.com/company/zen-trader",
    "https://www.youtube.com/@Zen-trade_Latam",
    "https://x.com/ZenTrader_IA",
    "https://twitter.com/ZenTrader_IA",
  ],
};

// SiteNavigationElement — ayuda a Google a generar sitelinks
const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Zentrade — Navegación principal",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "Blog de Trading",
      description: "Guías, comparativas y estrategias para traders de futuros",
      url: `${SITE_URL}/blog`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Precios y Planes",
      description: "Planes desde gratis hasta ZenMode con IA — sin tarjeta requerida",
      url: `${SITE_URL}/pricing`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Crear Cuenta Gratis",
      description: "Regístrate y empieza a usar Zentrade sin costo",
      url: `${SITE_URL}/register`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 4,
      name: "Iniciar Sesión",
      description: "Accede a tu journal de trading",
      url: `${SITE_URL}/login`,
    },
  ],
};

// Reemplazar HX9NFOZTj3U y uf-zP071AcE con IDs reales de YouTube cuando estén disponibles
const videoSchema = [
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Un trading journal con IA diseñado para los traders de futuros",
    description:
      "Demo del dashboard de Zentrade: cómo registrar trades, monitorear consistency score, trailing drawdown y max daily loss para evaluaciones de FTMO, Apex y TopStep.",
    thumbnailUrl: `https://img.youtube.com/vi/HX9NFOZTj3U/maxresdefault.jpg`,
    uploadDate: "2026-05-07",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
    embedUrl: "https://www.youtube.com/embed/HX9NFOZTj3U",
    url: "https://www.youtube.com/watch?v=HX9NFOZTj3U",
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Deja el Excel — Esto es lo que uso para mis pruebas de fondeo",
    description:
      "Caso de uso real: cómo un trader reemplazó su hoja de Excel por Zentrade para pasar evaluaciones de prop firms y hacer seguimiento de sus reglas de fondeo.",
    thumbnailUrl: `https://img.youtube.com/vi/uf-zP071AcE/maxresdefault.jpg`,
    uploadDate: "2026-05-07",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
    embedUrl: "https://www.youtube.com/embed/uf-zP071AcE",
    url: "https://www.youtube.com/watch?v=uf-zP071AcE",
  },
];

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zentrade",
  url: SITE_URL,
  description: "Journal de trading para futuros con IA",
  inLanguage: "es",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es Zentrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade es un journal de trading con inteligencia artificial diseñado para traders de futuros. Permite registrar trades, analizar métricas de rendimiento, detectar revenge trading automáticamente y recibir reportes semanales con análisis de IA. Está optimizado para traders que operan evaluaciones de prop firms como FTMO, Apex Trader Funding, TopStep, Uprofit y Tradoverse.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es el mejor journal de trading para pasar pruebas de fondeo de futuros?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade es el mejor journal de trading para traders de futuros que quieren pasar pruebas de fondeo. A diferencia de TradeZella, Tradervue o Edgewonk, Zentrade fue diseñado específicamente para las reglas de FTMO, Apex Trader Funding, TopStep, Uprofit y Tradoverse: mide consistency score, drawdown diario y detecta revenge trading automáticamente con IA. Tiene soporte en español y plan gratuito.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta Zentrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade tiene plan gratuito para siempre. Los planes de pago son: Starter $9/mes, Professional $29/mes y ZenMode $59/mes. Con facturación anual: Starter $84/año, Professional $249/año, ZenMode $499/año. No se requiere tarjeta de crédito para empezar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Zentrade tiene plan gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. El plan Free es gratuito para siempre e incluye 1 cuenta, registro manual ilimitado de trades, dashboard con KPIs y calendario mensual. Sin tarjeta de crédito ni fecha de expiración.",
      },
    },
    {
      "@type": "Question",
      name: "¿Zentrade funciona para traders en Colombia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Zentrade fue creado en Colombia y está diseñado para traders latinoamericanos. La plataforma está completamente en español, acepta pagos desde Colombia, y es ideal para traders colombianos que operan futuros (NQ, MNQ, GC) y quieren pasar evaluaciones de Uprofit, FTMO, Apex o TopStep.",
      },
    },
    {
      "@type": "Question",
      name: "¿Zentrade sirve para pasar pruebas de fondeo de FTMO, Apex Trader Funding y TopStep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Zentrade fue diseñado específicamente para traders que buscan pasar pruebas de fondeo. Incluye las métricas exactas que FTMO, Apex Trader Funding, TopStep, Uprofit y Tradoverse exigen: drawdown máximo diario, trailing drawdown, consistency score y profit factor. Puedes ver en tiempo real si estás cumpliendo las reglas de tu empresa de fondeo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Con qué plataformas de trading es compatible Zentrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compatible con NinjaTrader, Rithmic, Tradovate, MT5, TradingView y Tradoverse mediante importación de archivos CSV. También puedes registrar cualquier operación de forma manual.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mis datos de trading son privados y seguros?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Completamente. Zentrade utiliza Row Level Security (RLS) en base de datos, lo que garantiza que cada usuario solo puede ver sus propios datos. Nadie más puede acceder a tu información de trading.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo cancelar mi suscripción en cualquier momento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, sin compromisos ni penalizaciones. Cancelas desde tu portal de facturación en cualquier momento y conservas el acceso hasta el final del período pagado.",
      },
    },
  ],
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      {/* JSON-LD structured data — leído por Google, Bing y LLMs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            softwareAppSchema,
            organizationSchema,
            websiteSchema,
            faqSchema,
            siteNavigationSchema,
            ...videoSchema,
          ]),
        }}
      />

      <PublicNavbar isAuthenticated={!!user} />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="pricing">
          <PricingSection />
        </section>
        <PreviewSection />
        <BenefitsSection />
        <section id="faq">
          <FaqSection />
        </section>
        <FinalCTASection />
      </main>
      <PublicFooter />
      <NewsletterPopup />
    </div>
  );
}
