import { supabaseAdmin } from '@/lib/supabase/admin';

/** Duración de la prueba gratis de ZenCoach (con 30 s de margen para la latencia). */
export const TRIAL_DURATION_MS = 5 * 60 * 1000 + 30 * 1000;
/** Máximo de mensajes en la prueba, aunque no se agote el tiempo. */
export const TRIAL_MAX_MESSAGES = 15;

export type TrialCheck =
  | { allowed: true; remainingMessages: number }
  | { allowed: false; reason: 'TRIAL_ENDED' };

interface TrialRow {
  started_at: string;
  messages: number;
}

/**
 * Registra un mensaje de la prueba gratis y dice si está permitido.
 * Usa el service role porque la tabla no tiene políticas RLS: el usuario
 * no puede leerla ni reiniciarla.
 */
export async function consumeTrialMessage(userId: string): Promise<TrialCheck> {
  const { data: existing } = await supabaseAdmin
    .from('zencoach_trials')
    .select('started_at, messages')
    .eq('user_id', userId)
    .maybeSingle<TrialRow>();

  if (!existing) {
    await supabaseAdmin.from('zencoach_trials').insert({ user_id: userId, messages: 1 });
    return { allowed: true, remainingMessages: TRIAL_MAX_MESSAGES - 1 };
  }

  const elapsed = Date.now() - new Date(existing.started_at).getTime();
  if (elapsed > TRIAL_DURATION_MS || existing.messages >= TRIAL_MAX_MESSAGES) {
    return { allowed: false, reason: 'TRIAL_ENDED' };
  }

  await supabaseAdmin
    .from('zencoach_trials')
    .update({ messages: existing.messages + 1 })
    .eq('user_id', userId);

  return { allowed: true, remainingMessages: TRIAL_MAX_MESSAGES - existing.messages - 1 };
}
