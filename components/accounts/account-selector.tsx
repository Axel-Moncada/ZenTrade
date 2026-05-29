"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import type { Account } from "@/types/accounts";
import { ACCOUNT_TYPE_LABELS } from "@/types/accounts";

interface AccountSelectorProps {
  accounts: Account[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  allowAll?: boolean;
  hideFailed?: boolean;
  /** Si true, muestra solo el icono como trigger (para mobile compact bar) */
  compact?: boolean;
}

export function AccountSelector({
  accounts,
  value,
  onValueChange,
  placeholder = "Seleccionar cuenta",
  label = "Cuenta",
  showLabel = true,
  allowAll = false,
  hideFailed = true,
  compact = false,
}: AccountSelectorProps) {
  const visibleAccounts = hideFailed
    ? accounts.filter((a) => a.status !== "failed")
    : accounts;

  return (
    <div className={compact ? "" : "space-y-2 min-w-0 flex-1"}>
      {showLabel && !compact && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={
            compact
              ? "w-9 h-9 p-0 justify-center rounded-lg border-zen-caribbean-green/40 bg-transparent [&>svg:last-child]:hidden"
              : "w-full min-w-0"
          }
        >
          {compact ? (
            <Wallet className="h-4 w-4 text-zen-caribbean-green" />
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
          {allowAll && <SelectItem value="all">Todas las cuentas</SelectItem>}
          {visibleAccounts.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-zen-caribbean-green">
              No hay cuentas disponibles
            </div>
          ) : (
            visibleAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id} className="hover:bg-zen-rich-black">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden text-zen-caribbean-green">
                  <span className="font-medium truncate">{account.name}</span>
                  <span className="text-xs text-zen-caribbean-green/60 shrink-0 whitespace-nowrap">
                    · {ACCOUNT_TYPE_LABELS[account.account_type]}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
