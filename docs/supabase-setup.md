# Supabase Setup

## Create Project

1. Create a Supabase project.
2. Copy the project URL into `VITE_SUPABASE_URL`.
3. Copy the publishable key into `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Do not add a service role key to `.env.local` for the Vite frontend.

## Run Migrations

Use one of these options:

- Supabase Dashboard: open SQL Editor, paste and run the SQL files in `supabase/migrations/` in filename order.
- Supabase CLI: link the project and run migrations with your normal Supabase CLI workflow.

The auth migration creates:

- `profiles`
- `supporter_access`
- `email_events`
- profile creation trigger on `auth.users`
- RLS policies and safe grants
- `submit_supporter_request()` RPC for pending supporter review

The cloud sync migration creates:

- `budget_profiles`
- `budget_transactions`
- `recurring_expenses`
- `sync_metadata`
- per-user RLS policies for select, insert, update, and delete
- indexes for user, date, and transaction type lookups

The atomic snapshot migration creates `replace_budget_snapshot()`. The frontend uses this authenticated, security-invoker RPC so an upload either commits the complete user snapshot or rolls back without deleting the previous snapshot. Run all migration files in filename order; do not skip this migration.

`budget_transactions.id` and `recurring_expenses.id` are text IDs so existing local IDs are preserved during sync.

## Auth Redirect URLs

In Supabase Dashboard, open Authentication settings and add these URLs.

Local development:

```text
http://localhost:5173
http://localhost:5173/#profile
http://localhost:5173/#reset-password
```

Production:

```text
https://your-production-domain.example
https://your-production-domain.example/#profile
https://your-production-domain.example/#reset-password
```

## Email Verification

Enable email confirmations if you want users to verify accounts before sign-in. Supabase Auth sends the verification email. The app sends users to `/#profile` after verification.

## Password Reset

Set the password recovery redirect URL to:

```text
http://localhost:5173/#reset-password
```

Use your production origin for production:

```text
https://your-production-domain.example/#reset-password
```

## Local Run

1. Copy `.env.example` to `.env.local`.
2. Fill in `VITE_SUPABASE_URL`.
3. Fill in `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Run `npm install`.
5. Run `npm run dev`.

The app also works without these env vars in local MVP mode, but auth, database supporter access, and cloud sync are disabled in that mode.
