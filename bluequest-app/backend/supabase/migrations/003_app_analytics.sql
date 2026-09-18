-- BlueQuest privacy-conscious app analytics.
-- Public clients cannot read/write these tables directly. Edge Functions use service_role.

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

create or replace function public.record_app_presence(
  p_installation_id text,
  p_user_id uuid,
  p_platform text,
  p_app_version text,
  p_is_open boolean default false
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_installations(installation_id,user_id,platform,app_version,first_seen_at,last_seen_at)
  values(p_installation_id,p_user_id,coalesce(nullif(p_platform,''),'android'),p_app_version,now(),now())
  on conflict(installation_id) do update set
    user_id=coalesce(excluded.user_id,public.app_installations.user_id),
    platform=excluded.platform,
    app_version=excluded.app_version,
    last_seen_at=now();

  insert into public.app_daily_activity(activity_date,installation_id,user_id,app_version,opens,last_seen_at)
  values(current_date,p_installation_id,p_user_id,p_app_version,case when p_is_open then 1 else 0 end,now())
  on conflict(activity_date,installation_id) do update set
    user_id=coalesce(excluded.user_id,public.app_daily_activity.user_id),
    app_version=excluded.app_version,
    opens=public.app_daily_activity.opens + case when p_is_open then 1 else 0 end,
    last_seen_at=now();
end;
$$;

create or replace function public.record_module_usage(
  p_installation_id text,
  p_user_id uuid,
  p_module_key text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_module_usage_daily(activity_date,installation_id,user_id,module_key,opens,last_used_at)
  values(current_date,p_installation_id,p_user_id,p_module_key,1,now())
  on conflict(activity_date,installation_id,module_key) do update set
    user_id=coalesce(excluded.user_id,public.app_module_usage_daily.user_id),
    opens=public.app_module_usage_daily.opens+1,
    last_used_at=now();
end;
$$;

revoke all on function public.record_app_presence(text,uuid,text,text,boolean) from public, anon, authenticated;
revoke all on function public.record_module_usage(text,uuid,text) from public, anon, authenticated;
grant execute on function public.record_app_presence(text,uuid,text,text,boolean) to service_role;
grant execute on function public.record_module_usage(text,uuid,text) to service_role;

create or replace function public.get_bluequest_admin_analytics()
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  select jsonb_build_object(
    'generated_at', now(),
    'accounts', (select count(*) from auth.users),
    'installations', (select count(*) from public.app_installations),
    'online_now', (select count(*) from public.app_installations where last_seen_at >= now() - interval '2 minutes'),
    'active_today', (select count(*) from public.app_daily_activity where activity_date=current_date),
    'active_7d', (select count(distinct installation_id) from public.app_daily_activity where activity_date >= current_date - 6),
    'active_30d', (select count(distinct installation_id) from public.app_daily_activity where activity_date >= current_date - 29),
    'community', (
      select count(distinct user_id)
      from public.user_entitlements
      where module_key='community'
        and (granted_until is null or granted_until > now())
    ),
    'modules_today', coalesce((
      select jsonb_object_agg(module_key, users)
      from (
        select module_key,count(distinct installation_id) users
        from public.app_module_usage_daily
        where activity_date=current_date
        group by module_key
      ) s
    ), '{}'::jsonb)
  );
$$;

revoke all on function public.get_bluequest_admin_analytics() from public, anon, authenticated;
grant execute on function public.get_bluequest_admin_analytics() to service_role;
