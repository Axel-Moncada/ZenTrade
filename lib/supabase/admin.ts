import { createClient } from '@supabase/supabase-js';

/**
 * Service role client — bypasses RLS.
 * NEVER expose to the browser. Only use in API routes / webhooks.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
