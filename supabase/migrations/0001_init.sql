-- ============================================================================
-- MY CAMBO — Schéma de base de données initial
-- ============================================================================
-- Migration : 0001_init.sql
-- Créé le : 2025-01-15
-- Description : Création des 15 tables principales + index + RLS
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TENANTS (sociétés partenaires)
-- ============================================================================
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  description text,
  logo_url text,
  plan_id uuid,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended')),
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tenants_status on public.tenants(status);
create index if not exists idx_tenants_plan on public.tenants(plan_id);
create index if not exists idx_tenants_slug on public.tenants(slug);

-- ============================================================================
-- 2. TENANT_USERS (utilisateurs appartenant à un tenant)
-- ============================================================================
create table if not exists public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique(tenant_id, user_id)
);

create index if not exists idx_tenant_users_tenant on public.tenant_users(tenant_id);
create index if not exists idx_tenant_users_user on public.tenant_users(user_id);

-- ============================================================================
-- 3. CATEGORIES (catégories d'établissements)
-- ============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references public.categories(id) on delete set null,
  icon text,
  color text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_parent on public.categories(parent_id);

-- ============================================================================
-- 4. BUSINESSES (établissements)
-- ============================================================================
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  address text,
  city text,
  lat decimal(10, 8),
  lng decimal(11, 8),
  phone text,
  email text,
  website text,
  photos jsonb default '[]'::jsonb,
  hours jsonb default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'suspended')),
  is_featured boolean not null default false,
  featured_position int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_businesses_tenant on public.businesses(tenant_id);
create index if not exists idx_businesses_category on public.businesses(category_id);
create index if not exists idx_businesses_status on public.businesses(status);
create index if not exists idx_businesses_featured on public.businesses(is_featured) where is_featured = true;
create index if not exists idx_businesses_city on public.businesses(city);
create index if not exists idx_businesses_slug on public.businesses(slug);

-- ============================================================================
-- 5. LABELS (badges)
-- ============================================================================
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  color text default '#1B3A6B',
  icon text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 6. BUSINESS_LABELS (association business <-> label)
-- ============================================================================
create table if not exists public.business_labels (
  business_id uuid not null references public.businesses(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  primary key (business_id, label_id)
);

-- ============================================================================
-- 7. PLANS (formules d'abonnement)
-- ============================================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_monthly decimal(10, 2) not null default 0,
  price_yearly decimal(10, 2),
  currency text not null default 'USD' check (currency in ('USD', 'KHR')),
  max_businesses int not null default 1,
  features jsonb default '[]'::jsonb,
  trial_days int not null default 0,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_plans_slug on public.plans(slug);
create index if not exists idx_plans_active on public.plans(is_active);

-- ============================================================================
-- 8. SUBSCRIPTIONS (abonnements)
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active'
    check (status in ('active', 'expiring', 'expired', 'past_due', 'canceled')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_tenant on public.subscriptions(tenant_id);
create index if not exists idx_subscriptions_plan on public.subscriptions(plan_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_end on public.subscriptions(current_period_end);

-- ============================================================================
-- 9. PAYMENTS (paiements)
-- ============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  amount decimal(10, 2) not null,
  currency text not null default 'USD' check (currency in ('USD', 'KHR')),
  method text not null check (method in ('aba', 'wing', 'bakong', 'stripe', 'manual')),
  gateway_ref text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_tenant on public.payments(tenant_id);
create index if not exists idx_payments_subscription on public.payments(subscription_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created on public.payments(created_at desc);

-- ============================================================================
-- 10. PARTNER_REQUESTS (demandes partenaires)
-- ============================================================================
create table if not exists public.partner_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  email text not null,
  phone text,
  category text,
  city text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_partner_requests_status on public.partner_requests(status);
create index if not exists idx_partner_requests_created on public.partner_requests(created_at desc);

-- ============================================================================
-- 11. CMS_PAGES (pages du site)
-- ============================================================================
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content jsonb default '{}'::jsonb,
  seo_title text,
  seo_description text,
  og_image text,
  status text not null default 'published'
    check (status in ('published', 'draft')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_cms_pages_slug on public.cms_pages(slug);

-- ============================================================================
-- 12. CAROUSEL_SLIDES (carrousel d'accueil)
-- ============================================================================
create table if not exists public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  cta_label text,
  cta_href text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_carousel_slides_position on public.carousel_slides(position) where is_active = true;

-- ============================================================================
-- 13. MEDIA (bibliothèque d'images)
-- ============================================================================
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  size_bytes bigint,
  mime_type text,
  width int,
  height int,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_media_created on public.media(created_at desc);

-- ============================================================================
-- 14. AUDIT_LOGS (traçabilité)
-- ============================================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('superadmin', 'tenant', 'system', 'visitor')),
  action text not null,
  entity_type text,
  entity_id text,
  changes jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action);

-- ============================================================================
-- 15. IMPERSONATION_TOKENS (impersonation SuperAdmin)
-- ============================================================================
create table if not exists public.impersonation_tokens (
  id uuid primary key default gen_random_uuid(),
  superadmin_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_impersonation_tokens_token on public.impersonation_tokens(token);
create index if not exists idx_impersonation_tokens_expires on public.impersonation_tokens(expires_at);

-- ============================================================================
-- TRIGGERS — updated_at automatique
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger businesses_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger cms_pages_updated_at before update on public.cms_pages
  for each row execute function public.set_updated_at();

-- ============================================================================
-- FIN DE LA MIGRATION 0001
-- ============================================================================