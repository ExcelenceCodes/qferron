-- 1. ACCOUNT DETAILS (encrypted, server-only)
CREATE TABLE public.account_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  detail_kind text NOT NULL DEFAULT 'bank',
  payload_ciphertext text NOT NULL,
  masked_hint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id)
);
GRANT ALL ON public.account_details TO service_role;
ALTER TABLE public.account_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY account_details_service_only ON public.account_details FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER account_details_set_updated_at BEFORE UPDATE ON public.account_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. SHARE CODES
ALTER TABLE public.accounts ADD COLUMN share_code text;

CREATE OR REPLACE FUNCTION public.gen_share_code()
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE code text;
BEGIN
  LOOP
    code := lpad((floor(random() * 10000000000))::bigint::text, 10, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.share_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_share_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.share_code IS NULL THEN NEW.share_code := public.gen_share_code(); END IF;
  RETURN NEW;
END;
$$;

UPDATE public.accounts SET share_code = public.gen_share_code() WHERE share_code IS NULL;
ALTER TABLE public.accounts ALTER COLUMN share_code SET NOT NULL;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_share_code_key UNIQUE (share_code);
CREATE TRIGGER accounts_share_code BEFORE INSERT ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_share_code();

-- 3. WRITE GUARD FOR MEMBERS (read-only once sharing is off)
CREATE OR REPLACE FUNCTION public.can_write_account(_account_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.id = _account_id AND a.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.account_members m
    JOIN public.accounts a ON a.id = m.account_id
    WHERE m.account_id = _account_id AND m.user_id = auth.uid()
      AND a.is_shared = true AND m.member_role <> 'viewer'
  );
$$;

DROP POLICY IF EXISTS transactions_insert ON public.transactions;
CREATE POLICY transactions_insert ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_write_account(account_id));

-- 4. JOIN REQUESTS
CREATE TABLE public.account_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_email text,
  requester_name text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, requester_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_join_requests TO authenticated;
GRANT ALL ON public.account_join_requests TO service_role;
ALTER TABLE public.account_join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY join_requests_select ON public.account_join_requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid()));
CREATE POLICY join_requests_insert ON public.account_join_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() AND status = 'pending');
CREATE POLICY join_requests_update ON public.account_join_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid()));
CREATE POLICY join_requests_delete ON public.account_join_requests FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid()));
CREATE TRIGGER join_requests_set_updated_at BEFORE UPDATE ON public.account_join_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.lookup_account_by_code(_code text)
RETURNS TABLE (account_id uuid, name text, type account_type, currency text, owner_name text, member_count integer, is_shared boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.name, a.type, a.currency,
         COALESCE(p.full_name, 'Ferron user'),
         (SELECT count(*)::int FROM public.account_members m WHERE m.account_id = a.id),
         a.is_shared
  FROM public.accounts a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  WHERE a.share_code = _code AND a.archived = false
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.lookup_account_by_code(text) TO authenticated;

-- 5. INVESTMENTS
CREATE TYPE public.investment_kind AS ENUM ('stocks','bonds','mutual_fund','real_estate','business','crypto','savings_plan','other');

CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind investment_kind NOT NULL DEFAULT 'other',
  provider text,
  principal numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  growth_rate numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  maturity_date date,
  risk text NOT NULL DEFAULT 'medium',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY investments_own ON public.investments FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER investments_set_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.investment_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  kind text NOT NULL DEFAULT 'topup',
  occurred_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_contributions TO authenticated;
GRANT ALL ON public.investment_contributions TO service_role;
ALTER TABLE public.investment_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY investment_contributions_own ON public.investment_contributions FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.apply_investment_contribution()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d numeric;
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    d := CASE WHEN OLD.kind = 'withdrawal' THEN -OLD.amount ELSE OLD.amount END;
    UPDATE public.investments SET principal = principal - d, current_value = current_value - d WHERE id = OLD.investment_id;
  END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN
    d := CASE WHEN NEW.kind = 'withdrawal' THEN -NEW.amount ELSE NEW.amount END;
    UPDATE public.investments SET principal = principal + d, current_value = current_value + d WHERE id = NEW.investment_id;
    RETURN NEW;
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER investment_contributions_sync AFTER INSERT OR UPDATE OR DELETE ON public.investment_contributions
FOR EACH ROW EXECUTE FUNCTION public.apply_investment_contribution();

-- 6. SIMPLE AUTOMATION RULES
ALTER TABLE public.rules
  ADD COLUMN trigger_type text NOT NULL DEFAULT 'transaction_created',
  ADD COLUMN condition_field text NOT NULL DEFAULT 'merchant',
  ADD COLUMN operator text NOT NULL DEFAULT 'contains',
  ADD COLUMN condition_value text NOT NULL DEFAULT '',
  ADD COLUMN action_type text NOT NULL DEFAULT 'set_category',
  ADD COLUMN action_value text NOT NULL DEFAULT '',
  ADD COLUMN last_run_at timestamptz;
ALTER TABLE public.rules ALTER COLUMN match_expr SET DEFAULT '';
ALTER TABLE public.rules ALTER COLUMN action_expr SET DEFAULT '';

-- 7. CHAT THREADS + MESSAGES
CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  persona text NOT NULL DEFAULT 'Analin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_threads_own ON public.chat_threads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER chat_threads_set_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_messages_own ON public.chat_messages FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX chat_messages_thread_idx ON public.chat_messages (thread_id, created_at);

-- 8. WALLPAPER SEED
INSERT INTO public.wallpapers (key, name, image_path, category, sort_order, active) VALUES
  ('solid', 'Solid (default)', NULL, 'solid', 0, true),
  ('aurora', 'Aurora', '/media/wallpapers/aurora.jpg', 'image', 1, true),
  ('dusk', 'Dusk', '/media/wallpapers/dusk.jpg', 'image', 2, true),
  ('canyon', 'Canyon', '/media/wallpapers/canyon.jpg', 'image', 3, true)
ON CONFLICT DO NOTHING;
