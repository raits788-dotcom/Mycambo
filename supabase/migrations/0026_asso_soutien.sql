-- ============================================================================
-- 0026 — Onglet "Nous soutenir" des associations
-- ----------------------------------------------------------------------------
-- Une colonne jsonb `support_options` sur businesses : la liste des façons
-- d'aider que l'association active, chacune avec un éventuel lien ou texte.
-- Exemple :
-- [
--   { "type": "don",        "enabled": true },
--   { "type": "parrainage", "enabled": true,  "description": "..." },
--   { "type": "benevolat",  "enabled": true },
--   { "type": "adhesion",   "enabled": true,  "url": "https://..." },
--   { "type": "mecenat",    "enabled": false, "description": "..." }
-- ]
-- Les types connus : don, parrainage, benevolat, adhesion, mecenat, boutique.
-- Idempotent.
-- ============================================================================

alter table public.businesses
  add column if not exists support_options jsonb not null default '[]'::jsonb;

comment on column public.businesses.support_options is
  'Façons de soutenir l''association : [{ "type": "...", "enabled": bool, "description": "...", "url": "..." }].';

select '✅ Colonne support_options ajoutée' as resultat;
