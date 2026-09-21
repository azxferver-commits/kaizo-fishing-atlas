-- KAIZO Boss Mechanics Atlas schema snapshot\n-- Project: lyppcxbtzuegcqmwmebb\n-- Generated: 2026-09-21\n-- No secrets included.\n\nCREATE TABLE public.boss_atlas_dungeons (
  id text NOT NULL,
  name text NOT NULL,
  expansion text NOT NULL,
  level integer NOT NULL,
  source_url text,
  sort_order integer NOT NULL,
  content_type text DEFAULT 'Dungeon'::text NOT NULL,
  series_name text,
  party_size integer DEFAULT 4 NOT NULL
);

CREATE TABLE public.boss_atlas_encounters (
  id text NOT NULL,
  dungeon_id text NOT NULL,
  encounter_order integer NOT NULL,
  name text NOT NULL,
  guide_status boolean DEFAULT false NOT NULL
);

CREATE TABLE public.boss_atlas_guides (
  boss_id text NOT NULL,
  summary text NOT NULL,
  raw_scenes jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.boss_atlas_jobs (
  code text NOT NULL,
  role text NOT NULL,
  role_order integer NOT NULL,
  tip text NOT NULL,
  icon_data_uri text,
  icon_remote_url text,
  icon_source_url text,
  icon_sha256 text
);

CREATE TABLE public.boss_atlas_maps (
  dungeon_id text NOT NULL,
  map_id text NOT NULL,
  remote_url text,
  source_url text,
  mime_type text NOT NULL,
  data_uri text NOT NULL,
  sha256 text NOT NULL,
  byte_size integer NOT NULL
);

CREATE TABLE public.boss_atlas_mechanics (
  phase_id text NOT NULL,
  mechanic_order integer NOT NULL,
  name text NOT NULL,
  description text NOT NULL
);

CREATE TABLE public.boss_atlas_meta (
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.boss_atlas_phase_steps (
  phase_id text NOT NULL,
  audience_role text NOT NULL,
  step_order integer NOT NULL,
  instruction text NOT NULL
);

CREATE TABLE public.boss_atlas_phases (
  id text NOT NULL,
  boss_id text NOT NULL,
  phase_order integer NOT NULL,
  title text NOT NULL,
  cue text NOT NULL,
  layout text NOT NULL
);

CREATE TABLE public.boss_atlas_roles (
  role text NOT NULL,
  label text NOT NULL,
  icon_data_uri text NOT NULL,
  icon_remote_url text,
  icon_source_url text,
  icon_sha256 text NOT NULL
);

CREATE TABLE public.boss_atlas_visuals (
  owner_type text NOT NULL,
  owner_id text NOT NULL,
  local_path text,
  remote_url text,
  source_url text,
  mime_type text,
  data_uri text NOT NULL,
  sha256 text NOT NULL,
  byte_size integer NOT NULL
);

CREATE TABLE public.boss_master_arena_elements (
  arena_element_id text NOT NULL,
  phase_id text NOT NULL,
  mechanic_id text,
  element_type text NOT NULL,
  geometry text NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_assets (
  asset_id text NOT NULL,
  owner_type text NOT NULL,
  owner_id text NOT NULL,
  asset_type text NOT NULL,
  source_url text,
  sha256 text,
  verification_status text NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_bosses (
  boss_id text NOT NULL,
  duty_id text NOT NULL,
  name text NOT NULL,
  legacy_name text,
  encounter_order integer NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.boss_master_duties (
  duty_id text NOT NULL,
  name text NOT NULL,
  expansion text NOT NULL,
  level integer NOT NULL,
  content_type text NOT NULL,
  sort_order integer NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.boss_master_job_recommendations (
  recommendation_id text NOT NULL,
  boss_id text NOT NULL,
  phase_id text,
  job_id text NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_jobs (
  job_id text NOT NULL,
  abbreviation text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  subrole text NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_mechanics (
  mechanic_id text NOT NULL,
  phase_id text NOT NULL,
  boss_id text NOT NULL,
  mechanic_order integer NOT NULL,
  name text NOT NULL,
  verification_status text NOT NULL,
  mechanic_types text[] DEFAULT '{}'::text[] NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_meta (
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.boss_master_phases (
  phase_id text NOT NULL,
  boss_id text NOT NULL,
  phase_order integer NOT NULL,
  title text NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_role_guides (
  phase_role_id text NOT NULL,
  phase_id text NOT NULL,
  boss_id text NOT NULL,
  role text NOT NULL,
  verification_status text NOT NULL,
  payload jsonb NOT NULL
);

CREATE TABLE public.boss_master_sources (
  source_id text NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  publisher text NOT NULL,
  source_type text NOT NULL,
  retrieved_at timestamp with time zone,
  payload jsonb NOT NULL
);

ALTER TABLE ONLY public.boss_atlas_dungeons ADD CONSTRAINT boss_atlas_dungeons_content_type_check CHECK (content_type = ANY (ARRAY['Dungeon'::text, 'Trial'::text, 'Normal Raid'::text, 'Alliance Raid'::text, 'Ultimate'::text, 'Variant/Criterion'::text]));

ALTER TABLE ONLY public.boss_atlas_dungeons ADD CONSTRAINT boss_atlas_dungeons_level_check CHECK (level > 0);

ALTER TABLE ONLY public.boss_atlas_dungeons ADD CONSTRAINT boss_atlas_dungeons_party_size_check CHECK (party_size = ANY (ARRAY[4, 8, 24]));

ALTER TABLE ONLY public.boss_atlas_dungeons ADD CONSTRAINT boss_atlas_dungeons_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.boss_atlas_dungeons ADD CONSTRAINT boss_atlas_dungeons_sort_order_check CHECK (sort_order > 0);

ALTER TABLE ONLY public.boss_atlas_dungeons ADD CONSTRAINT boss_atlas_dungeons_sort_order_key UNIQUE (sort_order);

ALTER TABLE ONLY public.boss_atlas_encounters ADD CONSTRAINT boss_atlas_encounters_dungeon_id_encounter_order_key UNIQUE (dungeon_id, encounter_order);

ALTER TABLE ONLY public.boss_atlas_encounters ADD CONSTRAINT boss_atlas_encounters_encounter_order_check CHECK (encounter_order > 0);

ALTER TABLE ONLY public.boss_atlas_encounters ADD CONSTRAINT boss_atlas_encounters_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.boss_atlas_guides ADD CONSTRAINT boss_atlas_guides_pkey PRIMARY KEY (boss_id);

ALTER TABLE ONLY public.boss_atlas_jobs ADD CONSTRAINT boss_atlas_jobs_pkey PRIMARY KEY (code);

ALTER TABLE ONLY public.boss_atlas_jobs ADD CONSTRAINT boss_atlas_jobs_role_check CHECK (role = ANY (ARRAY['Tank'::text, 'Healer'::text, 'Melee'::text, 'Ranged'::text, 'Caster'::text]));

ALTER TABLE ONLY public.boss_atlas_jobs ADD CONSTRAINT boss_atlas_jobs_role_order_check CHECK (role_order > 0);

ALTER TABLE ONLY public.boss_atlas_maps ADD CONSTRAINT boss_atlas_maps_byte_size_check CHECK (byte_size > 0);

ALTER TABLE ONLY public.boss_atlas_maps ADD CONSTRAINT boss_atlas_maps_pkey PRIMARY KEY (dungeon_id);

ALTER TABLE ONLY public.boss_atlas_mechanics ADD CONSTRAINT boss_atlas_mechanics_mechanic_order_check CHECK (mechanic_order > 0);

ALTER TABLE ONLY public.boss_atlas_mechanics ADD CONSTRAINT boss_atlas_mechanics_pkey PRIMARY KEY (phase_id, mechanic_order);

ALTER TABLE ONLY public.boss_atlas_meta ADD CONSTRAINT boss_atlas_meta_pkey PRIMARY KEY (key);

ALTER TABLE ONLY public.boss_atlas_phase_steps ADD CONSTRAINT boss_atlas_phase_steps_audience_role_check CHECK (audience_role = ANY (ARRAY['ALL'::text, 'Tank'::text, 'Healer'::text, 'Melee'::text, 'Ranged'::text, 'Caster'::text]));

ALTER TABLE ONLY public.boss_atlas_phase_steps ADD CONSTRAINT boss_atlas_phase_steps_pkey PRIMARY KEY (phase_id, audience_role, step_order);

ALTER TABLE ONLY public.boss_atlas_phase_steps ADD CONSTRAINT boss_atlas_phase_steps_step_order_check CHECK (step_order > 0);

ALTER TABLE ONLY public.boss_atlas_phases ADD CONSTRAINT boss_atlas_phases_boss_id_phase_order_key UNIQUE (boss_id, phase_order);

ALTER TABLE ONLY public.boss_atlas_phases ADD CONSTRAINT boss_atlas_phases_phase_order_check CHECK (phase_order > 0);

ALTER TABLE ONLY public.boss_atlas_phases ADD CONSTRAINT boss_atlas_phases_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.boss_atlas_roles ADD CONSTRAINT boss_atlas_roles_pkey PRIMARY KEY (role);

ALTER TABLE ONLY public.boss_atlas_roles ADD CONSTRAINT boss_atlas_roles_role_check CHECK (role = ANY (ARRAY['Tank'::text, 'Healer'::text, 'Melee'::text, 'Ranged'::text, 'Caster'::text]));

ALTER TABLE ONLY public.boss_atlas_visuals ADD CONSTRAINT boss_atlas_visuals_byte_size_check CHECK (byte_size > 0);

ALTER TABLE ONLY public.boss_atlas_visuals ADD CONSTRAINT boss_atlas_visuals_owner_type_check CHECK (owner_type = ANY (ARRAY['dungeon'::text, 'boss'::text]));

ALTER TABLE ONLY public.boss_atlas_visuals ADD CONSTRAINT boss_atlas_visuals_pkey PRIMARY KEY (owner_type, owner_id);

ALTER TABLE ONLY public.boss_master_arena_elements ADD CONSTRAINT boss_master_arena_elements_pkey PRIMARY KEY (arena_element_id);

ALTER TABLE ONLY public.boss_master_assets ADD CONSTRAINT boss_master_assets_pkey PRIMARY KEY (asset_id);

ALTER TABLE ONLY public.boss_master_bosses ADD CONSTRAINT boss_master_bosses_duty_id_encounter_order_key UNIQUE (duty_id, encounter_order);

ALTER TABLE ONLY public.boss_master_bosses ADD CONSTRAINT boss_master_bosses_encounter_order_check CHECK (encounter_order > 0);

ALTER TABLE ONLY public.boss_master_bosses ADD CONSTRAINT boss_master_bosses_pkey PRIMARY KEY (boss_id);

ALTER TABLE ONLY public.boss_master_duties ADD CONSTRAINT boss_master_duties_level_check CHECK (level > 0);

ALTER TABLE ONLY public.boss_master_duties ADD CONSTRAINT boss_master_duties_pkey PRIMARY KEY (duty_id);

ALTER TABLE ONLY public.boss_master_job_recommendations ADD CONSTRAINT boss_master_job_recommendations_pkey PRIMARY KEY (recommendation_id);

ALTER TABLE ONLY public.boss_master_jobs ADD CONSTRAINT boss_master_jobs_abbreviation_key UNIQUE (abbreviation);

ALTER TABLE ONLY public.boss_master_jobs ADD CONSTRAINT boss_master_jobs_pkey PRIMARY KEY (job_id);

ALTER TABLE ONLY public.boss_master_mechanics ADD CONSTRAINT boss_master_mechanics_mechanic_order_check CHECK (mechanic_order > 0);

ALTER TABLE ONLY public.boss_master_mechanics ADD CONSTRAINT boss_master_mechanics_name_check CHECK (btrim(name) <> ''::text);

ALTER TABLE ONLY public.boss_master_mechanics ADD CONSTRAINT boss_master_mechanics_pkey PRIMARY KEY (mechanic_id);

ALTER TABLE ONLY public.boss_master_meta ADD CONSTRAINT boss_master_meta_pkey PRIMARY KEY (key);

ALTER TABLE ONLY public.boss_master_phases ADD CONSTRAINT boss_master_phases_boss_id_phase_order_key UNIQUE (boss_id, phase_order);

ALTER TABLE ONLY public.boss_master_phases ADD CONSTRAINT boss_master_phases_phase_order_check CHECK (phase_order > 0);

ALTER TABLE ONLY public.boss_master_phases ADD CONSTRAINT boss_master_phases_pkey PRIMARY KEY (phase_id);

ALTER TABLE ONLY public.boss_master_role_guides ADD CONSTRAINT boss_master_role_guides_pkey PRIMARY KEY (phase_role_id);

ALTER TABLE ONLY public.boss_master_sources ADD CONSTRAINT boss_master_sources_pkey PRIMARY KEY (source_id);

ALTER TABLE ONLY public.boss_master_sources ADD CONSTRAINT boss_master_sources_url_key UNIQUE (url);

ALTER TABLE ONLY public.boss_atlas_encounters ADD CONSTRAINT boss_atlas_encounters_dungeon_id_fkey FOREIGN KEY (dungeon_id) REFERENCES boss_atlas_dungeons(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_atlas_guides ADD CONSTRAINT boss_atlas_guides_boss_id_fkey FOREIGN KEY (boss_id) REFERENCES boss_atlas_encounters(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_atlas_maps ADD CONSTRAINT boss_atlas_maps_dungeon_id_fkey FOREIGN KEY (dungeon_id) REFERENCES boss_atlas_dungeons(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_atlas_mechanics ADD CONSTRAINT boss_atlas_mechanics_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES boss_atlas_phases(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_atlas_phase_steps ADD CONSTRAINT boss_atlas_phase_steps_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES boss_atlas_phases(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_atlas_phases ADD CONSTRAINT boss_atlas_phases_boss_id_fkey FOREIGN KEY (boss_id) REFERENCES boss_atlas_encounters(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_arena_elements ADD CONSTRAINT boss_master_arena_elements_mechanic_id_fkey FOREIGN KEY (mechanic_id) REFERENCES boss_master_mechanics(mechanic_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_arena_elements ADD CONSTRAINT boss_master_arena_elements_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES boss_master_phases(phase_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_bosses ADD CONSTRAINT boss_master_bosses_duty_id_fkey FOREIGN KEY (duty_id) REFERENCES boss_master_duties(duty_id) ON UPDATE CASCADE;

ALTER TABLE ONLY public.boss_master_job_recommendations ADD CONSTRAINT boss_master_job_recommendations_boss_id_fkey FOREIGN KEY (boss_id) REFERENCES boss_master_bosses(boss_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_job_recommendations ADD CONSTRAINT boss_master_job_recommendations_job_id_fkey FOREIGN KEY (job_id) REFERENCES boss_master_jobs(job_id) ON UPDATE CASCADE;

ALTER TABLE ONLY public.boss_master_job_recommendations ADD CONSTRAINT boss_master_job_recommendations_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES boss_master_phases(phase_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_mechanics ADD CONSTRAINT boss_master_mechanics_boss_id_fkey FOREIGN KEY (boss_id) REFERENCES boss_master_bosses(boss_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_mechanics ADD CONSTRAINT boss_master_mechanics_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES boss_master_phases(phase_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_phases ADD CONSTRAINT boss_master_phases_boss_id_fkey FOREIGN KEY (boss_id) REFERENCES boss_master_bosses(boss_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_role_guides ADD CONSTRAINT boss_master_role_guides_boss_id_fkey FOREIGN KEY (boss_id) REFERENCES boss_master_bosses(boss_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.boss_master_role_guides ADD CONSTRAINT boss_master_role_guides_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES boss_master_phases(phase_id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX boss_atlas_encounters_dungeon_idx ON public.boss_atlas_encounters USING btree (dungeon_id, encounter_order);

CREATE INDEX boss_atlas_steps_phase_idx ON public.boss_atlas_phase_steps USING btree (phase_id, audience_role, step_order);

CREATE INDEX boss_atlas_phases_boss_idx ON public.boss_atlas_phases USING btree (boss_id, phase_order);

CREATE INDEX boss_master_arena_phase_idx ON public.boss_master_arena_elements USING btree (phase_id);

CREATE INDEX boss_master_assets_owner_idx ON public.boss_master_assets USING btree (owner_type, owner_id);

CREATE INDEX boss_master_bosses_duty_idx ON public.boss_master_bosses USING btree (duty_id, encounter_order);

CREATE INDEX boss_master_mechanics_boss_idx ON public.boss_master_mechanics USING btree (boss_id, mechanic_order);

CREATE INDEX boss_master_mechanics_phase_idx ON public.boss_master_mechanics USING btree (phase_id, mechanic_order);

CREATE INDEX boss_master_mechanics_types_gin ON public.boss_master_mechanics USING gin (mechanic_types);

CREATE INDEX boss_master_phases_boss_idx ON public.boss_master_phases USING btree (boss_id, phase_order);

CREATE INDEX boss_master_roles_phase_idx ON public.boss_master_role_guides USING btree (phase_id, role);