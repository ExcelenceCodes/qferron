DROP POLICY IF EXISTS "feedback_insert_anyone" ON public.feedback;
CREATE POLICY "feedback_insert_valid" ON public.feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND from_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(from_email) <= 254
    AND length(subject) BETWEEN 3 AND 200
    AND length(message) BETWEEN 5 AND 5000
    AND status = 'new'
  );

DROP POLICY IF EXISTS "newsletter_insert_anyone" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert_valid" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
    AND (source IS NULL OR length(source) <= 64)
  );