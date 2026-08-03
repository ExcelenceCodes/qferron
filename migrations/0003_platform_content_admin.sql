-- =========================================================
-- Ferron :: 0003 platform, content and admin schema
-- =========================================================

CREATE TYPE public.feedback_status AS ENUM ('new','in_review','closed');
CREATE TYPE public.notification_category AS ENUM ('money','shared','ai','system');

-- notifications ---------------------------------------------
CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category   public.notification_category NOT NULL DEFAULT 'system',
  title      text NOT NULL,
  body       text,
  icon       text,
  href       text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- feedback ---------------------------------------------------
CREATE TABLE public.feedback (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  from_email   text NOT NULL,
  subject      text NOT NULL,
  message      text NOT NULL,
  status       public.feedback_status NOT NULL DEFAULT 'new',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT INSERT ON public.feedback TO anon;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_insert_anyone" ON public.feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "feedback_select" ON public.feedback
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "feedback_admin_update" ON public.feedback
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "feedback_admin_delete" ON public.feedback
  FOR DELETE TO authenticated USING (public.is_admin());

-- blog -------------------------------------------------------
CREATE TABLE public.blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  title        text NOT NULL,
  excerpt      text,
  body         text,
  cover_image  text,
  tags         text[] NOT NULL DEFAULT '{}',
  author_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published    boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  read_minutes integer NOT NULL DEFAULT 4,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_public_read" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "blog_admin_read" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.is_admin() OR author_id = auth.uid());
CREATE POLICY "blog_admin_write" ON public.blog_posts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- newsletter --------------------------------------------------
CREATE TABLE public.newsletter_subscribers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text NOT NULL UNIQUE,
  source       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_insert_anyone" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "newsletter_admin_read" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.is_admin());

-- wallpapers ---------------------------------------------------
CREATE TABLE public.wallpapers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  name        text NOT NULL,
  image_path  text,
  category    text NOT NULL DEFAULT 'image',
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallpapers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallpapers TO authenticated;
GRANT ALL ON public.wallpapers TO service_role;
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallpapers_public_read" ON public.wallpapers
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "wallpapers_admin_write" ON public.wallpapers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.wallpapers (key, name, image_path, category, sort_order) VALUES
  ('solid',  'Solid',  NULL,                            'solid', 0),
  ('aurora', 'Aurora', '/media/wallpapers/aurora.jpg',  'image', 1),
  ('canyon', 'Canyon', '/media/wallpapers/canyon.jpg',  'image', 2),
  ('dusk',   'Dusk',   '/media/wallpapers/dusk.jpg',    'image', 3)
ON CONFLICT (key) DO NOTHING;

-- AI settings ---------------------------------------------------
CREATE TABLE public.ai_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key   text NOT NULL UNIQUE,
  label         text NOT NULL,
  endpoint      text NOT NULL DEFAULT 'lovable-ai-gateway',
  model         text NOT NULL DEFAULT 'google/gemini-3.5-flash',
  system_prompt text NOT NULL DEFAULT '',
  injections    text[] NOT NULL DEFAULT '{}',
  markup        text NOT NULL DEFAULT 'markdown',
  enabled       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_settings_admin" ON public.ai_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.ai_settings (feature_key, label, system_prompt, injections) VALUES
  ('dashboard_ask_ferron', 'Dashboard — Ask Ferron', 'You are Ferron, a precise personal accountant.', ARRAY['[[base_currency]]','[[accounts]]','[[recent_transactions]]']),
  ('account_analysis', 'Account AI analysis', 'Analyse a single account and highlight risks and opportunities.', ARRAY['[[account]]','[[transactions]]']),
  ('report_explain', 'Reports — Explain & recommend', 'Explain the report and give three actionable recommendations.', ARRAY['[[report_period]]','[[totals]]']),
  ('debt_advisor', 'Debts — Repayment advisor', 'Advise on the fastest safe repayment plan.', ARRAY['[[debts]]','[[income]]']),
  ('guest_chat', 'Marketing guest chat', 'You are Ferron''s friendly product guide.', ARRAY['[[pricing]]','[[features]]'])
ON CONFLICT (feature_key) DO NOTHING;

-- referrals -------------------------------------------------------
CREATE TABLE public.referrals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email text,
  status       text NOT NULL DEFAULT 'pending',
  reward_cents integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX referrals_referrer_idx ON public.referrals(referrer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_own" ON public.referrals FOR ALL TO authenticated
  USING (referrer_id = auth.uid() OR public.is_admin()) WITH CHECK (referrer_id = auth.uid());

-- audit log --------------------------------------------------------
CREATE TABLE public.audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action     text NOT NULL,
  entity     text,
  entity_id  text,
  metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.audit_log
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE TRIGGER feedback_set_updated_at BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_settings_set_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();