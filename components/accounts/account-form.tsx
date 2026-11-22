"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { Account } from "@/types/accounts";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { useTr } from "@/lib/i18n/use-tr";

interface AccountFormProps {
  account?: Account;
  mode: "create" | "edit";
}

export function AccountForm({ account, mode }: AccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planLimitReached, setPlanLimitReached] = useState(false);
  const { tr } = useTr();

  const [formData, setFormData] = useState({
    name: account?.name || "",
    account_type: account?.account_type || "evaluation",
    broker: account?.broker || "",
    platform: account?.platform || "",
    initial_balance: account?.initial_balance?.toString() || "",
    starting_balance:
      account?.starting_balance?.toString() ||
      account?.initial_balance?.toString() ||
      "",
    drawdown_type: account?.drawdown_type || "trailing",
    max_drawdown: account?.max_drawdown?.toString() || "",
    profit_target: account?.profit_target?.toString() || "",
    buffer_amount: account?.buffer_amount?.toString() || "",
    start_date: account?.start_date || new Date().toISOString().split("T")[0],
    status: account?.status || "active",
    notes: account?.notes || "",
    consistency_percent: account?.consistency_percent?.toString() || "30",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        account_type: formData.account_type,
        broker: formData.broker || null,
        platform: formData.platform || null,
        initial_balance: parseFloat(formData.initial_balance),
        starting_balance: parseFloat(formData.starting_balance),
        drawdown_type: formData.drawdown_type,
        max_drawdown: parseFloat(formData.max_drawdown),
        profit_target: formData.profit_target
          ? parseFloat(formData.profit_target)
          : null,
        buffer_amount: formData.buffer_amount
          ? parseFloat(formData.buffer_amount)
          : null,
        start_date: formData.start_date,
        status: formData.status,
        notes: formData.notes || null,
        consistency_percent: parseInt(formData.consistency_percent, 10),
      };

      const url =
        mode === "create" ? "/api/accounts" : `/api/accounts/${account?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        account?: Account;
        error?: string;
        code?: string;
        limit?: number;
      };

      if (!response.ok) {
        if (data.code === "PLAN_LIMIT_REACHED") {
          setPlanLimitReached(true);
          setLoading(false);
          return;
        }
        setError(data.error ?? tr("Error al guardar la cuenta", "Could not save the account"));
        setLoading(false);
        return;
      }

      router.push("/dashboard/accounts");
      router.refresh();
    } catch (err) {
      setError(tr("Error de conexión", "Connection error"));
      setLoading(false);
    }
  };

  // Shared input class — account-input for CSS light-mode targeting
  const inputCls =
    "account-input border-zen-bangladesh-green bg-zen-bangladesh-green/40 text-zen-anti-flash placeholder:text-zen-anti-flash/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  // Shared select trigger class
  const selectTriggerCls =
    "border-zen-bangladesh-green bg-zen-bangladesh-green/40 text-zen-anti-flash";

  // Límite de plan alcanzado: reemplazar el formulario con el upgrade prompt
  if (planLimitReached) {
    return (
      <div className="max-w-md mx-auto pt-4 space-y-4">
        <UpgradePrompt
          requiredPlan="pro"
          variant="card"
          message={{ es: "Alcanzaste el límite de cuentas de tu plan actual", en: "You reached your plan's account limit" }}
        />
        <p className="text-center text-sm text-zen-text-muted">
          {tr(
            "Professional incluye cuentas ilimitadas para gestionar todas tus evaluaciones y cuentas live.",
            "Professional includes unlimited accounts to track every evaluation and live account."
          )}
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-zen-dark-green border border-zen-forest/40 px-10 rounded-xl">
      <CardHeader>
        <CardTitle className="text-zen-anti-flash">
          {mode === "create" ? tr("Nueva Cuenta", "New Account") : tr("Editar Cuenta", "Edit Account")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 bg-zen-danger/10 border border-zen-danger/40 text-zen-danger px-4 py-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zen-anti-flash">
                {tr("Nombre", "Name")} <span className="text-zen-danger">*</span>
              </Label>
              <Input
                id="name"
                placeholder={tr("Ej: Prop FTMO 50k", "e.g. Apex 50K Eval")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Tipo de Cuenta */}
            <div className="space-y-2">
              <Label htmlFor="account_type" className="text-zen-anti-flash">
                {tr("Tipo de Cuenta", "Account Type")} <span className="text-zen-danger">*</span>
              </Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, account_type: value as "evaluation" | "live" })
                }
                disabled={loading}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                  <SelectItem value="evaluation" className="hover:bg-zen-rich-black">{tr("Evaluación", "Evaluation")}</SelectItem>
                  <SelectItem value="live" className="hover:bg-zen-rich-black">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Broker */}
            <div className="space-y-2">
              <Label htmlFor="broker" className="text-zen-anti-flash">{tr("Broker", "Prop firm / Broker")}</Label>
              <Input
                id="broker"
                placeholder={tr("Ej: FTMO, Apex, TopStep", "e.g. Apex, TopStep, FTMO")}
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Plataforma */}
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-zen-anti-flash">{tr("Plataforma", "Platform")}</Label>
              <Input
                id="platform"
                placeholder={tr("Ej: NinjaTrader, Tradovate", "e.g. NinjaTrader, Tradovate")}
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Balance Inicial */}
            <div className="space-y-2">
              <Label htmlFor="initial_balance" className="text-zen-anti-flash">
                {tr("Balance Inicial del Broker", "Account Starting Balance")} <span className="text-zen-danger">*</span>
              </Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50000.00"
                value={formData.initial_balance}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    initial_balance: value,
                    starting_balance: formData.starting_balance || value,
                  });
                }}
                required
                disabled={loading}
                className={inputCls}
              />
              <p className="text-xs text-zen-anti-flash/50">
                {tr("Balance con el que el broker te dio la cuenta", "The balance your prop firm or broker gave you")}
              </p>
            </div>

            {/* Balance al Iniciar Tracking */}
            <div className="space-y-2">
              <Label htmlFor="starting_balance" className="text-zen-anti-flash">
                {tr("Balance al Iniciar Tracking", "Balance When You Started Tracking")} <span className="text-zen-danger">*</span>
              </Label>
              <Input
                id="starting_balance"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50000.00"
                value={formData.starting_balance}
                onChange={(e) =>
                  setFormData({ ...formData, starting_balance: e.target.value })
                }
                required
                disabled={loading}
                className={inputCls}
              />
              <p className="text-xs text-zen-anti-flash/50">
                {tr("Balance real cuando empezaste a usar ZenTrade (si difiere del inicial)", "Your actual balance when you started using ZenTrade (if different)")}
              </p>
            </div>

            {/* Tipo de Drawdown */}
            <div className="space-y-2">
              <Label htmlFor="drawdown_type" className="text-zen-anti-flash">
                {tr("Tipo de Drawdown", "Drawdown Type")} <span className="text-zen-danger">*</span>
              </Label>
              <Select
                value={formData.drawdown_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, drawdown_type: value as "trailing" | "static" })
                }
                disabled={loading}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                  <SelectItem value="trailing" className="hover:bg-zen-rich-black">Trailing</SelectItem>
                  <SelectItem value="static" className="hover:bg-zen-rich-black">{tr("Estático", "Static")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Máximo Drawdown */}
            <div className="space-y-2">
              <Label htmlFor="max_drawdown" className="text-zen-anti-flash">
                {tr("Drawdown Máximo (USD)", "Max Drawdown (USD)")} <span className="text-zen-danger">*</span>
              </Label>
              <Input
                id="max_drawdown"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="2500.00"
                value={formData.max_drawdown}
                onChange={(e) =>
                  setFormData({ ...formData, max_drawdown: e.target.value })
                }
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Objetivo de Ganancia */}
            <div className="space-y-2">
              <Label htmlFor="profit_target" className="text-zen-anti-flash">
                {tr("Objetivo de Ganancia (USD)", "Profit Target (USD)")}
              </Label>
              <Input
                id="profit_target"
                type="number"
                step="0.01"
                min="0"
                placeholder="3000.00"
                value={formData.profit_target}
                onChange={(e) =>
                  setFormData({ ...formData, profit_target: e.target.value })
                }
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Colchón */}
            <div className="space-y-2">
              <Label htmlFor="buffer_amount" className="text-zen-anti-flash">
                {tr("Colchón de Seguridad (USD)", "Safety Buffer (USD)")}
              </Label>
              <Input
                id="buffer_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={formData.buffer_amount}
                onChange={(e) =>
                  setFormData({ ...formData, buffer_amount: e.target.value })
                }
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-zen-anti-flash">
                {tr("Fecha de Inicio", "Start Date")} <span className="text-zen-danger">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                max={new Date().toISOString().split("T")[0]}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-zen-anti-flash">{tr("Estado", "Status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "active" | "passed" | "failed" | "inactive",
                  })
                }
                disabled={loading}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                  <SelectItem value="active" className="hover:bg-zen-rich-black">{tr("Activa", "Active")}</SelectItem>
                  <SelectItem value="passed" className="hover:bg-zen-rich-black">{tr("Aprobada", "Passed")}</SelectItem>
                  <SelectItem value="failed" className="hover:bg-zen-rich-black">{tr("Fallida", "Failed")}</SelectItem>
                  <SelectItem value="inactive" className="hover:bg-zen-rich-black">{tr("Inactiva", "Inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Regla de Consistencia */}
            <div className="space-y-2">
              <Label htmlFor="consistency_percent" className="text-zen-anti-flash">
                {tr("Regla de Consistencia", "Consistency Rule")}
              </Label>
              <Select
                value={formData.consistency_percent}
                onValueChange={(value) =>
                  setFormData({ ...formData, consistency_percent: value })
                }
                disabled={loading}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                  <SelectItem value="20" className="hover:bg-zen-rich-black">20% </SelectItem>
                  <SelectItem value="25" className="hover:bg-zen-rich-black">25% </SelectItem>
                  <SelectItem value="30" className="hover:bg-zen-rich-black">30% </SelectItem>
                  <SelectItem value="35" className="hover:bg-zen-rich-black">35% </SelectItem>
                  <SelectItem value="40" className="hover:bg-zen-rich-black">40%</SelectItem>
                  <SelectItem value="45" className="hover:bg-zen-rich-black">45%</SelectItem>
                  <SelectItem value="50" className="hover:bg-zen-rich-black">50%</SelectItem>
                  <SelectItem value="55" className="hover:bg-zen-rich-black">55%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zen-anti-flash/50">
                {tr("% máximo que un solo trade puede representar del total de ganancias", "Max % of total profit a single trade can represent")}
              </p>
            </div>
          </div>

          {/* Notas — Full Width */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-zen-anti-flash">{tr("Notas", "Notes")}</Label>
            <Textarea
              id="notes"
              placeholder={tr("Notas adicionales sobre esta cuenta...", "Anything else about this account...")}
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              className={inputCls}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="border-zen-forest/40 text-zen-anti-flash hover:bg-zen-caribbean-green/10"
            >
              {tr("Cancelar", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading} variant="zenGreen">
              {loading
                ? tr("Guardando...", "Saving...")
                : mode === "create"
                ? tr("Crear Cuenta", "Create Account")
                : tr("Guardar Cambios", "Save Changes")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
