"use client";

import { useEffect, useState } from "react";
import { AccountForm } from "@/components/accounts/account-form";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/hooks/usePlan";
import { useTr } from "@/lib/i18n/use-tr";

export default function NewAccountPage() {
  const { tr } = useTr();
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
            {tr("Volver a Cuentas", "Back to Accounts")}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zen-anti-flash">{tr("Nueva Cuenta", "New Account")}</h1>
        <p className="text-zen-anti-flash/60 mt-2">
          {tr("Crea una nueva cuenta de trading para comenzar a registrar tus operaciones", "Create a trading account to start logging your trades")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-zen-anti-flash/40 text-sm">{tr("Cargando...", "Loading...")}</div>
        </div>
      ) : isAtLimit ? (
        <div className="max-w-md mx-auto pt-4 space-y-4">
          <UpgradePrompt
            requiredPlan="pro"
            variant="card"
            message={{
              es: `Alcanzaste el límite de ${accountLimit} cuenta${accountLimit === 1 ? "" : "s"} de tu plan actual`,
              en: `You reached your plan's limit of ${accountLimit} account${accountLimit === 1 ? "" : "s"}`,
            }}
          />
          <p className="text-center text-sm text-zen-text-muted">
            {tr("Professional incluye cuentas ilimitadas para gestionar todas tus evaluaciones y cuentas live al mismo tiempo.", "Professional includes unlimited accounts so you can track every evaluation and live account at once.")}
          </p>
        </div>
      ) : (
        <AccountForm mode="create" />
      )}
    </div>
  );
}
