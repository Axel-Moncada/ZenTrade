"use client";

import { Account } from '@/types/accounts';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountsProgressProps {
  accounts: Account[];
  selectedAccountId?: string | null;
}

export function AccountsProgress({ accounts, selectedAccountId }: AccountsProgressProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zen-bangladesh-green/50 to-zen-dark-green/50 backdrop-blur-sm border border-zen-rich-black/50 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Wallet className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Estado de Cuentas</h3>
          <p className="text-xs text-slate-400">Progreso vs balance inicial</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zen-rich-black/50">
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cuenta
              </th>
              <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Balance Inicial
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Balance Actual
              </th>
              <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Progreso
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => {
              const growth = account.initial_balance > 0
                ? ((account.current_balance - account.initial_balance) / account.initial_balance) * 100
                : 0;

              const ratio = account.initial_balance > 0
                ? Math.max(0, Math.min((account.current_balance / account.initial_balance) * 100, 200))
                : 0;

              const isSelected = selectedAccountId === account.id;
              const isPositive = growth >= 0;

              return (
                <tr
                  key={account.id}
                  className={cn(
                    "border-b border-zen-rich-black/30 hover:bg-zen-bangladesh-green/50 transition-colors",
                    index % 2 === 0 ? 'bg-zen-rich-black/20' : 'bg-transparent',
                    isSelected && 'ring-2 ring-zen-dark-green/50'
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {account.name}
                      </p>
                      {isSelected && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                          ACTIVA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-xs font-medium text-slate-300 capitalize">
                      {account.account_type}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className="text-sm font-semibold text-slate-300"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${account.initial_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={cn(
                      "text-sm font-bold",
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    )}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${account.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className={cn(
                        "text-sm font-bold",
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      )}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {isPositive ? '+' : ''}{growth.toFixed(2)}%
                      </span>
                      <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
