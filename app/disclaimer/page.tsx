import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import LegalContent from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Aviso legal de Zentrade. La plataforma no proporciona asesoría financiera.",
  alternates: { canonical: "https://zen-trader.com/disclaimer" },
  robots: { index: true, follow: false },
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
