-- ============================================================================
-- 0038 — COMMODITÉS (équipements/services) PAR CATÉGORIE — source unique
-- ----------------------------------------------------------------------------
-- Problème corrigé : il existait deux systèmes de "services" déconnectés —
--   (A) category_services  : fonctionnalités activables (Chambres, Dons…)
--   (B) businesses.services : commodités saisies au wizard (Wi-Fi, Parking…)
-- La fiche publique montrait (B), l'éditeur partenaire montrait (A), et pour
-- "transport" (A) était vide → "Aucun service" côté partenaire alors que des
-- commodités génériques (Wi-Fi, Piscine…) sortaient en public pour un taxi.
--
-- Solution : UNE table de commodités par catégorie, lue par le wizard,
-- l'éditeur partenaire ET la fiche publique. Les commodités sont adaptées à
-- chaque catégorie (un taxi n'a pas de piscine).
--
-- Clé de stockage : businesses.services reste un jsonb { "<amenity_key>": true }.
-- Les clés ci-dessous (amenity_key) sont celles écrites dans ce jsonb.
-- ============================================================================

create table if not exists public.category_amenities (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,     -- slug de la catégorie (transport, cafe, hotel-standard, resto-khmer…) ou famille
  amenity_key text not null,       -- clé stockée dans businesses.services (ex: 'clim', 'wifi', 'bagages')
  label text not null,             -- libellé FR affiché
  icon_key text,                   -- clé d'icône mappée côté front
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_slug, amenity_key)
);
create index if not exists idx_category_amenities_cat on public.category_amenities(category_slug);

-- RLS : lecture publique, écriture superadmin
alter table public.category_amenities enable row level security;
drop policy if exists category_amenities_read on public.category_amenities;
create policy category_amenities_read on public.category_amenities for select using (true);
drop policy if exists category_amenities_write on public.category_amenities;
create policy category_amenities_write on public.category_amenities for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- ── SEED ────────────────────────────────────────────────────────────────────
-- Les commodités sont rattachées au slug de FAMILLE (transport, cafe, hotel,
-- restaurant, association, activite, shopping, spa, immobilier). Le front
-- résout la famille d'un établissement via sa catégorie (parent_id) pour
-- charger la bonne liste, ce qui couvre toutes les sous-catégories.

