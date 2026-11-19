import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/reviews/dismiss
 * El usuario cerró el prompt: no volver a mostrarlo durante el periodo de cooldown.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase
    .from("profiles")
    .update({ review_prompted_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
