import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordUnsubscribe, verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

const Query = z.object({
  e: z.string().trim().toLowerCase().email().max(320),
  t: z.string().min(20).max(100),
});

function parse(req: NextRequest) {
  const url = new URL(req.url);
  return Query.safeParse({ e: url.searchParams.get("e"), t: url.searchParams.get("t") });
}

/** Link del footer: da de baja y muestra la confirmación. */
export async function GET(req: NextRequest) {
  const parsed = parse(req);
  const base = new URL("/unsubscribed", req.url);
  if (!parsed.success || !verifyUnsubscribeToken(parsed.data.e, parsed.data.t)) {
    base.searchParams.set("status", "invalid");
    return NextResponse.redirect(base);
  }
  await recordUnsubscribe(parsed.data.e, "link");
  return NextResponse.redirect(base);
}

/** Baja de un clic (RFC 8058): Gmail/Yahoo hacen POST a la URL del header List-Unsubscribe. */
export async function POST(req: NextRequest) {
  const parsed = parse(req);
  if (!parsed.success || !verifyUnsubscribeToken(parsed.data.e, parsed.data.t)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }
  await recordUnsubscribe(parsed.data.e, "one_click");
  return NextResponse.json({ ok: true });
}