insert into public.category_amenities (category_slug, amenity_key, label, icon_key, position) values
  -- ── TRANSPORT & LOCATION (taxi, location de véhicules, navette) ──
  ('transport', 'clim',            'Climatisation',            'snowflake', 1),
  ('transport', 'bagages',         'Bagages volumineux',       'briefcase', 2),
  ('transport', 'paiement_carte',  'Paiement par carte',       'credit-card', 3),
  ('transport', 'chauffeur_en',    'Chauffeur anglophone',     'languages', 4),
  ('transport', 'resa',            'Réservation à l''avance',  'calendar', 5),
  ('transport', 'h24',             'Disponible 24/24',         'clock', 6),
  ('transport', 'longue_distance', 'Longue distance',          'route', 7),
  ('transport', 'transfert_aero',  'Transfert aéroport',       'plane', 8),
  ('transport', 'groupe',          'Véhicule groupe (6+)',     'users', 9),
  ('transport', 'wifi',            'Wi-Fi à bord',             'wifi', 10),

  -- ── CAFÉS & SALONS DE THÉ ──
  ('cafe', 'wifi',       'Wi-Fi',           'wifi', 1),
  ('cafe', 'terrasse',   'Terrasse',        'sun', 2),
  ('cafe', 'clim',       'Climatisation',   'snowflake', 3),
  ('cafe', 'emporter',   'À emporter',      'package', 4),
  ('cafe', 'veggie',     'Options végé',    'leaf', 5),
  ('cafe', 'paiement_carte', 'Paiement carte', 'credit-card', 6),

  -- ── BOUTIQUES & SHOPPING ──
  ('shopping', 'paiement_carte', 'Paiement par carte', 'credit-card', 1),
  ('shopping', 'livraison',      'Livraison',          'bike', 2),
  ('shopping', 'clim',           'Climatisation',      'snowflake', 3),
  ('shopping', 'sur_mesure',     'Sur mesure',         'scissors', 4),
  ('shopping', 'parking',        'Parking',            'parking', 5),

  -- ── SPAS & BIEN-ÊTRE ──
  ('spa', 'resa',          'Réservation',       'calendar', 1),
  ('spa', 'clim',          'Climatisation',     'snowflake', 2),
  ('spa', 'massage',       'Massage',           'hand', 3),
  ('spa', 'sauna',         'Sauna / Hammam',    'flame', 4),
  ('spa', 'produits_bio',  'Produits naturels', 'leaf', 5),
  ('spa', 'parking',       'Parking',           'parking', 6),

  -- ── IMMOBILIER ──
  ('immobilier', 'location',     'Location',            'key', 1),
  ('immobilier', 'vente',        'Vente',               'home', 2),
  ('immobilier', 'gestion',      'Gestion locative',    'clipboard', 3),
  ('immobilier', 'visite_video', 'Visite vidéo',        'video', 4),
  ('immobilier', 'en',           'Service anglophone',  'languages', 5),

  -- ── ACTIVITÉS & LOISIRS ──
  ('activite', 'resa',         'Réservation',        'calendar', 1),
  ('activite', 'guide_en',     'Guide anglophone',   'languages', 2),
  ('activite', 'groupe',       'Groupes',            'users', 3),
  ('activite', 'materiel',     'Matériel fourni',    'package', 4),
  ('activite', 'transport_inc','Transport inclus',   'route', 5),

  -- ── HÔTELS (toutes sous-catégories hotel-*) ──
  ('hotel', 'wifi',          'Wi-Fi',             'wifi', 1),
  ('hotel', 'piscine',       'Piscine',           'waves', 2),
  ('hotel', 'clim',          'Climatisation',     'snowflake', 3),
  ('hotel', 'petit_dej',     'Petit-déjeuner',    'coffee', 4),
  ('hotel', 'parking',       'Parking',           'parking', 5),
  ('hotel', 'resto',         'Restaurant',        'utensils', 6),
  ('hotel', 'navette',       'Navette',           'route', 7),
  ('hotel', 'pmr',           'Accès PMR',         'accessibility', 8),
  ('hotel', 'resa',          'Réservation',       'calendar', 9),

  -- ── RESTAURANTS (toutes sous-catégories resto-*) ──
  ('restaurant', 'wifi',      'Wi-Fi',          'wifi', 1),
  ('restaurant', 'terrasse',  'Terrasse',       'sun', 2),
  ('restaurant', 'clim',      'Climatisation',  'snowflake', 3),
  ('restaurant', 'resa',      'Réservation',    'calendar', 4),
  ('restaurant', 'veggie',    'Végétarien',     'leaf', 5),
  ('restaurant', 'livraison', 'Livraison',      'bike', 6),
  ('restaurant', 'emporter',  'À emporter',     'package', 7),
  ('restaurant', 'paiement_carte', 'Paiement carte', 'credit-card', 8),

  -- ── ASSOCIATIONS (toutes sous-catégories asso-*) ──
  ('association', 'benevolat',    'Bénévolat',       'users', 1),
  ('association', 'dons',         'Dons',            'heart', 2),
  ('association', 'visites',      'Visites',         'compass', 3),
  ('association', 'partenariats', 'Partenariats',    'handshake', 4),
  ('association', 'en',           'Accueil anglophone', 'languages', 5)
on conflict (category_slug, amenity_key) do update set
  label    = excluded.label,
  icon_key = excluded.icon_key,
  position = excluded.position,
  is_active = true;

select category_slug, count(*) as nb
from public.category_amenities group by category_slug order by category_slug;
