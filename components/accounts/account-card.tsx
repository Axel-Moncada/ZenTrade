"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import type { Account } from "@/types/accounts";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_COLORS,
  DRAWDOWN_TYPE_LABELS,
} from "@/types/accounts";

interface AccountCardProps {
  account: Account;
  onDelete?: () => void;
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Error al eliminar la cuenta");
        return;
      }

      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  // Cálculos para métricas
  const tradePnL = account.current_balance - account.starting_balance - (account.manual_adjustments || 0);
  const balanceChange = account.current_balance - account.starting_balance;
  const balanceChangePercent =
    (balanceChange / account.starting_balance) * 100;

  const remainingDrawdown =
    account.current_balance - (account.starting_balance - account.max_drawdown);
  const drawdownUsedPercent =
    ((account.starting_balance - account.current_balance) /
      account.max_drawdown) *
    100;

  // Progreso hacia el objetivo (basado en initial_balance para evaluaciones)
  const profitProgress = account.profit_target
    ? ((account.current_balance - account.initial_balance) / account.profit_target) * 100
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow border-zen-forest/50 rounded-xl backdrop-blur-sm p-6 bg-zen-bangladesh-green/60">
      <CardHeader>
        <div className="flex items-start justify-between text-zen-anti-flash">
          <div className="flex-1">
            <CardTitle className="text-2xl">{account.name}</CardTitle>
            <CardDescription className="mt-1">
              {account.broker && `${account.broker} · `}
              {account.platform || "Sin plataforma"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={ACCOUNT_TYPE_COLORS[account.account_type]}>
              {ACCOUNT_TYPE_LABELS[account.account_type]}
            </Badge>
            <Badge className={ACCOUNT_STATUS_COLORS[account.status]}>
              {ACCOUNT_STATUS_LABELS[account.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance Actual */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-zen-anti-flash">Balance Actual</span>
            <span className="text-2xl text-zen-caribbean-green font-bold bg-zen-bangladesh-green/80 px-4 py-1 rounded-full">
              ${account.current_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* Desglose del balance */}
          <div className="mt-2 p-3 bg-zen-rich-black/40 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between text-zen-anti-flash/70">
              <span>Balance al Iniciar:</span>
              <span className="font-medium">${account.starting_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-zen-anti-flash/70">
              <span>P&L Trades:</span>
              <span className={`font-medium ${tradePnL >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}`}>
                {tradePnL >= 0 ? "+" : ""}${tradePnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {account.manual_adjustments && account.manual_adjustments !== 0 && (
              <div className="flex justify-between text-zen-anti-flash/70">
                <span>Ajustes (Depósitos/Retiros):</span>
                <span className={`font-medium ${account.manual_adjustments >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}`}>
                  {account.manual_adjustments >= 0 ? "+" : ""}${account.manual_adjustments.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="pt-1.5 border-t border-zen-border-soft/30 flex justify-between text-zen-anti-flash font-semibold">
              <span>Balance Actual:</span>
              <span className={balanceChange >= 0 ? "text-zen-caribbean-green" : "text-zen-danger"}>
                {balanceChange >= 0 ? "+" : ""}${balanceChange.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({balanceChangePercent >= 0 ? "+" : ""}{balanceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar - Objetivo */}
        {account.profit_target && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zen-anti-flash mt-5">Progreso Objetivo</span>
              <span className="font-medium text-zen-anti-flash">{profitProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zen-rich-black/70 rounded-full h-3">
              <div
                className="bg-zen-caribbean-green h-3 rounded-full transition-all"
                style={{ width: `${Math.min(profitProgress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-zen-anti-flash mt-1">
              Meta: ${account.profit_target.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {/* Drawdown */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-zen-anti-flash">
              Drawdown ({DRAWDOWN_TYPE_LABELS[account.drawdown_type]})
            </span>
            <span
              className={`font-medium ${
                drawdownUsedPercent > 80 ? "text-red-600" : "text-zen-anti-flash"
              }`}
            >
              {drawdownUsedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-zen-rich-black/70 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                drawdownUsedPercent > 80
                  ? "bg-red-600"
                  : drawdownUsedPercent > 50
                  ? "bg-yellow-500"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(drawdownUsedPercent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zen-anti-flash mt-1">
            Máximo: ${account.max_drawdown.toLocaleString("en-US", { minimumFractionDigits: 2 })} · 
            Disponible: ${remainingDrawdown.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Información adicional */}
        <div className="pt-10 text-xs text-zen-anti-flash">
          <div>Fecha de inicio: {new Date(account.start_date).toLocaleDateString("es-ES")}</div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-3">
          <Link href={`/dashboard/accounts/${account.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-zen-caribbean-green hover:bg-zen-caribbean-green/70 font-bold border-0  hover:text-zen-rich-black" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Ver / Editar
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button  size="sm" className="bg-red-800/90 text-red-200 hover:text-red-700 hover:bg-red-100/90 w-20">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la cuenta {`"${account.name}"`} y
                  todos sus trades asociados. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
