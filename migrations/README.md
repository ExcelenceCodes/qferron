# Ferron database migrations

Portable, plain PostgreSQL migrations. Apply in filename order against any Postgres
database that has Supabase-style `auth.users` and the `anon`, `authenticated`,
`service_role` roles.

| File | Contents |
| --- | --- |
| `0001_foundation_profiles_roles.sql` | Enums, `set_updated_at()`, `profiles`, `user_roles`, `has_role()` / `is_admin()` security-definer helpers, signup trigger |
| `0002_core_finance_schema.sql` | Function grant hardening, `accounts`, `account_members`, `transactions`, `rules`, `assets`, `debts`, `debt_payments`, overdue trigger |
| `0003_platform_content_admin.sql` | `notifications`, `feedback`, `blog_posts`, `newsletter_subscribers`, `wallpapers` (seeded), `ai_settings` (seeded), `referrals`, `audit_log` |
| `0004_public_form_hardening.sql` | Constrained public INSERT policies for feedback + newsletter |

Apply with psql:

```bash
for f in migrations/0*.sql; do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"; done
```

Grant yourself admin after signing up:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT DO NOTHING;
```
