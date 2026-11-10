-- ============================================================================
-- 0039 — Villes / provinces du Cambodge : RLS + seed
-- ----------------------------------------------------------------------------
-- La table public.cities existe (0004) mais n'avait ni RLS ni données. Le champ
-- ville du wizard était en saisie libre → incohérences ("Pnhom penh kampot").
--
-- On ajoute : lecture publique (RLS), écriture superadmin, et le seed des
-- 25 capitales de province du Cambodge. Le wizard propose une liste déroulante
-- + une option "Autre" (saisie libre) pour les villes/communes non listées.
-- ============================================================================

-- RLS : lecture publique, écriture superadmin
alter table public.cities enable row level security;
drop policy if exists cities_read on public.cities;
create policy cities_read on public.cities for select using (true);
drop policy if exists cities_write on public.cities;
create policy cities_write on public.cities for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Seed : capitales de province (+ Phnom Penh). slug = identifiant stable.
insert into public.cities (name, slug, province, position) values
  ('Phnom Penh',       'phnom-penh',       'Phnom Penh',        1),
  ('Siem Reap',        'siem-reap',        'Siem Reap',         2),
  ('Battambang',       'battambang',       'Battambang',        3),
  ('Sihanoukville',    'sihanoukville',    'Preah Sihanouk',    4),
  ('Kampot',           'kampot',           'Kampot',            5),
  ('Kep',              'kep',              'Kep',               6),
  ('Kampong Cham',     'kampong-cham',     'Kampong Cham',      7),
  ('Kampong Thom',     'kampong-thom',     'Kampong Thom',      8),
  ('Kampong Chhnang',  'kampong-chhnang',  'Kampong Chhnang',   9),
  ('Kampong Speu',     'kampong-speu',     'Kampong Speu',     10),
  ('Takéo',            'takeo',            'Takéo',            11),
  ('Kandal',           'kandal',           'Kandal',           12),
  ('Pursat',           'pursat',           'Pursat',           13),
  ('Koh Kong',         'koh-kong',         'Koh Kong',         14),
  ('Kratié',           'kratie',           'Kratié',           15),
  ('Stung Treng',      'stung-treng',      'Stung Treng',      16),
  ('Ratanakiri',       'ratanakiri',       'Ratanakiri',       17),
  ('Mondulkiri',       'mondulkiri',       'Mondulkiri',       18),
  ('Preah Vihear',     'preah-vihear',     'Preah Vihear',     19),
  ('Banlung',          'banlung',          'Ratanakiri',       20),
  ('Svay Rieng',       'svay-rieng',       'Svay Rieng',       21),
  ('Prey Veng',        'prey-veng',        'Prey Veng',        22),
  ('Banteay Meanchey', 'banteay-meanchey', 'Banteay Meanchey', 23),
  ('Oddar Meanchey',   'oddar-meanchey',   'Oddar Meanchey',   24),
  ('Pailin',           'pailin',           'Pailin',           25),
  ('Tboung Khmum',     'tboung-khmum',     'Tboung Khmum',     26)
on conflict (slug) do update set
  name     = excluded.name,
  province = excluded.province,
  position = excluded.position,
  is_active = true;

select count(*) as nb_villes from public.cities where is_active;
