-- ============================================================================
-- 0024 — Accès au tenant pour TOUS ses membres (équipe)
-- ----------------------------------------------------------------------------
-- Problème : un collaborateur qui rejoint une équipe (tenant_users) voyait
-- "Aucun tenant associé". La policy tenants_member_read repose sur
-- current_tenant_id() (lu dans le JWT), qui n'est pas renseigné pour un
-- collaborateur invité -> il ne peut pas lire son tenant.
--
-- Correctif : un utilisateur peut lire (et mettre à jour selon le rôle) un
-- tenant dès qu'il figure dans tenant_users de ce tenant, sans dépendre du JWT.
-- Idempotent.
-- ============================================================================

-- Fonction : l'utilisateur courant est-il membre de ce tenant ?
create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_users tu
    where tu.tenant_id = p_tenant_id
      and tu.user_id = auth.uid()
  );
$$;

-- Fonction : rôle de l'utilisateur courant dans ce tenant (ou null).
create or replace function public.tenant_member_role(p_tenant_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select tu.role from public.tenant_users tu
  where tu.tenant_id = p_tenant_id and tu.user_id = auth.uid()
  limit 1;
$$;

-- Lecture du tenant : superadmin, OU via JWT (current_tenant_id), OU membre.
drop policy if exists "tenants_member_read" on public.tenants;
create policy "tenants_member_read"
  on public.tenants for select
  to authenticated
  using (
    public.is_superadmin()
    or id = public.current_tenant_id()
    or public.is_tenant_member(id)
  );

-- Mise à jour du tenant : owner/admin via JWT OU owner membre.
drop policy if exists "tenants_member_update" on public.tenants;
create policy "tenants_member_update"
  on public.tenants for update
  to authenticated
  using (
    public.is_superadmin()
    or (id = public.current_tenant_id() and public.current_tenant_role() in ('owner','admin'))
    or public.tenant_member_role(id) = 'owner'
  )
  with check (
    public.is_superadmin()
    or (id = public.current_tenant_id() and public.current_tenant_role() in ('owner','admin'))
    or public.tenant_member_role(id) = 'owner'
  );

select '✅ Accès tenant par appartenance configuré' as resultat;
