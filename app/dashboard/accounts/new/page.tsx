"use client";

import { useEffect, useState } from "react";
import { AccountForm } from "@/components/accounts/account-form";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/hooks/usePlan";

export default function NewAccountPage() {
  const plan = usePlan();
  const [accountCount, setAccountCount] = useState<number | null>(null);

  useEffect(() => {
    if (plan.loading) return;

    async function fetchCount() {
      const res = await fetch("/api/accounts");
      if (!res.ok) return;
      const data = (await res.json()) as { accounts?: unknown[] };
      setAccountCount(data.accounts?.length ?? 0);
    }

    fetchCount();
  }, [plan.loading]);

  const accountLimit: number | null = plan.isFree ? 1 : plan.isStarter ? 2 : null;
  const isAtLimit =
    accountLimit !== null &&
    accountCount !== null &&
    accountCount >= accountLimit;

  const isLoading = plan.loading || accountCount === null;

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
        <h1 className="text-3xl font-bold text-zen-anti-flash">Nueva Cuenta</h1>
        <p className="text-zen-anti-flash/60 mt-2">
          Crea una nueva cuenta de trading para comenzar a registrar tus operaciones
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-zen-anti-flash/40 text-sm">Cargando...</div>
        </div>
      ) : isAtLimit ? (
        <div className="max-w-md mx-auto pt-4 space-y-4">
          <UpgradePrompt
            requiredPlan="pro"
            variant="card"
            message={`Alcanzaste el límite de ${accountLimit} cuenta${accountLimit === 1 ? "" : "s"} de tu plan actual`}
          />
          <p className="text-center text-sm text-zen-text-muted">
            Professional incluye cuentas ilimitadas para gestionar todas tus evaluaciones y cuentas live al mismo tiempo.
          </p>
        </div>
      ) : (
        <AccountForm mode="create" />
      )}
    </div>
  );
}
