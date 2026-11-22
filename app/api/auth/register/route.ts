import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/analytics/attribution";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  locale: z.enum(["en", "es"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, locale } = validation.data;
    // Respaldo de la atribución por si el email se confirma en otro dispositivo (sin la cookie)
    const cookieHeader = request.headers.get("cookie") ?? "";
    const rawAttr = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`))
      ?.slice(ATTRIBUTION_COOKIE.length + 1);
    const attribution = parseAttribution(rawAttr);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/callback`,
        data: {
          signup_locale: locale ?? "en",
          ...(attribution ? { attribution } : {}),
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        user: data.user,
        message: "Check your email to confirm your account"
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
