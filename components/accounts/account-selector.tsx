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
        <SelectContent className="text-zen-caribbean-green bg-zen-dark-green   ">
          {allowAll && <SelectItem value="all">Todas las cuentas</SelectItem>}
          {accounts.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-zen-caribbean-green ">
              No hay cuentas disponibles
            </div>
          ) : (
            accounts.map((account) => (
              <SelectItem key={account.id} value={account.id} className='hover:bg-zen-rich-black'>
                <div className="flex items-center gap-2 text-zen-caribbean-green ">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-zen-caribbean-green/70">
                    ({ACCOUNT_TYPE_LABELS[account.account_type]})
                  </span>
                  <span className="text-xs text-zen-caribbean-green/70">
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
