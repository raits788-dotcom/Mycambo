-- ============================================================================
-- 0007 — SERVICES PAR CATÉGORIE EN BASE
-- ============================================================================
-- Les services proposés diffèrent selon la catégorie (hôtel = chambres,
-- restaurant = menu, etc.). Ils étaient codés en dur dans ServicesTab.tsx.
-- On les met en base pour pouvoir en ajouter/modifier sans toucher au code.
-- icon_key et color restent des clés mappées côté front (on ne stocke pas un
-- composant React en base), mais key/label/description viennent d'ici.
-- ============================================================================

create table if not exists public.category_services (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,        -- hotel, restaurant, association, activite, boutique
  service_key text not null,          -- rooms, menu, donations, ...
  label text not null,
  description text,
  icon_key text,                      -- clé d'icône mappée côté front (hotel, menu, heart...)
  color text,                         -- classes Tailwind
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_slug, service_key)
);
create index if not exists idx_category_services_cat on public.category_services(category_slug);

-- RLS : lecture publique, écriture superadmin
alter table public.category_services enable row level security;
drop policy if exists category_services_read on public.category_services;
create policy category_services_read on public.category_services for select using (true);
drop policy if exists category_services_write on public.category_services;
create policy category_services_write on public.category_services for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Seed des services (repris de ServicesTab.tsx)
insert into public.category_services (category_slug, service_key, label, description, icon_key, color, position) values
  -- Hôtel
  ('hotel', 'rooms',        'Chambres',               'Afficher vos chambres et tarifs',          'hotel',  'text-blue-600 bg-blue-100',   1),
  ('hotel', 'reservations', 'Réservations',           'Recevoir des demandes de réservation',     'target', 'text-green-600 bg-green-100',  2),
  ('hotel', 'offers',       'Offres promotionnelles', 'Créer des offres spéciales',               'heart',  'text-red-500 bg-red-100',     3),
  -- Restaurant
  ('restaurant', 'menu',         'Menu',         'Afficher votre menu et vos plats',     'menu',   'text-orange-600 bg-orange-100', 1),
  ('restaurant', 'reservations', 'Réservations', 'Recevoir des demandes de réservation', 'target', 'text-green-600 bg-green-100',    2),
  ('restaurant', 'shipping',     'Livraison',    'Proposer la livraison ou à emporter',  'bike',   'text-blue-600 bg-blue-100',     3),
  -- Association
  ('association', 'donations',  'Dons',      'Recevoir des promesses de don',        'heart',  'text-red-500 bg-red-100',    1),
  ('association', 'volunteers', 'Bénévolat', 'Recevoir des candidatures bénévoles',  'users',  'text-green-600 bg-green-100', 2),
  ('association', 'projects',   'Projets',   'Présenter vos projets en cours',       'target', 'text-orange-600 bg-orange-100', 3),
  -- Activité
  ('activite', 'tours',        'Tours / Activités', 'Présenter vos activités et horaires',  'compass', 'text-green-600 bg-green-100', 1),
  ('activite', 'reservations', 'Réservations',      'Recevoir des demandes de réservation', 'target',  'text-blue-600 bg-blue-100',  2),
  -- Boutique / Shopping
  ('boutique', 'products', 'Produits',  'Afficher vos produits en vente', 'shopping', 'text-purple-600 bg-purple-100', 1),
  ('boutique', 'shipping', 'Livraison', 'Proposer la livraison',          'bike',     'text-blue-600 bg-blue-100',     2)
on conflict (category_slug, service_key) do update set
  label       = excluded.label,
  description = excluded.description,
  icon_key    = excluded.icon_key,
  color       = excluded.color,
  position    = excluded.position;

select '0007 — services par catégorie en base' as resultat;
