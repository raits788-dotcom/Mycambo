-- ============================================================================
-- Répare les projets d'association dont tenant_id est NULL ou incohérent.
-- ----------------------------------------------------------------------------
-- Les imports SQL de projets ont pu laisser tenant_id à NULL, ce qui bloque
-- la suppression/mise à jour (filtrage par tenant_id). On recolle le
-- tenant_id depuis le business du projet.
-- Idempotent.
-- ============================================================================

-- Contrôle avant
select count(*) as projets_a_reparer
from public.association_projects p
join public.businesses b on b.id = p.business_id
where p.tenant_id is distinct from b.tenant_id;

-- Réparation : aligne tenant_id du projet sur celui de son business.
update public.association_projects p
set tenant_id = b.tenant_id
from public.businesses b
where b.id = p.business_id
  and p.tenant_id is distinct from b.tenant_id;

-- Contrôle après (doit renvoyer 0)
select count(*) as projets_restant_incoherents
from public.association_projects p
join public.businesses b on b.id = p.business_id
where p.tenant_id is distinct from b.tenant_id;
