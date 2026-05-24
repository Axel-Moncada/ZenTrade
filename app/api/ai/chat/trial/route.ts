import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const Body = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(MessageSchema).max(20).default([]),
  locale: z.enum(['en', 'es']).default('en'),
});

const TRIAL_SYSTEM_EN = `You are ZenCoach, an AI trading coach inside Zentrade — the trading journal built for futures traders doing prop firm evaluations (FTMO, Apex Trader Funding, TopStep, Tradoverse).

This is a 5-minute free trial session. The user has NOT yet set up their accounts or trading plan.

YOUR ROLE IN THE TRIAL:
- Show off your capabilities clearly: trading psychology, prop firm rules, trade analysis, performance review
- Be impressive, insightful, and personalized even without account data
- Ask one good question to learn about the trader (which prop firm, what they struggle with, etc.)
- Give concrete, expert advice — not generic platitudes
- Naturally mention what you can do in the full version: analyze their actual trades, register trades by screenshot, send weekly AI reports, detect revenge trading in real time

STYLE:
- Conversational but professional
- Max 3-4 short paragraphs per response
- Use **bold** for key data points and important takeaways
- No bullet lists unless explicitly needed
- Speak English (the user's language)`;

const TRIAL_SYSTEM_ES = `Eres ZenCoach, el coach de trading IA dentro de Zentrade — el diario de trading para futuros y evaluaciones de prop firms (FTMO, Apex Trader Funding, TopStep, Tradoverse).

Esta es una sesión de prueba gratuita de 5 minutos. El usuario aún NO ha configurado cuentas ni un plan de trading.

TU ROL EN EL TRIAL:
- Demuestra tus capacidades: psicología del trading, reglas de prop firms, análisis de trades, revisión de desempeño
- Sé impresionante, perspicaz y personalizado aunque no tengas datos de cuenta
- Haz una buena pregunta inicial para conocer al trader (qué prop firm usa, con qué lucha, etc.)
- Da consejos concretos y expertos — no generalismos vacíos
- Menciona naturalmente lo que puedes hacer en la versión completa: analizar sus trades reales, registrar trades por screenshot, enviar reportes semanales con IA, detectar revenge trading en tiempo real

ESTILO:
- Conversacional pero profesional
- Máximo 3-4 párrafos cortos por respuesta
- Usa **negrilla** para datos clave y conclusiones importantes
- Sin listas a menos que sea necesario
- Habla en español (el idioma del usuario)`;

export async function POST(req: NextRequest) {
  // Must be authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { message, history, locale } = parsed.data;
  const systemPrompt = locale === 'es' ? TRIAL_SYSTEM_ES : TRIAL_SYSTEM_EN;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  });

  const geminiHistory = history.map(m => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  const reply = result.response.text().trim();

  return NextResponse.json({ reply });
}
