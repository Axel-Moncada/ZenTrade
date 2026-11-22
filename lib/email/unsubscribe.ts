import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

const APP_URL = "https://www.zen-trader.com";

function secret(): string {
  // Secreto dedicado si existe; si no, se deriva de la service key (nunca sale del servidor)
  const s = process.env.EMAIL_UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("EMAIL_UNSUBSCRIBE_SECRET is not set");
  return s;
}

const normalize = (email: string) => email.trim().toLowerCase();

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(`unsubscribe:${normalize(email)}`).digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(email: string): string {
  const params = new URLSearchParams({ e: normalize(email), t: unsubscribeToken(email) });
  return `${APP_URL}/api/email/unsubscribe?${params.toString()}`;
}

export async function recordUnsubscribe(email: string, source: "link" | "one_click" | "admin"): Promise<void> {
  const e = normalize(email);
  await supabaseAdmin.from("email_unsubscribes").upsert({ email: e, source }, { onConflict: "email", ignoreDuplicates: true });
  // También lo saca de la newsletter
  await supabaseAdmin.from("newsletter_subscribers").update({ status: "unsubscribed" }).eq("email", e);
}

export async function getUnsubscribedSet(): Promise<Set<string>> {
  const { data } = await supabaseAdmin.from("email_unsubscribes").select("email");
  return new Set((data ?? []).map((r: { email: string }) => r.email));
}
