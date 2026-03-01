import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import LegalContent from "@/components/legal/legal-content";

export const metadata = {
  title: "Términos de Servicio — ZenTrade",
  description: "Términos y condiciones de uso de la plataforma ZenTrade.",
};

export default async function TermsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="legal-page-bg min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      <PublicNavbar isAuthenticated={!!user} />
      <LegalContent pageKey="terms" />
      <PublicFooter />
    </div>
  );
}
