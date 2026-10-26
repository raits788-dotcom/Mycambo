-- ============================================================================
-- 0004 — TABLES MANQUANTES
-- ============================================================================
-- Ces 21 tables sont appelées par le code (.from('...')) mais n'étaient pas
-- décrites dans les migrations. Toutes en "if not exists" : si une table
-- existe déjà dans votre Supabase, cette migration ne la touche pas ; si elle
-- manque, elle est créée. Aucun risque sur les données existantes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- RÉFÉRENTIELS
-- ---------------------------------------------------------------------------

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  province text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Catalogue des labels (Vérifié, Coup de cœur, Éco-responsable, etc.)
create table if not exists public.label_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  color text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Labels attribués aux tenants / établissements
create table if not exists public.tenant_labels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  label_id uuid not null references public.label_catalog(id) on delete cascade,
  granted_by uuid,
  granted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FORMULES (détails et versions)
-- ---------------------------------------------------------------------------

create table if not exists public.plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  feature_key text not null,
  feature_label text,
  feature_value text,
  category text,
  position int not null default 0
);

create table if not exists public.plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  version int not null default 1,
  price_monthly decimal(10, 2),
  price_yearly decimal(10, 2),
  snapshot jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AVIS & FAVORIS
-- ---------------------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  author_id uuid,
  author_name text,
  rating int check (rating between 1 and 5),
  comment text,
  visit_type text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'requested', 'accepted', 'rejected_by_org')),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, business_id)
);

-- ---------------------------------------------------------------------------
-- WORKFLOWS MODÉRATION (remplacent les 4 modules localStorage)
-- ---------------------------------------------------------------------------

-- Demandes de modification de fiche (partenaire -> admin)
create table if not exists public.modification_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  requested_by uuid,
  field text,
  current_value text,
  new_value text,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Demandes de suppression de fiche
create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  requested_by uuid,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Suspensions d'établissements
create table if not exists public.suspensions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  reason text not null,
  custom_reason text,
  detail text,
  suspended_by uuid,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  lifted_at timestamptz
);

-- Alertes de modération
create table if not exists public.suspension_alerts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  type text,
  message text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- STATISTIQUES (remplacent le stats-tracker localStorage)
-- ---------------------------------------------------------------------------

-- Un événement par interaction (vue, soutien, clic téléphone/site/itinéraire)
create table if not exists public.business_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null
    check (event_type in ('view', 'support', 'click_phone', 'click_website', 'click_directions')),
  created_at timestamptz not null default now()
);
create index if not exists idx_business_events_biz on public.business_events(business_id);
create index if not exists idx_business_events_type on public.business_events(event_type);
create index if not exists idx_business_events_date on public.business_events(created_at);

-- ---------------------------------------------------------------------------
-- VÉRIFICATION
-- ---------------------------------------------------------------------------

create table if not exists public.tenant_verifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  status text not null default 'incomplete'
    check (status in ('incomplete', 'submitted', 'under_review', 'approved', 'rejected')),
  submitted_at timestamptz,
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_history (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid references public.tenant_verifications(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  from_status text,
  to_status text,
  actor_id uuid,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS / MESSAGES / LOGS
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  tenant_id uuid references public.tenants(id) on delete cascade,
  scope text not null default 'user'
    check (scope in ('user', 'tenant', 'admin')),
  title text,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text,
  email text,
  subject text,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  ip text,
  user_agent text,
  success boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  field text,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PARRAINAGE
-- ---------------------------------------------------------------------------

create table if not exists public.referral_settings (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default true,
  reward_label text,
  reward_value text,
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_referrals int not null default 0,
  reward text,
  position int not null default 0
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid,
  code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_code text,
  referred_tenant_id uuid references public.tenants(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rewarded')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- STORAGE (paramètres et alertes)
-- ---------------------------------------------------------------------------

create table if not exists public.storage_settings (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans(id) on delete cascade,
  quota_mb int not null default 100,
  max_photo_size_mb decimal(5, 2) default 1.5,
  updated_at timestamptz not null default now()
);

create table if not exists public.storage_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  type text,
  message text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

select '0004 — 21 tables manquantes créées (si absentes)' as resultat;
