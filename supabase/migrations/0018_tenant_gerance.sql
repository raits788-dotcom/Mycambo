-- ============================================================================
-- 0018 — TENANTS EN GÉRANCE myCAMBO
-- ============================================================================
-- Pour l'import en masse : un tenant par association, créé SANS compte de
-- connexion (aucune ligne dans tenant_users). Marqué "en gérance myCAMBO".
-- Quand l'association réclame son accès (via le workflow partenaire, validé
-- manuellement), on lui crée un compte et on lève le drapeau.
-- ============================================================================

-- Drapeau : ce tenant est géré par myCAMBO en attendant que l'association
-- réclame son accès. Tant que true, aucun partenaire ne gère ce tenant.
alter table public.tenants add column if not exists managed_by_mycambo boolean not null default false;

-- Date à laquelle l'association a réclamé et obtenu son accès (null = pas encore).
alter table public.tenants add column if not exists claimed_at timestamptz;

-- Index pour retrouver facilement les tenants non réclamés
create index if not exists idx_tenants_managed on public.tenants(managed_by_mycambo) where managed_by_mycambo = true;

select '0018 — marqueur de gérance myCAMBO sur tenants' as resultat;
