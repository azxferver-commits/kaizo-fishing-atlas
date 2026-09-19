create table if not exists public.discord_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

alter table public.discord_oauth_states enable row level security;
revoke all on public.discord_oauth_states from anon, authenticated;

create index if not exists discord_oauth_states_expires_idx
  on public.discord_oauth_states(expires_at);

create unique index if not exists social_connections_discord_external_unique
  on public.social_connections(external_user_id)
  where provider='discord' and verified=true and external_user_id is not null;
