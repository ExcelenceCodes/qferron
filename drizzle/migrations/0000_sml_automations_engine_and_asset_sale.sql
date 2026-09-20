-- =========================================================
-- Ferron :: 0006 SML, live automations engine, asset selling
-- =========================================================

DO $$ BEGIN
  CREATE TYPE public.asset_status AS ENUM ('owned','sold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS status public.asset_status NOT NULL DEFAULT 'owned',
  ADD COLUMN IF NOT EXISTS sold_at date,
  ADD COLUMN IF NOT EXISTS sold_value numeric(18,2),
  ADD COLUMN IF NOT EXISTS sold_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sold_tx_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS auto_rule_id uuid REFERENCES public.rules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sml text;

ALTER TABLE public.rules
  ADD COLUMN IF NOT EXISTS sml text,
  ADD COLUMN IF NOT EXISTS action_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS amount_kind text NOT NULL DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS amount_value numeric(18,4) NOT NULL DEFAULT 0;

-- audit log of every automation execution -------------------
CREATE TABLE IF NOT EXISTS public.rule_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id        uuid REFERENCES public.rules(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  status         text NOT NULL DEFAULT 'applied',
  detail         text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rule_runs_user_idx ON public.rule_runs(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rule_runs TO authenticated;
GRANT ALL ON public.rule_runs TO service_role;
ALTER TABLE public.rule_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rule_runs_own" ON public.rule_runs;
CREATE POLICY "rule_runs_own" ON public.rule_runs FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

-- automation engine ------------------------------------------
CREATE OR REPLACE FUNCTION public.run_transaction_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  r         record;
  fieldval  text;
  matched   boolean;
  amt       numeric;
  src       uuid;
BEGIN
  IF NEW.auto_rule_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  FOR r IN SELECT * FROM public.rules
           WHERE user_id = NEW.user_id AND enabled = true
           ORDER BY created_at ASC
  LOOP
    IF r.trigger_type = 'money_in' AND NEW.direction <> 'in' THEN CONTINUE; END IF;
    IF r.trigger_type = 'money_out' AND NEW.direction <> 'out' THEN CONTINUE; END IF;

    fieldval := CASE r.condition_field
      WHEN 'merchant'  THEN COALESCE(NEW.merchant, '')
      WHEN 'category'  THEN COALESCE(NEW.category, '')
      WHEN 'note'      THEN COALESCE(NEW.note, '')
      WHEN 'amount'    THEN NEW.amount::text
      WHEN 'direction' THEN NEW.direction::text
      ELSE '' END;

    IF COALESCE(r.condition_value, '') = '' THEN
      matched := true;
    ELSE
      matched := CASE r.operator
        WHEN 'contains'     THEN position(lower(r.condition_value) in lower(fieldval)) > 0
        WHEN 'equals'       THEN lower(fieldval) = lower(r.condition_value)
        WHEN 'starts_with'  THEN lower(fieldval) LIKE lower(r.condition_value) || '%'
        WHEN 'greater_than' THEN NEW.amount > COALESCE(NULLIF(r.condition_value,'')::numeric, 0)
        WHEN 'less_than'    THEN NEW.amount < COALESCE(NULLIF(r.condition_value,'')::numeric, 0)
        ELSE false END;
    END IF;

    IF NOT matched THEN CONTINUE; END IF;

    BEGIN
      IF r.action_type = 'set_category' AND COALESCE(r.action_value,'') <> '' THEN
        UPDATE public.transactions SET category = r.action_value WHERE id = NEW.id;

      ELSIF r.action_type = 'add_note' THEN
        UPDATE public.transactions
          SET note = btrim(COALESCE(NEW.note,'') || ' ' || COALESCE(r.action_value,''))
          WHERE id = NEW.id;

      ELSIF r.action_type IN ('flag','notify') THEN
        INSERT INTO public.notifications (user_id, title, body, category, href)
        VALUES (NEW.user_id, r.name,
                COALESCE(NULLIF(r.action_value,''), 'An automation matched a transaction.')
                  || ' (' || NEW.currency || ' ' || NEW.amount::text || ')',
                'system', '/dashboard/transactions');

      ELSIF r.action_type IN ('move_to_account','allocate') AND r.action_account_id IS NOT NULL THEN
        amt := CASE WHEN r.amount_kind = 'fixed'
                    THEN r.amount_value
                    ELSE round(NEW.amount * COALESCE(r.amount_value,0) / 100.0, 2) END;
        src := NEW.account_id;
        IF amt > 0 AND src <> r.action_account_id THEN
          INSERT INTO public.transactions
            (user_id, account_id, direction, amount, currency, category, merchant, note, occurred_at, auto_rule_id)
          VALUES (NEW.user_id, src, 'out', amt, NEW.currency, 'Auto allocation', r.name,
                  'Automation: ' || r.name, NEW.occurred_at, r.id);
          INSERT INTO public.transactions
            (user_id, account_id, direction, amount, currency, category, merchant, note, occurred_at, auto_rule_id)
          VALUES (NEW.user_id, r.action_account_id, 'in', amt, NEW.currency, 'Auto allocation', r.name,
                  'Automation: ' || r.name, NEW.occurred_at, r.id);
          INSERT INTO public.notifications (user_id, title, body, category, href)
          VALUES (NEW.user_id, 'Automation moved money',
                  r.name || ' moved ' || NEW.currency || ' ' || amt::text || ' automatically.',
                  'money', '/dashboard/rules');
        END IF;
      END IF;

      UPDATE public.rules SET hits = hits + 1, last_run_at = now() WHERE id = r.id;
      INSERT INTO public.rule_runs (user_id, rule_id, transaction_id, status, detail)
      VALUES (NEW.user_id, r.id, NEW.id, 'applied', r.action_type);

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.rule_runs (user_id, rule_id, transaction_id, status, detail)
      VALUES (NEW.user_id, r.id, NEW.id, 'failed', SQLERRM);
      INSERT INTO public.notifications (user_id, title, body, category, href)
      VALUES (NEW.user_id, 'Automation could not run',
              r.name || ' failed: ' || SQLERRM, 'system', '/dashboard/rules');
    END;
  END LOOP;

  RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION public.run_transaction_rules() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS transactions_run_rules ON public.transactions;
CREATE TRIGGER transactions_run_rules
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.run_transaction_rules();