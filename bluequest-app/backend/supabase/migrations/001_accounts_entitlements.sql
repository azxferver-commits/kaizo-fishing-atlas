-- BlueQuest accounts + entitlements
-- Apply inside a Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_key text not null,
  source text not null default 'manual',
  granted_at timestamptz not null default now(),
  granted_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, module_key)
);

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('discord','youtube','twitch')),
  external_user_id text,
  external_username text,
  verified boolean not null default false,
  verified_at timestamptz,
  last_checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, provider)
);

create table if not exists public.protected_content (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  content_key text not null,
  content_version integer not null default 1,
  payload jsonb not null,
  minimum_entitlement text,
  updated_at timestamptz not null default now(),
  unique(module_key, content_key)
);

create or replace function public.has_entitlement(required_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_entitlements e
    where e.user_id = auth.uid()
      and e.module_key = required_key
      and (e.granted_until is null or e.granted_until > now())
  );
$$;

revoke all on function public.has_entitlement(text) from public;
grant execute on function public.has_entitlement(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.social_connections enable row level security;
alter table public.protected_content enable row level security;

drop policy if exists "profile read own" on public.profiles;
create policy "profile read own" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "profile update own" on public.profiles;
create policy "profile update own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "entitlements read own" on public.user_entitlements;
create policy "entitlements read own" on public.user_entitlements
for select to authenticated using (user_id = auth.uid());

drop policy if exists "connections read own" on public.social_connections;
create policy "connections read own" on public.social_connections
for select to authenticated using (user_id = auth.uid());

drop policy if exists "protected content by entitlement" on public.protected_content;
create policy "protected content by entitlement" on public.protected_content
for select to authenticated
using (
  minimum_entitlement is null
  or public.has_entitlement(minimum_entitlement)
);

create or replace function public.handle_new_bluequest_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_bluequest_user_created on auth.users;
create trigger on_bluequest_user_created
after insert on auth.users
for each row execute procedure public.handle_new_bluequest_user();

-- Client users must never be allowed to grant themselves access.
revoke insert, update, delete on public.user_entitlements from anon, authenticated;
revoke insert, update, delete on public.social_connections from anon, authenticated;
revoke insert, update, delete on public.protected_content from anon, authenticated;
