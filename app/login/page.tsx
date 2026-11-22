"use client";

import { useEffect, useState } from "react";
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
import { useI18n } from "@/lib/i18n/context";
import { getAttribution } from "@/lib/analytics/attribution";
import { track } from "@/lib/analytics/track";

const COPY = {
  en: {
    loginError: "Could not sign in",
    registerError: "Could not create your account",
    connectionError: "Connection error. Please try again.",
    passwordMismatch: "Passwords don't match",
    registerSuccess: "Account created. Check your email to confirm it.",
    back: "Back to home",
    login: "Log in",
    register: "Sign up",
    orLogin: "Or continue with email",
    orRegister: "Or sign up with email",
    password: "Password",
    confirmPassword: "Confirm password",
    minChars: "At least 6 characters",
    signingIn: "Signing in...",
    creating: "Creating account...",
    createFree: "Create free account",
    footerLogin: "Your professional trading journal",
    footerRegister: "No credit card required · Set up in 2 minutes",
    emailPlaceholder: "you@email.com",
  },
  es: {
    loginError: "Error al iniciar sesión",
    registerError: "Error al registrarse",
    connectionError: "Error de conexión",
    passwordMismatch: "Las contraseñas no coinciden",
    registerSuccess: "Cuenta creada exitosamente. Revisa tu email.",
    back: "Volver al inicio",
    login: "Iniciar Sesión",
    register: "Registrarse",
    orLogin: "O continúa con email",
    orRegister: "O regístrate con email",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    minChars: "Mínimo 6 caracteres",
    signingIn: "Iniciando sesión...",
    creating: "Creando cuenta...",
    createFree: "Crear Cuenta Gratis",
    footerLogin: "Tu trading journal profesional",
    footerRegister: "Sin tarjeta de crédito · Setup en 2 minutos",
    emailPlaceholder: "tu@email.com",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { locale } = useI18n();
  const c = COPY[locale];

  // /register y los CTAs de "Sign up" llegan con ?mode=register
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "register") {
      setMode("register");
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, attribution: getAttribution() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || c.loginError);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(c.connectionError);
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(c.passwordMismatch);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, attribution: getAttribution() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || c.registerError);
        setLoading(false);
        return;
      }

      track("sign_up", { method: "email" });
      setSuccess(data.message || c.registerSuccess);
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
      setError(c.connectionError);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen min-h-svh flex flex-col items-center justify-center">
      {/* Background — fixed para cubrir toda la pantalla incluyendo scroll */}
      <div className="fixed inset-0 main-bg-login" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 py-8">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-zen-anti-flash hover:text-zen-caribbean-green transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{c.back}</span>
        </Link>

        {/* Auth Card */}
        <div className="bg-zen-surface-elevated rounded-3xl border border-zen-caribbean-green/30 shadow-zen-caribbean-green shadow-[0px_0_100px_rgba(0,0,0,0.5)] p-5 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <Image src={logoZen} alt="ZenTrade Logo" className="mx-auto mb-4 w-52 sm:w-80" />
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
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-sm sm:text-base font-medium whitespace-nowrap transition-all ${
                mode === "login"
                  ? "bg-zen-caribbean-green text-zen-rich-black shadow-lg"
                  : "text-zen-text-muted hover:text-zen-anti-flash"
              }`}
            >
              {c.login}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-sm sm:text-base font-medium whitespace-nowrap transition-all ${
                mode === "register"
                  ? "bg-zen-caribbean-green text-zen-rich-black shadow-lg"
                  : "text-zen-text-muted hover:text-zen-anti-flash"
              }`}
            >
              {c.register}
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
          <div className="mb-4 sm:mb-6">
            <GoogleSignInButton />
          </div>

          {/* Divider */}
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zen-border-soft" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zen-surface-elevated px-3 text-zen-text-muted">
                {mode === "login" ? c.orLogin : c.orRegister}
              </span>
            </div>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zen-anti-flash">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={c.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zen-anti-flash">
                  {c.password}
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
                  c.signingIn
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {c.login}
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-zen-anti-flash">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder={c.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-zen-surface border-zen-border-soft text-zen-anti-flash placeholder:text-zen-text-muted focus:border-zen-caribbean-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-zen-anti-flash">
                  {c.password}
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
                  {c.minChars}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-zen-anti-flash">
                  {c.confirmPassword}
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
                  c.creating
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {c.createFree}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-zen-text-muted text-sm mt-6 sm:mt-8">
          {mode === "login"
            ? c.footerLogin
            : c.footerRegister}
        </p>
      </div>
    </div>
  );
}
