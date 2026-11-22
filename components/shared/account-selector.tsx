'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useTr } from "@/lib/i18n/use-tr";

interface Account {
  id: string
  name: string
  broker: string
}

interface AccountSelectorProps {
  accounts: Account[]
  selectedAccount: string
  onAccountChange: (accountId: string) => void
}

export function AccountSelector({
  accounts,
  selectedAccount,
  onAccountChange,
}: AccountSelectorProps) {
  const { tr } = useTr();
  return (
    <div className="space-y-2">
      <Label className="text-zen-anti-flash">{tr("Cuenta de trading", "Trading account")}</Label>
      <Select value={selectedAccount} onValueChange={onAccountChange}>
        <SelectTrigger className="text-zen-anti-flash">
          <SelectValue placeholder={tr("Selecciona una cuenta", "Select an account")} />
        </SelectTrigger>
        <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id} className="hover:bg-zen-rich-black">
              {account.name} - {account.broker}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
