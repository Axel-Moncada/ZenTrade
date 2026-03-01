import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

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
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
    return NextResponse.redirect(`${baseUrl}/login?error=auth_exchange`);
  }

  console.log("[auth/callback] no code in URL — redirecting to login");
  return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
}