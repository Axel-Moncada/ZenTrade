import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/analytics/attribution";
import { trackSignupCompletion } from "@/lib/analytics/save-signup-attribution";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  console.log("[auth/callback] code:", !!code, "| origin:", origin, "| baseUrl:", baseUrl);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("[auth/callback] exchangeCodeForSession error:", error?.message ?? "none");
    if (!error) {
      // Registro completado (email confirmado o Google): atribución + sign_up una sola vez
      let target = `${baseUrl}${next}`;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const method = await trackSignupCompletion(
            user,
            parseAttribution(request.cookies.get(ATTRIBUTION_COOKIE)?.value)
          );
          if (method) {
            const url = new URL(target);
            url.searchParams.set("signup", method);
            target = url.toString();
          }
        }
      } catch (e) {
        console.error("[auth/callback] signup tracking failed:", e);
      }
      return NextResponse.redirect(target);
    }
    return NextResponse.redirect(`${baseUrl}/login?error=auth_exchange`);
  }

  console.log("[auth/callback] no code in URL — redirecting to login");
  return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
}