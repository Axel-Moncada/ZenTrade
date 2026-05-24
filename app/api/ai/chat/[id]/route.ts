import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI, SchemaType, type Content, type Part, type FunctionDeclaration, type FunctionDeclarationSchema } from '@google/generative-ai';
import { buildZenCoachContext, buildSystemPrompt } from '@/lib/ai/zencoach-context';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const Body = z.object({
  message: z.string().min(1).max(4000),
  image_url: z.string().url().optional(),
});

const REGISTER_TRADE_DECLARATION: FunctionDeclaration = {
  name: 'register_trade',
  description: 'Registra un nuevo trade en el diario del trader. Llama esta función cuando el usuario confirme los datos del trade.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      instrument_symbol: { type: SchemaType.STRING, description: 'Símbolo del instrumento (ej: NQ, ES, MNQ)' },
      side: { type: SchemaType.STRING, enum: ['long', 'short'], description: 'Dirección del trade' },
      contracts: { type: SchemaType.NUMBER, description: 'Número de contratos' },
      result: { type: SchemaType.NUMBER, description: 'Resultado en dólares (positivo = ganancia, negativo = pérdida)' },
      exit_reason: {
        type: SchemaType.STRING,
        enum: ['take_profit', 'stop_loss', 'trailing', 'break_even', 'manual', 'timeout'],
        description: 'Motivo de cierre del trade',
      },
      followed_plan: { type: SchemaType.BOOLEAN, description: '¿El trader siguió el plan?' },
      emotions: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Emociones registradas durante el trade',
      },
      notes: { type: SchemaType.STRING, description: 'Notas adicionales sobre el trade' },
      entry_time: { type: SchemaType.STRING, description: 'Hora de entrada en formato HH:MM (bloques de 30 min)' },
      exit_time: { type: SchemaType.STRING, description: 'Hora de salida en formato HH:MM (bloques de 30 min)' },
      trade_date: { type: SchemaType.STRING, description: 'Fecha del trade en formato YYYY-MM-DD (default: hoy)' },
      screenshot_url: { type: SchemaType.STRING, description: 'URL de la captura de pantalla del trade' },
    },
    required: ['instrument_symbol', 'side', 'contracts', 'result'],
  } as unknown as FunctionDeclarationSchema,
};

interface RegisterTradeArgs {
  instrument_symbol: string;
  side: 'long' | 'short';
  contracts: number;
  result: number;
  exit_reason?: string;
  followed_plan?: boolean;
  emotions?: string[];
  notes?: string;
  entry_time?: string;
  exit_time?: string;
  trade_date?: string;
  screenshot_url?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as unknown;
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { message, image_url } = parsed.data;

  // Verify conversation belongs to user and is active
  const { data: conv } = await supabase
    .from('ai_conversations')
    .select('id, account_id, status, trades_registered')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  if (conv.status === 'closed') return NextResponse.json({ error: 'Session closed' }, { status: 400 });

  // Load context and message history
  const [ctx, messagesRes] = await Promise.all([
    buildZenCoachContext(supabase, user.id, conv.account_id),
    supabase
      .from('ai_messages')
      .select('role, content, image_url')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
      .limit(50),
  ]);

  if (!ctx) return NextResponse.json({ error: 'Context error' }, { status: 500 });

  const systemPrompt = buildSystemPrompt(ctx);
  const history = messagesRes.data ?? [];

  // Build Gemini chat history
  const geminiHistory: Content[] = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
    tools: [{ functionDeclarations: [REGISTER_TRADE_DECLARATION] }],
  });

  const chat = model.startChat({ history: geminiHistory });

  // Build user message parts
  const userParts: Part[] = [];
  if (image_url) {
    try {
      const imgRes = await fetch(image_url);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg';
      userParts.push({ inlineData: { data: base64, mimeType } });
    } catch {
      // If image fetch fails, continue with text only
    }
  }
  userParts.push({ text: message });

  // Save user message
  await supabase.from('ai_messages').insert({
    conversation_id: id,
    role: 'user',
    content: message,
    image_url: image_url ?? null,
  });

  // First Gemini call
  const result1 = await chat.sendMessage(userParts);
  const response1 = result1.response;

  // Check for function call
  const parts = response1.candidates?.[0]?.content?.parts ?? [];
  const fnCallPart = parts.find(p => 'functionCall' in p && p.functionCall);

  let replyText: string;
  let registeredTrade: Record<string, unknown> | null = null;

  if (fnCallPart && 'functionCall' in fnCallPart && fnCallPart.functionCall?.name === 'register_trade') {
    const args = fnCallPart.functionCall.args as RegisterTradeArgs;

    // Look up instrument
    const { data: instrument } = await supabase
      .from('instrument_specs')
      .select('id, symbol')
      .ilike('symbol', args.instrument_symbol)
      .maybeSingle();

    let fnResponse: Record<string, unknown>;

    if (!instrument) {
      fnResponse = { success: false, error: `Instrumento "${args.instrument_symbol}" no encontrado` };
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const tradePayload = {
        user_id: user.id,
        account_id: conv.account_id,
        instrument_id: instrument.id,
        trade_date: args.trade_date ?? today,
        side: args.side,
        contracts: Math.round(args.contracts),
        result: args.result,
        exit_reason: args.exit_reason ?? null,
        followed_plan: args.followed_plan ?? true,
        emotions: args.emotions ?? [],
        notes: args.notes ?? null,
        entry_time: args.entry_time ?? null,
        exit_time: args.exit_time ?? null,
        screenshot_url: args.screenshot_url ?? image_url ?? null,
      };

      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert(tradePayload)
        .select('id, result, trade_date')
        .single();

      if (tradeError || !trade) {
        fnResponse = { success: false, error: tradeError?.message ?? 'Error al registrar' };
      } else {
        registeredTrade = { id: trade.id, result: trade.result, date: trade.trade_date };
        fnResponse = {
          success: true,
          trade_id: trade.id,
          instrument: instrument.symbol,
          result: trade.result,
          date: trade.trade_date,
        };
        // Increment counter
        await supabase
          .from('ai_conversations')
          .update({ trades_registered: (conv.trades_registered ?? 0) + 1 })
          .eq('id', id);
      }
    }

    // Send function response back to Gemini
    const result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: 'register_trade',
          response: fnResponse,
        },
      },
    ]);
    replyText = result2.response.text();
  } else {
    replyText = response1.text();
  }

  // Save assistant reply
  await supabase.from('ai_messages').insert({
    conversation_id: id,
    role: 'assistant',
    content: replyText,
    metadata: registeredTrade ? { trade_registered: registeredTrade } : null,
  });

  return NextResponse.json({
    reply: replyText,
    trade_registered: registeredTrade,
  });
}
