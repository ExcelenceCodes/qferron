-- =========================================================
-- Ferron :: 0002 hardening + core finance schema
-- =========================================================

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TYPE public.account_type AS ENUM ('cash','bank','mobile','wallet','card','shared');
CREATE TYPE public.tx_direction AS ENUM ('in','out');
CREATE TYPE public.asset_kind AS ENUM ('property','vehicle','equity','crypto','other');
CREATE TYPE public.debt_kind AS ENUM ('loan','credit');
CREATE TYPE public.debt_status AS ENUM ('active','settled','overdue');

-- accounts ------------------------------------------------
CREATE TABLE public.accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  type        public.account_type NOT NULL DEFAULT 'bank',
  currency    text NOT NULL DEFAULT 'USD',
  balance     numeric(18,2) NOT NULL DEFAULT 0,
  is_shared   boolean NOT NULL DEFAULT false,
  archived    boolean NOT NULL DEFAULT false,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX accounts_user_idx ON public.accounts(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.account_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  display_name text,
  member_role text NOT NULL DEFAULT 'member',
  share_pct   numeric(5,2),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, email)
);
CREATE INDEX account_members_account_idx ON public.account_members(account_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_members TO authenticated;
GRANT ALL ON public.account_members TO service_role;
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_account(_account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = _account_id AND a.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.account_members m WHERE m.account_id = _account_id AND m.user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.can_access_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_account(uuid) TO authenticated;

CREATE POLICY "accounts_select" ON public.accounts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_access_account(id) OR public.is_admin());
CREATE POLICY "accounts_insert" ON public.accounts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "accounts_update" ON public.accounts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "accounts_delete" ON public.accounts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "account_members_select" ON public.account_members
  FOR SELECT TO authenticated USING (public.can_access_account(account_id) OR public.is_admin());
CREATE POLICY "account_members_write" ON public.account_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid()));

-- transactions --------------------------------------------
CREATE TABLE public.transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id  uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  direction   public.tx_direction NOT NULL,
  amount      numeric(18,2) NOT NULL CHECK (amount >= 0),
  currency    text NOT NULL DEFAULT 'USD',
  category    text NOT NULL DEFAULT 'Uncategorized',
  merchant    text,
  note        text,
  occurred_at date NOT NULL DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_user_date_idx ON public.transactions(user_id, occurred_at DESC);
CREATE INDEX transactions_account_idx ON public.transactions(account_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_access_account(account_id) OR public.is_admin());
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- automation rules -----------------------------------------
CREATE TABLE public.rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  match_expr  text NOT NULL,
  action_expr text NOT NULL,
  enabled     boolean NOT NULL DEFAULT true,
  hits        integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rules_user_idx ON public.rules(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rules TO authenticated;
GRANT ALL ON public.rules TO service_role;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_own" ON public.rules FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

-- assets ----------------------------------------------------
CREATE TABLE public.assets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  kind        public.asset_kind NOT NULL DEFAULT 'other',
  value       numeric(18,2) NOT NULL DEFAULT 0,
  currency    text NOT NULL DEFAULT 'USD',
  acquired_at date,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assets_user_idx ON public.assets(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_own" ON public.assets FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

-- debts -----------------------------------------------------
CREATE TABLE public.debts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counterparty  text NOT NULL,
  kind          public.debt_kind NOT NULL DEFAULT 'loan',
  principal     numeric(18,2) NOT NULL DEFAULT 0,
  outstanding   numeric(18,2) NOT NULL DEFAULT 0,
  currency      text NOT NULL DEFAULT 'USD',
  interest_rate numeric(6,3) NOT NULL DEFAULT 0,
  due_date      date,
  status        public.debt_status NOT NULL DEFAULT 'active',
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX debts_user_idx ON public.debts(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT ALL ON public.debts TO service_role;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debts_own" ON public.debts FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.debt_payments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id    uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     numeric(18,2) NOT NULL CHECK (amount > 0),
  paid_at    date NOT NULL DEFAULT current_date,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX debt_payments_debt_idx ON public.debt_payments(debt_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debt_payments_own" ON public.debt_payments FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

-- overdue detection (trigger-based, not CHECK) ---------------
CREATE OR REPLACE FUNCTION public.mark_debt_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.outstanding <= 0 THEN
    NEW.status := 'settled';
  ELSIF NEW.due_date IS NOT NULL AND NEW.due_date < current_date THEN
    NEW.status := 'overdue';
  ELSE
    NEW.status := 'active';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.mark_debt_overdue() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER debts_status_sync BEFORE INSERT OR UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.mark_debt_overdue();

CREATE TRIGGER accounts_set_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER rules_set_updated_at BEFORE UPDATE ON public.rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER assets_set_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();