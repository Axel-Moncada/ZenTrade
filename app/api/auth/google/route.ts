import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { origin } = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.url }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
