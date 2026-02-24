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
        <SelectTrigger className="border-zen-anti-flash/20 text-zen-anti-flash bg-zen-dark-green hover:border-zen-anti-flash/40">
          <SelectValue placeholder="Selecciona una cuenta" />
        </SelectTrigger>
        <SelectContent className="border-zen-anti-flash/20 bg-zen-dark-green text-zen-anti-flash">
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name} - {account.broker}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
