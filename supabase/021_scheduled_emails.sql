-- Agrega locale a perfiles de usuario
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'es'
  CHECK (locale IN ('es', 'en'));

-- Tabla de emails programados (newsletter y zennews)
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type          TEXT        NOT NULL CHECK (type IN ('newsletter', 'zennews')),
  subject_es    TEXT        NOT NULL DEFAULT '',
  subject_en    TEXT        NOT NULL DEFAULT '',
  body_html_es  TEXT        NOT NULL DEFAULT '',
  body_html_en  TEXT        NOT NULL DEFAULT '',
  audience      TEXT        NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'zenmode')),
  scheduled_at  TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  status        TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  recipients_count INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
-- Solo accesible via service role (rutas de admin)
