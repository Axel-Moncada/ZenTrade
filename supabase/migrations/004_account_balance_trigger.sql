-- Agregar campo para ajustes manuales (depósitos/retiros)
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS manual_adjustments DECIMAL(12, 2) DEFAULT 0;

-- Comentario explicativo
COMMENT ON COLUMN accounts.manual_adjustments IS 'Ajustes manuales al balance (depósitos, retiros, etc.)';

-- Función para actualizar el balance automáticamente
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  affected_account_id UUID;
  new_balance DECIMAL(12, 2);
  account_initial_balance DECIMAL(12, 2);
  account_manual_adjustments DECIMAL(12, 2);
  trades_sum DECIMAL(12, 2);
BEGIN
  -- Determinar el account_id afectado según la operación
  IF TG_OP = 'DELETE' THEN
    affected_account_id := OLD.account_id;
  ELSE
    affected_account_id := NEW.account_id;
  END IF;

  -- Obtener initial_balance y manual_adjustments de la cuenta
  SELECT initial_balance, COALESCE(manual_adjustments, 0)
  INTO account_initial_balance, account_manual_adjustments
  FROM accounts
  WHERE id = affected_account_id;

  -- Calcular suma de todos los trades de esta cuenta
  SELECT COALESCE(SUM(result), 0)
  INTO trades_sum
  FROM trades
  WHERE account_id = affected_account_id;

  -- Calcular nuevo balance: inicial + ajustes manuales + resultados de trades
  new_balance := account_initial_balance + account_manual_adjustments + trades_sum;

  -- Actualizar current_balance
  UPDATE accounts
  SET current_balance = new_balance,
      updated_at = NOW()
  WHERE id = affected_account_id;

  -- Si es UPDATE y cambió de cuenta, actualizar también la cuenta anterior
  IF TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id THEN
    -- Recalcular balance de la cuenta anterior
    SELECT initial_balance, COALESCE(manual_adjustments, 0)
    INTO account_initial_balance, account_manual_adjustments
    FROM accounts
    WHERE id = OLD.account_id;

    SELECT COALESCE(SUM(result), 0)
    INTO trades_sum
    FROM trades
    WHERE account_id = OLD.account_id;

    new_balance := account_initial_balance + account_manual_adjustments + trades_sum;

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

-- Crear trigger en tabla trades
DROP TRIGGER IF EXISTS trigger_update_account_balance ON trades;

CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR UPDATE OF result, account_id OR DELETE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- Función auxiliar para actualizar balance cuando cambian ajustes manuales
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

  -- Calcular nuevo balance
  new_balance := NEW.initial_balance + COALESCE(NEW.manual_adjustments, 0) + trades_sum;

  -- Actualizar current_balance
  NEW.current_balance := new_balance;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para cuando se modifican ajustes manuales o initial_balance
DROP TRIGGER IF EXISTS trigger_update_balance_on_adjustment ON accounts;

CREATE TRIGGER trigger_update_balance_on_adjustment
BEFORE UPDATE OF initial_balance, manual_adjustments ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_on_adjustment();

-- Recalcular todos los balances existentes
DO $$
DECLARE
  account_record RECORD;
  trades_sum DECIMAL(12, 2);
  new_balance DECIMAL(12, 2);
BEGIN
  FOR account_record IN SELECT id, initial_balance, COALESCE(manual_adjustments, 0) as manual_adjustments FROM accounts LOOP
    SELECT COALESCE(SUM(result), 0)
    INTO trades_sum
    FROM trades
    WHERE account_id = account_record.id;

    new_balance := account_record.initial_balance + account_record.manual_adjustments + trades_sum;

    UPDATE accounts
    SET current_balance = new_balance,
        updated_at = NOW()
    WHERE id = account_record.id;
  END LOOP;
END $$;
