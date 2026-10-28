-- ============================================================================
-- 0020 — Chiffres d'impact des établissements (associations)
-- ----------------------------------------------------------------------------
-- Remplace l'onglet public "Statistiques" (vide, non pertinent pour le public)
-- par un onglet "Notre impact" que l'association renseigne elle-même :
-- une liste de { label, value }, ex. { "Enfants aidés", "120" }.
-- Stockée en jsonb sur businesses (tableau d'objets). "tout en base".
-- Idempotent.
-- ============================================================================

alter table public.businesses
  add column if not exists impact jsonb not null default '[]'::jsonb;

comment on column public.businesses.impact is
  'Chiffres d''impact affichés publiquement : tableau JSON [{ "label": "...", "value": "..." }].';

select '✅ Colonne impact ajoutée' as resultat;
