create table if not exists public.social_rewards (
  provider text not null check (provider in ('discord','youtube','twitch')),
  module_key text not null,
  enabled boolean not null default true,
  primary key(provider, module_key)
);

alter table public.social_rewards enable row level security;

drop policy if exists "social rewards visible" on public.social_rewards;
create policy "social rewards visible" on public.social_rewards
for select to anon, authenticated using (enabled = true);

-- Safe defaults. Change these rows later without rebuilding the mobile app.
insert into public.social_rewards(provider, module_key) values
  ('discord', 'community'),
  ('discord', 'boss_atlas'),
  ('youtube', 'community'),
  ('youtube', 'fishing_tools'),
  ('youtube', 'gold_saucer')
on conflict do nothing;

revoke insert, update, delete on public.social_rewards from anon, authenticated;
