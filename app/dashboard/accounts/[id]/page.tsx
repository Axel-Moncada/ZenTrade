import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { AccountForm } from "@/components/accounts/account-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Account } from "@/types/accounts";

interface AccountDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener cuenta
  const { data: account, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !account) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cuentas
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Cuenta</h1>
        <p className="text-gray-600 mt-2">
          Modifica la información de tu cuenta de trading
        </p>
      </div>

      {/* Formulario */}
      <AccountForm mode="edit" account={account as Account} />
    </div>
  );
}
