import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { geminiFlash } from '@/lib/ai/gemini';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: conv } = await supabase
    .from('ai_conversations')
    .select('id, account_id, trades_registered, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (conv.status === 'closed') return NextResponse.json({ error: 'Already closed' }, { status: 400 });

  const { data: messages } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .limit(60);

  const transcript = (messages ?? [])
    .map(m => `${m.role === 'user' ? 'Trader' : 'ZenCoach'}: ${m.content}`)
    .join('\n');

  let summary = '';
  if (transcript.length > 50) {
    const prompt = `Resume esta sesión de coaching de trading en 3-5 frases en español. Incluye: temas tratados, insights clave del trader, trades registrados, y una recomendación concreta para la próxima sesión. Sé directo y específico, sin saludos ni despedidas.\n\nTRANSCRIPCIÓN:\n${transcript.slice(0, 6000)}`;
    try {
      const result = await geminiFlash.generateContent(prompt);
      summary = result.response.text().trim();
    } catch {
      summary = `Sesión completada con ${conv.trades_registered ?? 0} trade(s) registrado(s).`;
    }
  } else {
    summary = 'Sesión breve sin contenido significativo.';
  }

  await supabase
    .from('ai_conversations')
    .update({ status: 'closed', summary, closed_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ summary });
}
