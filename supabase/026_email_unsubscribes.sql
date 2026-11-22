-- Bajas de emails de marketing (CAN-SPAM + baja de un clic de Gmail/Yahoo).
-- Aplica a newsletters y broadcasts del admin; no a emails transaccionales (confirmación, recibos).
-- Solo se lee/escribe con service role: RLS activa y sin políticas.

CREATE TABLE IF NOT EXISTS email_unsubscribes (
  email           TEXT        PRIMARY KEY CHECK (email = lower(email) AND char_length(email) <= 320),
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source          TEXT        NOT NULL DEFAULT 'link' CHECK (source IN ('link', 'one_click', 'admin'))
);

ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Los emails de marketing salen solo en inglés (regla English-first): el default 'es' de 021 ya no aplica
ALTER TABLE profiles ALTER COLUMN locale SET DEFAULT 'en';
