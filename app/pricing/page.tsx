import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PricingSection from "@/components/landing/sections/pricing-section";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Planes y Precios de Zentrade — Desde Gratis | Journal de Trading",
  description:
    "Zentrade tiene plan gratuito para siempre. Starter desde $9/mes, Professional $29/mes y ZenMode con IA desde $59/mes. Sin tarjeta de crédito requerida.",
  keywords: [
    "precio Zentrade",
    "cuánto cuesta Zentrade",
    "Zentrade plan gratuito",
    "Zentrade planes",
    "journal trading precio",
    "journal trading gratis",
    "Zentrade vs TradeZella precio",
    "journal trading Colombia precio",
    "plan journal trading futuros",
  ],
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Planes y Precios | Zentrade — Journal de Trading para Prop Firms",
    description:
      "Plan gratuito disponible. Planes pagos desde $9/mes con métricas de prop firm, dashboard analítico e IA para detectar revenge trading.",
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
};

const pricingFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta Zentrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade tiene 4 planes: Free (gratis para siempre), Starter a $9/mes, Professional a $29/mes y ZenMode a $59/mes. Los planes anuales tienen descuento: Starter $84/año, Professional $249/año y ZenMode $499/año. Ningún plan requiere tarjeta de crédito para empezar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Zentrade tiene plan gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. El plan Free de Zentrade es gratuito para siempre e incluye 1 cuenta de trading, registro manual ilimitado de trades, dashboard básico con KPIs y calendario mensual. No tiene fecha de expiración ni requiere tarjeta de crédito.",
      },
    },
    {
      "@type": "Question",
      name: "¿Zentrade es más barato que TradeZella?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Zentrade es más económico y tiene plan gratuito permanente. Además, Zentrade está diseñado específicamente para traders de futuros en evaluaciones de prop firms, con funciones que TradeZella no tiene: detección automática de revenge trading con IA, radar de mercado semanal y soporte completo en español.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo cancelar mi suscripción en cualquier momento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, sin compromisos ni penalizaciones. Cancelas desde tu panel de facturación en cualquier momento y conservas el acceso hasta el final del período pagado.",
      },
    },
    {
      "@type": "Question",
      name: "¿El plan Professional incluye análisis con inteligencia artificial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El plan Professional incluye reportes semanales con análisis de IA basado en tus trades, emociones y horarios. El plan ZenMode además incluye detección automática de revenge trading en tiempo real y radar de mercado semanal con eventos de alto impacto.",
      },
    },
  ],
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }}
      />

      <PublicNavbar isAuthenticated={!!user} />

      <main className="pt-20">
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-zen-caribbean-green font-semibold mb-3">
            Planes y Precios
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-zen-anti-flash mb-4">
            Empieza gratis. Escala cuando estés listo.
          </h1>
          <p className="text-zen-anti-flash/60 text-lg max-w-xl mx-auto">
            Sin tarjeta de crédito requerida. Sin compromisos. Cancela cuando quieras.
          </p>
        </div>

        <PricingSection />
      </main>

      <PublicFooter />
    </div>
  );
}
