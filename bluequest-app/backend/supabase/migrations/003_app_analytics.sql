-- BlueQuest anonymous installation/activity analytics + private owner dashboard
create table if not exists public.app_installations (
  installation_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  platform text not null default 'android',
  app_version text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create table if not exists public.app_daily_activity (
  activity_date date not null default current_date,
  installation_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  app_version text,
  opens integer not null default 0,
  last_seen_at timestamptz not null default now(),
  primary key(activity_date, installation_id)
);
create table if not exists public.app_module_usage_daily (
  activity_date date not null default current_date,
  installation_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  module_key text not null,
  opens integer not null default 0,
  last_used_at timestamptz not null default now(),
  primary key(activity_date, installation_id, module_key)
);
alter table public.app_installations enable row level security;
alter table public.app_daily_activity enable row level security;
alter table public.app_module_usage_daily enable row level security;
revoke all on public.app_installations from anon, authenticated;
revoke all on public.app_daily_activity from anon, authenticated;
revoke all on public.app_module_usage_daily from anon, authenticated;
-- Runtime RPCs are service-role only and are called by Edge Functions.
