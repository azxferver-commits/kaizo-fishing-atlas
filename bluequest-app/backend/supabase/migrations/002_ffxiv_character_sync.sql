-- BlueQuest FFXIV Lodestone character sync
create table if not exists public.ffxiv_characters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lodestone_id bigint not null,
  name text not null,
  world text,
  data_center text,
  title text,
  avatar_url text,
  portrait_url text,
  active_job text,
  active_job_level integer,
  jobs jsonb not null default '[]'::jsonb,
  source_url text not null,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ffxiv_characters enable row level security;
drop policy if exists "ffxiv character read own" on public.ffxiv_characters;
create policy "ffxiv character read own" on public.ffxiv_characters for select to authenticated using (user_id = auth.uid());
drop policy if exists "ffxiv character delete own" on public.ffxiv_characters;
create policy "ffxiv character delete own" on public.ffxiv_characters for delete to authenticated using (user_id = auth.uid());
revoke insert, update on public.ffxiv_characters from anon, authenticated;
grant select, delete on public.ffxiv_characters to authenticated;
revoke all on public.ffxiv_characters from anon;
create index if not exists ffxiv_characters_lodestone_id_idx on public.ffxiv_characters(lodestone_id);