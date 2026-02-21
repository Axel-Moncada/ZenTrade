import { AccountForm } from "@/components/accounts/account-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewAccountPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cuentas
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nueva Cuenta</h1>
        <p className="text-zen-anti-flash mt-2">
          Crea una nueva cuenta de trading para comenzar a registrar tus operaciones
        </p>
      </div>

      {/* Formulario */}
      <AccountForm mode="create" />
    </div>
  );
}
