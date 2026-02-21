-- =====================================================
-- VERIFICAR Y REPARAR INSTRUMENTOS
-- =====================================================

-- 1. Verificar cuántos instrumentos existen
SELECT COUNT(*) as total_instrumentos FROM instrument_specs;

-- 2. Ver todos los instrumentos actuales
SELECT id, symbol, name FROM instrument_specs ORDER BY symbol;

-- 3. SOLUCIÓN: Eliminar todos los instrumentos existentes e insertar nuevamente
DELETE FROM instrument_specs;

-- 4. Insertar instrumentos de nuevo
INSERT INTO instrument_specs (symbol, name, tick_size, tick_value, category) VALUES
  ('MNQ', 'Micro E-mini Nasdaq-100', 0.25, 0.50, 'indices'),
  ('NQ', 'E-mini Nasdaq-100', 0.25, 5.00, 'indices'),
  ('MES', 'Micro E-mini S&P 500', 0.25, 1.25, 'indices'),
  ('ES', 'E-mini S&P 500', 0.25, 12.50, 'indices'),
  ('MYM', 'Micro E-mini Dow', 1.00, 0.50, 'indices'),
  ('YM', 'E-mini Dow', 1.00, 5.00, 'indices'),
  ('M2K', 'Micro E-mini Russell 2000', 0.10, 0.50, 'indices'),
  ('RTY', 'E-mini Russell 2000', 0.10, 5.00, 'indices'),
  ('MCL', 'Micro WTI Crude Oil', 0.01, 1.00, 'energy'),
  ('CL', 'WTI Crude Oil', 0.01, 10.00, 'energy'),
  ('MGC', 'Micro Gold', 0.10, 1.00, 'metals'),
  ('GC', 'Gold', 0.10, 10.00, 'metals');

-- 5. Verificar que se insertaron correctamente
SELECT COUNT(*) as total_instrumentos_nuevos FROM instrument_specs;
SELECT id, symbol, name FROM instrument_specs ORDER BY symbol;
