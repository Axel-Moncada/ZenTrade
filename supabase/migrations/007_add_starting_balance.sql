-- Migración para agregar starting_balance (balance real al iniciar tracking)
-- Esto resuelve el problema de que initial_balance es el balance con el que el broker dio la cuenta,
-- pero el usuario puede haber empezado a trackear después con un balance diferente

-- Paso 1: Agregar columna starting_balance (nullable temporalmente)
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS starting_balance DECIMAL(12, 2);

-- Paso 2: Inicializar starting_balance con initial_balance para cuentas existentes
-- Esto asume que las cuentas existentes empezaron a trackear desde el inicio
UPDATE accounts 
SET starting_balance = initial_balance 
WHERE starting_balance IS NULL;

-- Paso 3: Hacer NOT NULL ahora que todos tienen valor
ALTER TABLE accounts 
ALTER COLUMN starting_balance SET NOT NULL;

-- Paso 4: Agregar comentario explicativo
COMMENT ON COLUMN accounts.starting_balance IS 'Balance real de la cuenta cuando se empezó a trackear en ZenTrade (puede ser diferente de initial_balance si ya había operaciones previas)';

-- Paso 5: Actualizar la función de cálculo de balance para usar starting_balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  affected_account_id UUID;
  new_balance DECIMAL(12, 2);
  account_starting_balance DECIMAL(12, 2);
  account_manual_adjustments DECIMAL(12, 2);
  trades_sum DECIMAL(12, 2);
BEGIN
  -- Determinar el account_id afectado según la operación
  IF TG_OP = 'DELETE' THEN
    affected_account_id := OLD.account_id;
  ELSE
    affected_account_id := NEW.account_id;
  END IF;

  -- Obtener starting_balance y manual_adjustments de la cuenta
  SELECT starting_balance, COALESCE(manual_adjustments, 0)
  INTO account_starting_balance, account_manual_adjustments
  FROM accounts
  WHERE id = affected_account_id;

  -- Calcular suma de todos los trades de esta cuenta
  SELECT COALESCE(SUM(result), 0)
  INTO trades_sum
  FROM trades
  WHERE account_id = affected_account_id;

  -- Calcular nuevo balance: starting balance + ajustes manuales + resultados de trades
  new_balance := account_starting_balance + account_manual_adjustments + trades_sum;

  -- Actualizar current_balance
  UPDATE accounts
  SET current_balance = new_balance,
      updated_at = NOW()
  WHERE id = affected_account_id;

  -- Si es UPDATE y cambió de cuenta, actualizar también la cuenta anterior
  IF TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id THEN
    -- Recalcular balance de la cuenta anterior
    SELECT starting_balance, COALESCE(manual_adjustments, 0)
    INTO account_starting_balance, account_manual_adjustments
    FROM accounts
    WHERE id = OLD.account_id;

    SELECT COALESCE(SUM(result), 0)
    INTO trades_sum
    FROM trades
    WHERE account_id = OLD.account_id;

    new_balance := account_starting_balance + account_manual_adjustments + trades_sum;

    UPDATE accounts
    SET current_balance = new_balance,
        updated_at = NOW()
    WHERE id = OLD.account_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Paso 6: Actualizar la función auxiliar para cambios en starting_balance
CREATE OR REPLACE FUNCTION update_account_balance_on_adjustment()
RETURNS TRIGGER AS $$
DECLARE
  trades_sum DECIMAL(12, 2);
  new_balance DECIMAL(12, 2);
BEGIN
  -- Calcular suma de todos los trades
  SELECT COALESCE(SUM(result), 0)
  INTO trades_sum
  FROM trades
  WHERE account_id = NEW.id;

  -- Calcular nuevo balance usando starting_balance
  new_balance := NEW.starting_balance + COALESCE(NEW.manual_adjustments, 0) + trades_sum;

  -- Actualizar current_balance
  NEW.current_balance := new_balance;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 7: Actualizar trigger para incluir starting_balance
DROP TRIGGER IF EXISTS trigger_update_balance_on_adjustment ON accounts;

CREATE TRIGGER trigger_update_balance_on_adjustment
BEFORE UPDATE OF initial_balance, starting_balance, manual_adjustments ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_on_adjustment();

-- Paso 8: Recalcular todos los balances existentes con starting_balance
DO $$
DECLARE
  account_record RECORD;
  trades_sum DECIMAL(12, 2);
  new_balance DECIMAL(12, 2);
BEGIN
  FOR account_record IN SELECT id, starting_balance, COALESCE(manual_adjustments, 0) as manual_adjustments FROM accounts LOOP
    SELECT COALESCE(SUM(result), 0)
    INTO trades_sum
    FROM trades
    WHERE account_id = account_record.id;

    new_balance := account_record.starting_balance + account_record.manual_adjustments + trades_sum;

    UPDATE accounts
    SET current_balance = new_balance,
        updated_at = NOW()
    WHERE id = account_record.id;
  END LOOP;
END $$;
