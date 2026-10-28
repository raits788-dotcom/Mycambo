-- ============================================================================
-- 0023 — Équipe du partenaire : rôles et invitations
-- ----------------------------------------------------------------------------
-- Un partenaire (owner) peut inviter des collaborateurs avec un rôle qui
-- restreint ce qu'ils peuvent faire :
--   owner  : tout (propriétaire ; au moins un par tenant, non rétrogradable)
--   editor : édite la fiche (infos, photos, services, projets) ; pas l'équipe
--            ni l'abonnement
--   viewer : lecture seule (voit demandes/stats, ne modifie rien)
--
-- tenant_users.role existe déjà (owner lors du rattachement). On ajoute la
-- contrainte de valeurs + une table d'invitations en attente.
-- Idempotent.
-- ============================================================================

-- 1. Normaliser / contraindre les rôles de tenant_users
do $$
begin
  -- toute valeur hors liste bascule en 'editor' par sécurité avant contrainte
  update public.tenant_users
    set role = 'editor'
    where role not in ('owner','editor','viewer');

  if not exists (
    select 1 from pg_constraint where conname = 'tenant_users_role_check'
  ) then
    alter table public.tenant_users
      add constraint tenant_users_role_check
      check (role in ('owner','editor','viewer'));
  end if;
end$$;

-- 2. Invitations d'équipe en attente (le collaborateur n'a pas encore de compte
--    ou n'a pas encore accepté).
create table if not exists public.team_invitations (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  email        text not null,
  role         text not null default 'editor'
    check (role in ('owner','editor','viewer')),
  token_hash   text not null unique,
  invited_by   uuid,
  status       text not null default 'pending'
    check (status in ('pending','accepted','revoked','expired')),
  expires_at   timestamptz not null,
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_team_inv_tenant on public.team_invitations(tenant_id);
create unique index if not exists idx_team_inv_token on public.team_invitations(token_hash);

alter table public.team_invitations enable row level security;

-- Lecture / gestion : membres du tenant (owner) ou superadmin.
drop policy if exists team_inv_rw on public.team_invitations;
create policy team_inv_rw on public.team_invitations for all
  to authenticated
  using (public.is_superadmin() or tenant_id = public.current_tenant_id())
  with check (public.is_superadmin() or tenant_id = public.current_tenant_id());

-- 3. RLS tenant_users : permettre au owner de voir/gérer les membres de SON
--    tenant (en plus du superadmin).
alter table public.tenant_users enable row level security;

drop policy if exists tenant_users_self_read on public.tenant_users;
create policy tenant_users_self_read on public.tenant_users for select
  to authenticated
  using (
    public.is_superadmin()
    or tenant_id = public.current_tenant_id()
    or user_id = auth.uid()
  );

drop policy if exists tenant_users_owner_manage on public.tenant_users;
create policy tenant_users_owner_manage on public.tenant_users for all
  to authenticated
  using (public.is_superadmin() or tenant_id = public.current_tenant_id())
  with check (public.is_superadmin() or tenant_id = public.current_tenant_id());

select '✅ Équipe & rôles configurés' as resultat;
