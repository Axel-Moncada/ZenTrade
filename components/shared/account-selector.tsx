'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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
  return (
    <div className="space-y-2">
      <Label>Cuenta de trading</Label>
      <Select value={selectedAccount} onValueChange={onAccountChange}>
        <SelectTrigger  className="bg-zen-surface/60 border-zen-forest/40 text-zen-anti-flash">
          <SelectValue placeholder="Selecciona una cuenta" />
        </SelectTrigger>
        <SelectContent className="bg-zen-dark-green border border-zen-forest text-zen-anti-flash">
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id} className="focus:bg-zen-bangladesh-green/50 focus:text-zen-anti-flash data-[highlighted]:bg-zen-bangladesh-green/50 data-[highlighted]:text-zen-anti-flash">
              {account.name} - {account.broker}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
