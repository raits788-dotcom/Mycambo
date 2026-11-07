-- ============================================================================
-- Rattrapage : attribuer la bonne formule aux tenants déjà créés.
-- ----------------------------------------------------------------------------
-- Les tenants approuvés avant le correctif ont tous reçu "Découverte".
-- On corrige : un tenant dont la demande est une association -> plan
-- "association" ; les autres gardent "decouverte". Relie par email.
-- Idempotent.
-- ============================================================================

-- Contrôle avant
select t.name, t.email, pr.category,
       p.slug as plan_actuel
from public.tenants t
join public.partner_requests pr on lower(pr.email) = lower(t.email)
left join public.plans p on p.id = t.plan_id
where pr.status = 'approved'
order by t.name;

-- Correction : associations -> plan "association"
update public.tenants t
set plan_id = (select id from public.plans where slug = 'association')
from public.partner_requests pr
where lower(pr.email) = lower(t.email)
  and pr.status = 'approved'
  and pr.category = 'association'
  and t.plan_id is distinct from (select id from public.plans where slug = 'association');

-- (Les commerces restent en "decouverte" ; rien à changer.)

-- Contrôle après
select t.name, t.email, pr.category, p.slug as plan_corrige
from public.tenants t
join public.partner_requests pr on lower(pr.email) = lower(t.email)
left join public.plans p on p.id = t.plan_id
where pr.status = 'approved'
order by t.name;
