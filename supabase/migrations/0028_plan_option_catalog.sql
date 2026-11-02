-- ============================================================================
-- 0028 — Catalogue d'options de formule (éditable superadmin) + permissions
-- ----------------------------------------------------------------------------
-- Problème corrigé : régler une option de formule (ex. "5 photos") n'avait
-- aucun effet car le catalogue de "fonctionnalités" n'était pas relié à
-- l'objet `permissions` que lit la fiche publique.
--
-- Ce catalogue DÉDIÉ décrit chaque option réglable : quelle clé de permission
-- elle pilote, comment elle se règle (interrupteur / nombre / menu), son
-- groupe visuel, son unité, sa valeur par défaut. La console superadmin peut
-- AJOUTER de nouvelles options en insérant une ligne ici. La modale de
-- formule lit ce catalogue, génère les champs et écrit dans permissions.
--
-- Table séparée de `plan_features` (qui reste la liste marketing d'arguments).
-- Idempotent.
-- ============================================================================

create table if not exists public.plan_option_catalog (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,               -- identifiant stable (ex. 'photos')
  label          text not null,                       -- nom affiché
  description    text,
  emoji          text,
  group_label    text not null default 'Général',     -- regroupement visuel
  permission_key text not null,                        -- clé écrite dans permissions
  control_type   text not null default 'toggle'
                   check (control_type in ('toggle','number','select')),
  unit           text,                                 -- ex. 'photos', 'Ko'
  options        jsonb not null default '[]'::jsonb,   -- pour 'select' : [{value,label}]
  default_value  jsonb,                                -- true / nombre / "chaine"
  min_value      numeric,                              -- pour 'number'
  max_value      numeric,
  linked_toggle  text,                                 -- toggle auto-vrai si number/select renseigné
  is_system      boolean not null default false,       -- option fournie (non supprimable)
  is_active      boolean not null default true,
  position       int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function public.touch_plan_option_catalog()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists trg_touch_option_catalog on public.plan_option_catalog;
create trigger trg_touch_option_catalog
  before update on public.plan_option_catalog
  for each row execute function public.touch_plan_option_catalog();

-- RLS : lecture publique (les permissions sont déjà publiques via `plans`),
-- écriture réservée au superadmin.
alter table public.plan_option_catalog enable row level security;

drop policy if exists option_catalog_read on public.plan_option_catalog;
create policy option_catalog_read on public.plan_option_catalog
  for select using (true);

drop policy if exists option_catalog_write on public.plan_option_catalog;
create policy option_catalog_write on public.plan_option_catalog
  for all using (public.is_superadmin()) with check (public.is_superadmin());

-- ---------------------------------------------------------------------------
-- Options "système" reliées aux permissions actuelles.
-- ---------------------------------------------------------------------------
insert into public.plan_option_catalog
  (code, label, description, emoji, group_label, permission_key, control_type,
   unit, options, default_value, min_value, max_value, linked_toggle, is_system, position)
values
  -- Médias
  ('photos', 'Photos', 'Galerie de photos sur la fiche publique.', '🖼️', 'Médias',
   'maxPhotos', 'number', 'photos', '[]'::jsonb, '10'::jsonb, 0, 999, 'canShowPhotos', true, 10),

  ('video', 'Vidéo de présentation', 'Lien vidéo (YouTube / Vimeo) en tête de fiche.', '🎬', 'Médias',
   'canShowVideo', 'toggle', null, '[]'::jsonb, 'false'::jsonb, null, null, null, true, 11),

  -- Visibilité & contenu
  ('description', 'Description détaillée', 'Texte long de présentation.', '📝', 'Visibilité & contenu',
   'canShowDescription', 'toggle', null, '[]'::jsonb, 'true'::jsonb, null, null, null, true, 20),

  ('social', 'Liens réseaux sociaux', 'Facebook, Instagram, site web affichés.', '🔗', 'Visibilité & contenu',
   'canShowSocialLinks', 'toggle', null, '[]'::jsonb, 'true'::jsonb, null, null, null, true, 21),

  ('hours', 'Horaires', 'Horaires d''ouverture affichés.', '🕐', 'Visibilité & contenu',
   'canShowHours', 'toggle', null, '[]'::jsonb, 'true'::jsonb, null, null, null, true, 22),

  ('featured', 'Mise en avant', 'La fiche peut être mise en avant (coup de cœur).', '⭐', 'Visibilité & contenu',
   'canBeFeatured', 'toggle', null, '[]'::jsonb, 'false'::jsonb, null, null, null, true, 23),

  ('banner', 'Bannière personnalisée', 'Bannière en tête de fiche.', '🏳️', 'Visibilité & contenu',
   'canShowBanner', 'toggle', null, '[]'::jsonb, 'false'::jsonb, null, null, null, true, 24),

  -- Statistiques (menu : aucune / base / détaillée)
  ('stats', 'Statistiques', 'Niveau de statistiques dans l''espace partenaire.', '📈', 'Statistiques',
   'statsLevel', 'select', null,
   '[{"value":"none","label":"Aucune"},{"value":"basic","label":"De base (vues, soutiens)"},{"value":"detailed","label":"Détaillées (sources, évolution)"}]'::jsonb,
   '"basic"'::jsonb, null, null, 'canShowStats', true, 30),

  -- Interactions du public
  ('messaging', 'Messages / contact', 'Le public peut contacter l''établissement.', '✉️', 'Interactions du public',
   'canReceiveMessages', 'toggle', null, '[]'::jsonb, 'true'::jsonb, null, null, null, true, 40),

  ('applications', 'Candidatures (emploi / bénévolat)', 'Active l''onglet Emploi et le bouton Postuler.', '💼', 'Interactions du public',
   'canReceiveApplications', 'toggle', null, '[]'::jsonb, 'false'::jsonb, null, null, null, true, 41),

  ('reservations', 'Réservations', 'Réservation en ligne (hôtels / restaurants).', '📅', 'Interactions du public',
   'canReceiveReservations', 'toggle', null, '[]'::jsonb, 'false'::jsonb, null, null, null, true, 42),

  ('offers', 'Offres du moment', 'Promotions affichées sur la fiche.', '🏷️', 'Interactions du public',
   'canPublishOffers', 'toggle', null, '[]'::jsonb, 'false'::jsonb, null, null, null, true, 43)

on conflict (code) do update set
  label          = excluded.label,
  description    = excluded.description,
  emoji          = excluded.emoji,
  group_label    = excluded.group_label,
  permission_key = excluded.permission_key,
  control_type   = excluded.control_type,
  unit           = excluded.unit,
  options        = excluded.options,
  min_value      = excluded.min_value,
  max_value      = excluded.max_value,
  linked_toggle  = excluded.linked_toggle,
  is_system      = true,
  position       = excluded.position;

-- Refléter le niveau de stats dans permissions des formules existantes.
update public.plans
set permissions = permissions ||
  jsonb_build_object('statsLevel',
    case when coalesce((permissions->>'canShowStats')::boolean, false) then 'basic' else 'none' end)
where not (permissions ? 'statsLevel');

select '0028 — catalogue d''options de formule' as resultat,
       count(*) as options
from public.plan_option_catalog;
