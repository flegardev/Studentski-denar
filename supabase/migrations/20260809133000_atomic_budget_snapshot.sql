create or replace function public.replace_budget_snapshot(
  p_user_id uuid,
  p_profile jsonb,
  p_transactions jsonb,
  p_recurring jsonb,
  p_metadata jsonb
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'budget snapshot user does not match the authenticated user'
      using errcode = '42501';
  end if;

  if coalesce(jsonb_typeof(p_profile), 'null') <> 'object'
    or coalesce(jsonb_typeof(p_transactions), 'null') <> 'array'
    or coalesce(jsonb_typeof(p_recurring), 'null') <> 'array'
    or coalesce(jsonb_typeof(p_metadata), 'null') <> 'object' then
    raise exception 'budget snapshot payload is malformed'
      using errcode = '22023';
  end if;

  if (p_profile ->> 'user_id') is distinct from p_user_id::text
    or (p_metadata ->> 'user_id') is distinct from p_user_id::text
    or exists (
      select 1
      from jsonb_array_elements(p_transactions) item
      where (item ->> 'user_id') is distinct from p_user_id::text
    )
    or exists (
      select 1
      from jsonb_array_elements(p_recurring) item
      where (item ->> 'user_id') is distinct from p_user_id::text
    ) then
    raise exception 'budget snapshot contains rows for another user'
      using errcode = '42501';
  end if;

  delete from public.budget_transactions where user_id = p_user_id;
  delete from public.recurring_expenses where user_id = p_user_id;

  insert into public.budget_profiles (
    user_id,
    monthly_income_estimate,
    rent,
    transport,
    food_estimate,
    roommates,
    current_balance,
    settings
  )
  select
    p_user_id,
    profile.monthly_income_estimate,
    profile.rent,
    profile.transport,
    profile.food_estimate,
    profile.roommates,
    profile.current_balance,
    coalesce(profile.settings, '{}'::jsonb)
  from jsonb_to_record(p_profile) as profile(
    monthly_income_estimate numeric,
    rent numeric,
    transport numeric,
    food_estimate numeric,
    roommates boolean,
    current_balance numeric,
    settings jsonb
  )
  on conflict (user_id) do update set
    monthly_income_estimate = excluded.monthly_income_estimate,
    rent = excluded.rent,
    transport = excluded.transport,
    food_estimate = excluded.food_estimate,
    roommates = excluded.roommates,
    current_balance = excluded.current_balance,
    settings = excluded.settings;

  insert into public.budget_transactions (
    id, user_id, type, amount, category, description, date, source, metadata
  )
  select
    budget_transaction.id,
    p_user_id,
    budget_transaction.type,
    budget_transaction.amount,
    budget_transaction.category,
    budget_transaction.description,
    budget_transaction.date,
    budget_transaction.source,
    coalesce(budget_transaction.metadata, '{}'::jsonb)
  from jsonb_to_recordset(p_transactions) as budget_transaction(
    id text,
    user_id uuid,
    type text,
    amount numeric,
    category text,
    description text,
    date date,
    source text,
    metadata jsonb
  );

  insert into public.recurring_expenses (
    id, user_id, name, amount, category, due_day, paid_months, active, metadata
  )
  select
    recurring.id,
    p_user_id,
    recurring.name,
    recurring.amount,
    recurring.category,
    recurring.due_day,
    coalesce(recurring.paid_months, '{}'::text[]),
    coalesce(recurring.active, true),
    coalesce(recurring.metadata, '{}'::jsonb)
  from jsonb_to_recordset(p_recurring) as recurring(
    id text,
    user_id uuid,
    name text,
    amount numeric,
    category text,
    due_day integer,
    paid_months text[],
    active boolean,
    metadata jsonb
  );

  insert into public.sync_metadata (
    user_id, last_sync_at, last_pull_at, last_push_at, local_backup_recommended
  )
  select
    p_user_id,
    metadata.last_sync_at,
    metadata.last_pull_at,
    metadata.last_push_at,
    coalesce(metadata.local_backup_recommended, false)
  from jsonb_to_record(p_metadata) as metadata(
    last_sync_at timestamptz,
    last_pull_at timestamptz,
    last_push_at timestamptz,
    local_backup_recommended boolean
  )
  on conflict (user_id) do update set
    last_sync_at = excluded.last_sync_at,
    last_pull_at = excluded.last_pull_at,
    last_push_at = excluded.last_push_at,
    local_backup_recommended = excluded.local_backup_recommended;
end;
$$;

revoke all on function public.replace_budget_snapshot(uuid, jsonb, jsonb, jsonb, jsonb) from public;
revoke all on function public.replace_budget_snapshot(uuid, jsonb, jsonb, jsonb, jsonb) from anon;
grant execute on function public.replace_budget_snapshot(uuid, jsonb, jsonb, jsonb, jsonb) to authenticated;
