-- Mapeo de payment links de Wompi → usuario + plan
-- Wompi no permite reference personalizada en payment links;
-- guardamos el link ID para identificar al usuario en el webhook.

CREATE TABLE IF NOT EXISTS pending_checkouts (
  id               TEXT PRIMARY KEY,   -- payment link ID de Wompi (ej: "NmsoyG")
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_key         TEXT NOT NULL,
  billing_interval TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pending_checkouts ENABLE ROW LEVEL SECURITY;
-- Solo accesible vía service role (API routes / webhooks)
