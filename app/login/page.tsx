"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { ArrowLeft, LogIn, UserPlus, CheckCircle2 } from "lucide-react";
import logoZen from "@/data/assets/Logo-white.png";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrarse");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "Cuenta creada exitosamente. Revisa tu email.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);

      // Cambiar a modo login después de 2 segundos
      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center  ">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 main-bg-login"
        
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 main-bg-login " />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-zen-anti-flash hover:text-zen-caribbean-green transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Auth Card */}
        <div className="bg-zen-surface-elevated rounded-3xl border border-zen-caribbean-green/30  shadow-zen-caribbean-green shadow-[0px_0_150px_rgba(0,0,0,0.5)] p-8 ">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <Image src={logoZen} alt="ZenTrade Logo" className="mx-auto mb-4 w-80" />
           
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-zen-surface rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
                setConfirmPassword("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                mode === "login"
                  ? "bg-zen-caribbean-green text-zen-rich-black shadow-lg"
                  : "text-zen-text-muted hover:text-zen-anti-flash"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                mode === "register"
                  ? "bg-zen-caribbean-green text-zen-rich-black shadow-lg"
                  : "text-zen-text-muted hover:text-zen-anti-flash"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 bg-zen-caribbean-green/10 border-zen-caribbean-green/50 text-zen-caribbean-green">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In */}
          <div className="mb-6">
            <GoogleSignInButton />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zen-border-soft" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zen-surface-elevated px-3 text-zen-text-muted">
                {mode === "login" ? "O continúa con email" : "O regístrate con email"}
              </span>
            </div>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zen-anti-flash">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zen-anti-flash">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
              </div>

              <Button
                type="submit"
                variant="zenGreen"
                className="w-full group"
                disabled={loading}
              >
                {loading ? (
                  "Iniciando sesión..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-zen-anti-flash">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-zen-anti-flash">
                  Contraseña
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
                <p className="text-xs text-zen-text-muted">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-zen-anti-flash">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
              </div>

              <Button
                type="submit"
                variant="zenGreen"
                className="w-full group"
                disabled={loading}
              >
                {loading ? (
                  "Creando cuenta..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Cuenta Gratis
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-zen-text-muted text-sm mt-8">
          {mode === "login"
            ? "Tu trading journal profesional"
            : "Sin tarjeta de crédito • Setup en 2 minutos"}
        </p>
      </div>
    </div>
  );
}
