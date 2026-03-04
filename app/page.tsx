import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/landing/sections/hero-section";
import ProblemSection from "@/components/landing/sections/problem-section";
import SolutionSection from "@/components/landing/sections/solution-section";
import FeaturesSection from "@/components/landing/sections/features-section";
import PricingSection from "@/components/landing/sections/pricing-section";
import PreviewSection from "@/components/landing/sections/preview-section";
import BenefitsSection from "@/components/landing/sections/benefits-section";
import FaqSection from "@/components/landing/sections/faq-section";
import FinalCTASection from "@/components/landing/sections/final-cta-section";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import NewsletterPopup from "@/components/landing/newsletter-popup";

export const metadata = {
  title: "ZenTrade - Trading Journal Profesional para Traders",
  description:
    "Gestiona múltiples cuentas, analiza tus trades y pasa evaluaciones de prop firms. Dashboard analítico con métricas en tiempo real. Ideal para FTMO, TopStepTrader y más.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Landing page is always visible, navbar adapts based on auth state
  return (
    <div className="min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      <PublicNavbar isAuthenticated={!!user} />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <PricingSection />
        {/* <PreviewSection /> */}{/* TODO: descomentar cuando el video esté listo */}
        <BenefitsSection />
        <FaqSection />
        <FinalCTASection />
      </main>
      <PublicFooter />
      <NewsletterPopup />
    </div>
  );
}
