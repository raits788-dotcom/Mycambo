-- ============================================================================
-- MY CAMBO — Row Level Security (RLS) + Custom Access Token Hook
-- ============================================================================
-- Migration : 0002_rls.sql
-- Description : Activation RLS, policies, hook JWT multi-tenant
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Vérifie si l'utilisateur courant est SuperAdmin
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin',
    false
  );
$$;

-- Récupère le tenant_id de l'utilisateur courant depuis le JWT
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select nullif(
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id'),
    ''
  )::uuid;
$$;

-- Récupère le rôle de l'utilisateur dans son tenant
create or replace function public.current_tenant_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select (auth.jwt() -> 'app_metadata' ->> 'tenant_role');
$$;

-- ============================================================================
-- 2. CUSTOM ACCESS TOKEN HOOK
-- ============================================================================
-- Ce hook injecte automatiquement tenant_id et role dans le JWT à chaque
-- connexion / refresh de token. Permet à RLS d'identifier le tenant sans
-- sous-requête (performance).

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb := event -> 'claims';
  uid uuid := (event ->> 'user_id')::uuid;
  v_tenant_id uuid;
  v_tenant_role text;
  v_is_superadmin boolean := false;
begin
  -- Cherche si l'utilisateur est lié à un tenant
  select tu.tenant_id, tu.role
    into v_tenant_id, v_tenant_role
  from public.tenant_users tu
  where tu.user_id = uid
  limit 1;

  -- Vérifie s'il est SuperAdmin (via app_metadata existant)
  v_is_superadmin := coalesce(
    (claims -> 'app_metadata' ->> 'role') = 'superadmin',
    false
  );

  -- Injecte dans app_metadata
  if claims -> 'app_metadata' is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  end if;

  if v_tenant_id is not null then
    claims := jsonb_set(
      claims,
      '{app_metadata,tenant_id}',
      to_jsonb(v_tenant_id)
    );
    claims := jsonb_set(
      claims,
      '{app_metadata,tenant_role}',
      to_jsonb(v_tenant_role)
    );
  end if;

  if v_is_superadmin then
    claims := jsonb_set(
      claims,
      '{app_metadata,role}',
      to_jsonb('superadmin'::text)
    );
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Autoriser le hook à être appelé par Supabase Auth
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

-- ============================================================================
-- 3. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================================================

alter table public.tenants              enable row level security;
alter table public.tenant_users         enable row level security;
alter table public.categories           enable row level security;
alter table public.businesses           enable row level security;
alter table public.labels               enable row level security;
alter table public.business_labels      enable row level security;
alter table public.plans                enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.payments             enable row level security;
alter table public.partner_requests     enable row level security;
alter table public.cms_pages            enable row level security;
alter table public.carousel_slides      enable row level security;
alter table public.media                enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.impersonation_tokens enable row level security;

-- ============================================================================
-- 4. POLICIES — TENANTS
-- ============================================================================
-- SuperAdmin : accès complet
-- Membre du tenant : peut voir son tenant
-- Public : rien

create policy "tenants_superadmin_all"
  on public.tenants for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "tenants_member_read"
  on public.tenants for select
  to authenticated
  using (id = public.current_tenant_id());

create policy "tenants_member_update"
  on public.tenants for update
  to authenticated
  using (
    id = public.current_tenant_id()
    and public.current_tenant_role() in ('owner', 'admin')
  )
  with check (
    id = public.current_tenant_id()
    and public.current_tenant_role() in ('owner', 'admin')
  );

-- ============================================================================
-- 5. POLICIES — TENANT_USERS
-- ============================================================================

create policy "tenant_users_superadmin_all"
  on public.tenant_users for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "tenant_users_member_read"
  on public.tenant_users for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

-- ============================================================================
-- 6. POLICIES — CATEGORIES (lecture publique)
-- ============================================================================

create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

create policy "categories_superadmin_all"
  on public.categories for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 7. POLICIES — BUSINESSES
-- ============================================================================
-- Public : peut voir les établissements approuvés
-- Membre du tenant : voit + modifie ses établissements
-- SuperAdmin : tout

create policy "businesses_public_read"
  on public.businesses for select
  to anon, authenticated
  using (status = 'approved');

create policy "businesses_superadmin_all"
  on public.businesses for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "businesses_member_all"
  on public.businesses for all
  to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

-- ============================================================================
-- 8. POLICIES — LABELS & BUSINESS_LABELS
-- ============================================================================

create policy "labels_public_read"
  on public.labels for select
  to anon, authenticated
  using (true);

create policy "labels_superadmin_all"
  on public.labels for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "business_labels_public_read"
  on public.business_labels for select
  to anon, authenticated
  using (true);

create policy "business_labels_superadmin_all"
  on public.business_labels for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 9. POLICIES — PLANS (lecture publique)
-- ============================================================================

create policy "plans_public_read"
  on public.plans for select
  to anon, authenticated
  using (is_active = true);

create policy "plans_superadmin_all"
  on public.plans for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 10. POLICIES — SUBSCRIPTIONS
-- ============================================================================

create policy "subscriptions_superadmin_all"
  on public.subscriptions for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "subscriptions_member_read"
  on public.subscriptions for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

-- ============================================================================
-- 11. POLICIES — PAYMENTS
-- ============================================================================

create policy "payments_superadmin_all"
  on public.payments for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "payments_member_read"
  on public.payments for select
  to authenticated
  using (tenant_id = public.current_tenant_id());

-- ============================================================================
-- 12. POLICIES — PARTNER_REQUESTS
-- ============================================================================
-- Public (anon) : peut créer une demande (formulaire public)
-- SuperAdmin : peut tout voir/modifier
-- Membre : ne voit rien

create policy "partner_requests_anon_insert"
  on public.partner_requests for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "partner_requests_superadmin_all"
  on public.partner_requests for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 13. POLICIES — CMS_PAGES (lecture publique)
-- ============================================================================

create policy "cms_pages_public_read"
  on public.cms_pages for select
  to anon, authenticated
  using (status = 'published');

create policy "cms_pages_superadmin_all"
  on public.cms_pages for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 14. POLICIES — CAROUSEL_SLIDES (lecture publique)
-- ============================================================================

create policy "carousel_slides_public_read"
  on public.carousel_slides for select
  to anon, authenticated
  using (is_active = true);

create policy "carousel_slides_superadmin_all"
  on public.carousel_slides for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 15. POLICIES — MEDIA
-- ============================================================================

create policy "media_public_read"
  on public.media for select
  to anon, authenticated
  using (true);

create policy "media_superadmin_all"
  on public.media for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- 16. POLICIES — AUDIT_LOGS
-- ============================================================================
-- Seul le SuperAdmin peut lire les logs
-- Insertion : tout le monde authentifié peut insérer (pour traçabilité)

create policy "audit_logs_superadmin_read"
  on public.audit_logs for select
  to authenticated
  using (public.is_superadmin());

create policy "audit_logs_authenticated_insert"
  on public.audit_logs for insert
  to authenticated
  with check (true);

create policy "audit_logs_anon_insert"
  on public.audit_logs for insert
  to anon
  with check (actor_type = 'visitor');

-- ============================================================================
-- 17. POLICIES — IMPERSONATION_TOKENS
-- ============================================================================
-- SuperAdmin uniquement (création, lecture, suppression)

create policy "impersonation_tokens_superadmin_all"
  on public.impersonation_tokens for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ============================================================================
-- FIN DE LA MIGRATION 0002
-- ============================================================================