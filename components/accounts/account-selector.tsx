"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
}

export function AccountSelector({
  accounts,
  value,
  onValueChange,
  placeholder = "Seleccionar cuenta",
  label = "Cuenta",
  showLabel = true,
  allowAll = false,
}: AccountSelectorProps) {
  return (
    <div className="space-y-2">
      {showLabel && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
          {allowAll && <SelectItem value="all">Todas las cuentas</SelectItem>}
          {accounts.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-gray-500">
              No hay cuentas disponibles
            </div>
          ) : (
            accounts.map((account) => (
              <SelectItem key={account.id} value={account.id} className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
                <div className="flex items-center gap-2  ">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-gray-500">
                    ({ACCOUNT_TYPE_LABELS[account.account_type]})
                  </span>
                  <span className="text-xs text-gray-400">
                    - ${account.current_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
