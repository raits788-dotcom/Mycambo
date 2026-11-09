-- ============================================================================
-- 0035 — Colonnes price_range et languages sur businesses (si absentes)
-- ----------------------------------------------------------------------------
-- Alimentées par le wizard de demande (étape Détails) et affichables sur la
-- fiche publique. Idempotent.
-- ============================================================================

alter table public.businesses add column if not exists price_range text;
alter table public.businesses add column if not exists languages jsonb default '[]'::jsonb;

-- long_description est utilisée par la fiche publique ; on la garantit aussi.
alter table public.businesses add column if not exists long_description text;

select '0035 — price_range + languages (+ long_description garantie)' as resultat;
