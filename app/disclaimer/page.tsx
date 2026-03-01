import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import LegalContent from "@/components/legal/legal-content";

export const metadata = {
  title: "Aviso Legal — ZenTrade",
  description: "Aviso legal importante: ZenTrade no proporciona asesoría financiera. Lee el descargo de responsabilidad completo.",
};

export default async function DisclaimerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="legal-page-bg min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      <PublicNavbar isAuthenticated={!!user} />
      <LegalContent pageKey="disclaimer" />
      <PublicFooter />
    </div>
  );
}
