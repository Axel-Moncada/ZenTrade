"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/accounts/account-card";
import { Plus, AlertCircle } from "lucide-react";
import type { Account } from "@/types/accounts";
import { useI18n } from "@/lib/i18n/context";

export default function AccountsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.accounts.loadError);
        setLoading(false);
        return;
      }

      setAccounts(data.accounts || []);
      setLoading(false);
    } catch (err) {
      setError(t.calendar.connectionError);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDeleteAccount = () => {
    // Recargar lista después de eliminar
    fetchAccounts();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zen-anti-flash">{t.accounts.title}</h1>
            <p className="text-zen-anti-flash/60 mt-2">{t.accounts.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-zen-anti-flash/60">{t.accounts.loadingAccounts}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zen-anti-flash">{t.accounts.title}</h1>
            <p className="text-zen-anti-flash/60 mt-2">{t.accounts.subtitle}</p>
          </div>
        </div>
        <div className="bg-zen-danger/10 border border-zen-danger/40 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-zen-danger mt-0.5" />
          <div>
            <h3 className="font-medium text-zen-danger">{t.accounts.loadErrorGeneric}</h3>
            <p className="text-zen-danger/80 text-sm mt-1">{error}</p>
            <Button
              size="sm"
              onClick={fetchAccounts}
              className="mt-3 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
            >
              {t.common.retry}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zen-anti-flash">{t.accounts.title}</h1>
          <p className="text-zen-anti-flash/60 mt-2">{t.accounts.subtitle}</p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button className="bg-zen-caribbean-green/80 hover:bg-zen-caribbean-green text-zen-rich-black">
            <Plus className="h-4 w-4 mr-2" />
            {t.accounts.newAccount}
          </Button>
        </Link>
      </div>

      {/* Lista de Cuentas */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-zen-surface/60 rounded-lg border border-zen-forest/40">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-zen-anti-flash mb-2">
              {t.accounts.noAccounts}
            </h3>
            <p className="text-zen-anti-flash/70 mb-6">
              {t.accounts.noAccountsDesc}
            </p>
            <Link href="/dashboard/accounts/new">
              <Button className="bg-zen-caribbean-green/70 hover:bg-zen-caribbean-green text-zen-rich-black">
                <Plus className="h-4 w-4 mr-2" />
                {t.accounts.createFirst}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-16 md:grid-cols-3 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDelete={handleDeleteAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
