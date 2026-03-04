-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed', -- 'subscribed' | 'unsubscribed'
  source TEXT, -- 'landing_popup' | 'footer_form'
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Permitir inserts anónimos (formulario público de la landing)
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Solo admins (service_role) pueden leer/actualizar/eliminar
CREATE POLICY "Service role full access" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');
