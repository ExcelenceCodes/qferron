-- =========================================================
-- Ferron :: 0005 starter accounts + automatic balance sync
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.accounts (user_id, name, type, note)
  VALUES
    (NEW.id, 'Main Account', 'bank', 'Your default everyday account.'),
    (NEW.id, 'Savings', 'bank', 'Set money aside here.');

  RETURN NEW;
END;
$function$;

-- transactions keep account balances in sync -----------------
CREATE OR REPLACE FUNCTION public.apply_transaction_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_delta numeric := 0;
  new_delta numeric := 0;
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    old_delta := CASE WHEN OLD.direction = 'in' THEN OLD.amount ELSE -OLD.amount END;
    UPDATE public.accounts SET balance = balance - old_delta WHERE id = OLD.account_id;
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') THEN
    new_delta := CASE WHEN NEW.direction = 'in' THEN NEW.amount ELSE -NEW.amount END;
    UPDATE public.accounts SET balance = balance + new_delta WHERE id = NEW.account_id;
    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_transaction_balance() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS transactions_balance_sync ON public.transactions;
CREATE TRIGGER transactions_balance_sync
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.apply_transaction_balance();

-- debt payments keep outstanding in sync ---------------------
CREATE OR REPLACE FUNCTION public.apply_debt_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    UPDATE public.debts SET outstanding = outstanding + OLD.amount WHERE id = OLD.debt_id;
  END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN
    UPDATE public.debts SET outstanding = GREATEST(outstanding - NEW.amount, 0) WHERE id = NEW.debt_id;
    RETURN NEW;
  END IF;
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_debt_payment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS debt_payments_sync ON public.debt_payments;
CREATE TRIGGER debt_payments_sync
AFTER INSERT OR UPDATE OR DELETE ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.apply_debt_payment();

DROP TRIGGER IF EXISTS debts_set_updated_at ON public.debts;
CREATE TRIGGER debts_set_updated_at BEFORE UPDATE ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
