ALTER TABLE public.accounts ALTER COLUMN share_code SET DEFAULT public.gen_share_code();
REVOKE EXECUTE ON FUNCTION public.gen_share_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lookup_account_by_code(text) FROM anon;
