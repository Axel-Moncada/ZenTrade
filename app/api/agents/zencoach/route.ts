import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/lemonsqueezy/get-user-plan";
import { buildZenCoachContext, buildZenCoachSystemPrompt } from "@/lib/agents/zencoach";
import type { ZenCoachMessage } from "@/lib/agents/zencoach";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const RequestSchema = z.object({
  accountId: z.string().uuid(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20), // cap history to control costs
});

/**
 * POST /api/agents/zencoach
 *
 * Cuerpo: { accountId: string, messages: ZenCoachMessage[] }
 * Respuesta: ReadableStream (text/event-stream) con deltas de texto.
 *
 * Solo disponible para usuarios con plan ZenMode activo.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 2. Plan gate — ZenMode only
  const plan = await getUserPlan(supabase, user.id);
  if (!plan.isZenMode) {
    return NextResponse.json(
      { error: "ZenCoach está disponible solo para el plan ZenMode." },
      { status: 403 }
    );
  }

  // 3. Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { accountId, messages } = parsed.data;

  // 4. Verify the account belongs to this user
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  // 5. Build context from Supabase
  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Trader";

  const [context] = await Promise.all([
    buildZenCoachContext(supabase, user.id, accountId),
  ]);

  const systemPrompt = buildZenCoachSystemPrompt(context, userName);

  // 6. Stream from Claude Haiku (cost-efficient for frequent in-app calls)
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const anthropicMessages: Anthropic.MessageParam[] = (messages as ZenCoachMessage[]).map(
          (m) => ({ role: m.role, content: m.content })
        );

        const claudeStream = anthropic.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 512,
          system: systemPrompt,
          messages: anthropicMessages,
        });

        claudeStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await claudeStream.finalMessage();
        controller.close();
      } catch (err) {
        const message =
          err instanceof Anthropic.APIError
            ? `Error de API: ${err.message}`
            : "Error interno del servidor";
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
