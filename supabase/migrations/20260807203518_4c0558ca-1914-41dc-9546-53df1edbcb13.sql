-- Money rotation: every value flow is backed by a real account transaction.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS funding_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS funding_tx_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origin_tx_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

ALTER TABLE public.debt_payments
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tx_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

ALTER TABLE public.investment_contributions
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tx_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

-- 1. Guard: an outgoing transaction can never exceed available funds (cards may go negative).
CREATE OR REPLACE FUNCTION public.enforce_sufficient_funds()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acct RECORD;
  available numeric;
BEGIN
  IF NEW.direction <> 'out' THEN RETURN NEW; END IF;

  SELECT balance, type, name, currency INTO acct FROM public.accounts WHERE id = NEW.account_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF acct.type = 'card' THEN RETURN NEW; END IF;

  available := acct.balance;
  IF TG_OP = 'UPDATE' AND OLD.account_id = NEW.account_id THEN
    available := available + CASE WHEN OLD.direction = 'in' THEN -OLD.amount ELSE OLD.amount END;
  END IF;

  IF available < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient funds in %: available % %, needed % %',
      acct.name, round(available, 2), acct.currency, round(NEW.amount, 2), acct.currency
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_funds_guard ON public.transactions;
CREATE TRIGGER transactions_funds_guard
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_sufficient_funds();

-- 2. Asset purchases draw from an account.
CREATE OR REPLACE FUNCTION public.rotate_asset_funding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_tx uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.funding_tx_id IS NOT NULL THEN
      DELETE FROM public.transactions WHERE id = OLD.funding_tx_id;
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.funding_account_id IS NOT NULL AND NEW.value > 0 THEN
    INSERT INTO public.transactions
      (user_id, account_id, direction, amount, currency, category, merchant, note, occurred_at)
    VALUES
      (NEW.user_id, NEW.funding_account_id, 'out', NEW.value, NEW.currency, 'Asset purchase',
       NEW.name, 'Auto-recorded by Ferron money rotation', COALESCE(NEW.acquired_at, current_date))
    RETURNING id INTO new_tx;
    UPDATE public.assets SET funding_tx_id = new_tx WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assets_money_rotation ON public.assets;
CREATE TRIGGER assets_money_rotation
AFTER INSERT ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.rotate_asset_funding();

DROP TRIGGER IF EXISTS assets_money_rotation_del ON public.assets;
CREATE TRIGGER assets_money_rotation_del
AFTER DELETE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.rotate_asset_funding();

-- 3. Debt origination: a loan lands in an account, money lent leaves one.
CREATE OR REPLACE FUNCTION public.rotate_debt_origin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_tx uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.origin_tx_id IS NOT NULL THEN
      DELETE FROM public.transactions WHERE id = OLD.origin_tx_id;
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.account_id IS NOT NULL AND NEW.principal > 0 THEN
    INSERT INTO public.transactions
      (user_id, account_id, direction, amount, currency, category, merchant, note, occurred_at)
    VALUES
      (NEW.user_id, NEW.account_id,
       CASE WHEN NEW.kind = 'loan' THEN 'in'::tx_direction ELSE 'out'::tx_direction END,
       NEW.principal, NEW.currency,
       CASE WHEN NEW.kind = 'loan' THEN 'Loan received' ELSE 'Money lent' END,
       NEW.counterparty, 'Auto-recorded by Ferron money rotation', current_date)
    RETURNING id INTO new_tx;
    UPDATE public.debts SET origin_tx_id = new_tx WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS debts_money_rotation ON public.debts;
CREATE TRIGGER debts_money_rotation
AFTER INSERT ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.rotate_debt_origin();

DROP TRIGGER IF EXISTS debts_money_rotation_del ON public.debts;
CREATE TRIGGER debts_money_rotation_del
AFTER DELETE ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.rotate_debt_origin();

-- 4. Debt payments move money out (repaying) or in (being repaid).
CREATE OR REPLACE FUNCTION public.rotate_debt_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d RECORD;
  new_tx uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.tx_id IS NOT NULL THEN
      DELETE FROM public.transactions WHERE id = OLD.tx_id;
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.account_id IS NOT NULL AND NEW.amount > 0 THEN
    SELECT kind, currency, counterparty INTO d FROM public.debts WHERE id = NEW.debt_id;
    INSERT INTO public.transactions
      (user_id, account_id, direction, amount, currency, category, merchant, note, occurred_at)
    VALUES
      (NEW.user_id, NEW.account_id,
       CASE WHEN d.kind = 'loan' THEN 'out'::tx_direction ELSE 'in'::tx_direction END,
       NEW.amount, d.currency,
       CASE WHEN d.kind = 'loan' THEN 'Debt repayment' ELSE 'Repayment received' END,
       d.counterparty, 'Auto-recorded by Ferron money rotation', NEW.paid_at)
    RETURNING id INTO new_tx;
    UPDATE public.debt_payments SET tx_id = new_tx WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS debt_payments_money_rotation ON public.debt_payments;
CREATE TRIGGER debt_payments_money_rotation
AFTER INSERT ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.rotate_debt_payment();

DROP TRIGGER IF EXISTS debt_payments_money_rotation_del ON public.debt_payments;
CREATE TRIGGER debt_payments_money_rotation_del
AFTER DELETE ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.rotate_debt_payment();

-- 5. Investment top-ups / withdrawals.
CREATE OR REPLACE FUNCTION public.rotate_investment_flow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  new_tx uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.tx_id IS NOT NULL THEN
      DELETE FROM public.transactions WHERE id = OLD.tx_id;
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.account_id IS NOT NULL AND NEW.amount > 0 THEN
    SELECT name, currency INTO inv FROM public.investments WHERE id = NEW.investment_id;
    INSERT INTO public.transactions
      (user_id, account_id, direction, amount, currency, category, merchant, note, occurred_at)
    VALUES
      (NEW.user_id, NEW.account_id,
       CASE WHEN NEW.kind = 'withdrawal' THEN 'in'::tx_direction ELSE 'out'::tx_direction END,
       NEW.amount, inv.currency,
       CASE WHEN NEW.kind = 'withdrawal' THEN 'Investment withdrawal' ELSE 'Investment contribution' END,
       inv.name, 'Auto-recorded by Ferron money rotation', NEW.occurred_at)
    RETURNING id INTO new_tx;
    UPDATE public.investment_contributions SET tx_id = new_tx WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS investment_contributions_money_rotation ON public.investment_contributions;
CREATE TRIGGER investment_contributions_money_rotation
AFTER INSERT ON public.investment_contributions
FOR EACH ROW EXECUTE FUNCTION public.rotate_investment_flow();

DROP TRIGGER IF EXISTS investment_contributions_money_rotation_del ON public.investment_contributions;
CREATE TRIGGER investment_contributions_money_rotation_del
AFTER DELETE ON public.investment_contributions
FOR EACH ROW EXECUTE FUNCTION public.rotate_investment_flow();