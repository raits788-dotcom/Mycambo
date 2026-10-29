-- ============================================================================
-- 0025 — Enrichissement fiches : Notre histoire + Notre équipe
-- ----------------------------------------------------------------------------
-- Deux colonnes jsonb sur businesses, renseignées par le partenaire et
-- affichées publiquement si non vides :
--   history     : frise chronologique [{ "year": "2018", "text": "..." }]
--   public_team : membres publics     [{ "name": "...", "role": "...",
--                                        "photo_url": "..." }]
-- (public_team est distinct de l'équipe de gestion tenant_users : ici ce sont
--  les personnes présentées sur la fiche publique, avec photo.)
-- Idempotent.
-- ============================================================================

alter table public.businesses
  add column if not exists history jsonb not null default '[]'::jsonb;

alter table public.businesses
  add column if not exists public_team jsonb not null default '[]'::jsonb;

comment on column public.businesses.history is
  'Frise chronologique publique : [{ "year": "2018", "text": "..." }].';
comment on column public.businesses.public_team is
  'Membres présentés publiquement : [{ "name": "...", "role": "...", "photo_url": "..." }].';

select '✅ Colonnes history + public_team ajoutées' as resultat;
