import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import LegalContent from "@/components/legal/legal-content";

export const metadata = {
  title: "Política de Reembolsos — ZenTrade",
  description: "Política de reembolsos y cancelaciones de ZenTrade. Pagos procesados por Lemon Squeezy.",
};

export default async function RefundsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="legal-page-bg min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      <PublicNavbar isAuthenticated={!!user} />
      <LegalContent pageKey="refunds" />
      <PublicFooter />
    </div>
  );
}
