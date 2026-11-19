import { createClient } from "@/lib/supabase/server";
import type { Review } from "./reviews";

export interface AdminReview extends Review {
  email: string | null;
}

/** Retorna el usuario si es admin (ADMIN_EMAILS), o null */
export async function requireAdmin() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) return null;
  return user;
}
