-- ============================================================================
-- 0037 — Formule Découverte : 1 photo autorisée
-- ----------------------------------------------------------------------------
-- Avant : Découverte = canShowPhotos:false, maxPhotos:0 → aucune photo publique.
-- Problème : une fiche gratuite sans aucune image donne une mauvaise image du
-- site. On autorise UNE photo (la principale) en Découverte.
--
-- La fiche publique lit plans.permissions (fallback code sinon). On fusionne le
-- JSON pour ne pas écraser les autres clés. Le code applique maxPhotos comme un
-- maximum exact (0 = zéro, 1 = une seule).
-- ============================================================================

update public.plans
set permissions = coalesce(permissions, '{}'::jsonb)
  || jsonb_build_object('canShowPhotos', true, 'maxPhotos', 1)
where slug = 'decouverte';

-- Idem sur la version courante de la formule (cohérence historique/versioning).
update public.plan_versions pv
set permissions = coalesce(pv.permissions, '{}'::jsonb)
  || jsonb_build_object('canShowPhotos', true, 'maxPhotos', 1)
from public.plans p
where pv.plan_id = p.id
  and p.slug = 'decouverte'
  and pv.status = 'current';

select slug, permissions->'canShowPhotos' as show_photos, permissions->'maxPhotos' as max_photos
from public.plans where slug = 'decouverte';
