import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { attributionSchema, type Attribution } from "@/lib/analytics/attribution";

export type SignupMethod = "email" | "google";

// Ventana para considerar "registro nuevo" (cubre a quien confirma el email días después)
const NEW_SIGNUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Se llama en el callback de auth (confirmación de email o Google OAuth).
 * Si es el primer paso por aquí de un usuario recién creado, guarda la atribución
 * first-touch en `profiles` y devuelve el método para disparar `sign_up` una sola vez.
 * Devuelve null si no es un registro nuevo (login normal) o si ya se contó.
 */
export async function trackSignupCompletion(
  user: User,
  cookieAttribution: Attribution | null
): Promise<SignupMethod | null> {
  const createdAt = new Date(user.created_at).getTime();
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > NEW_SIGNUP_WINDOW_MS) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("signup_tracked_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.signup_tracked_at) return null;

  // La cookie manda; si el email se confirmó en otro dispositivo, usamos lo guardado al registrarse
  const fromMetadata = attributionSchema.safeParse(user.user_metadata?.attribution);
  const attribution: Attribution = cookieAttribution ?? (fromMetadata.success ? fromMetadata.data : {});

  const provider = user.app_metadata?.provider;
  const method: SignupMethod = provider === "google" ? "google" : "email";
  const locale = user.user_metadata?.signup_locale === "es" ? "es" : "en";

  const { data: updated } = await supabaseAdmin
    .from("profiles")
    .update({
      utm_source: attribution.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? null,
      utm_term: attribution.utm_term ?? null,
      utm_content: attribution.utm_content ?? null,
      gclid: attribution.gclid ?? null,
      fbclid: attribution.fbclid ?? null,
      landing_path: attribution.landing_path ?? null,
      country: attribution.country ?? null,
      signup_locale: locale,
      signup_method: method,
      signup_tracked_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .is("signup_tracked_at", null) // idempotente si llegan dos callbacks a la vez
    .select("id");

  return updated && updated.length > 0 ? method : null;
}
