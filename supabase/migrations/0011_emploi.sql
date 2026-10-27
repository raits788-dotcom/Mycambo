-- ============================================================================
-- 0011 — EMPLOI PAR ÉTABLISSEMENT
-- ============================================================================
-- Un établissement peut publier des offres d'emploi, et le public peut
-- postuler. Bridé côté app par canReceiveApplications (formule).
-- ============================================================================

-- Offres d'emploi publiées par un établissement
create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  contract_type text,                   -- CDI, CDD, stage, saisonnier...
  location text,
  salary text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_job_offers_biz on public.job_offers(business_id);

alter table public.job_offers enable row level security;
drop policy if exists job_offers_read on public.job_offers;
create policy job_offers_read on public.job_offers for select
  using (is_active = true or public.is_superadmin() or tenant_id = public.current_tenant_id());
drop policy if exists job_offers_write on public.job_offers;
create policy job_offers_write on public.job_offers for all
  using (public.is_superadmin() or tenant_id = public.current_tenant_id())
  with check (public.is_superadmin() or tenant_id = public.current_tenant_id());

-- Candidatures (le public postule à une offre)
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_offer_id uuid references public.job_offers(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  candidate_name text not null,
  candidate_email text,
  candidate_phone text,
  message text,
  cv_url text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_job_applications_offer on public.job_applications(job_offer_id);

alter table public.job_applications enable row level security;
-- Le public CRÉE une candidature ; le tenant/staff la lit et la gère.
drop policy if exists job_applications_insert on public.job_applications;
create policy job_applications_insert on public.job_applications for insert with check (true);
drop policy if exists job_applications_read on public.job_applications;
create policy job_applications_read on public.job_applications for select
  using (public.is_superadmin() or tenant_id = public.current_tenant_id());
drop policy if exists job_applications_update on public.job_applications;
create policy job_applications_update on public.job_applications for update
  using (public.is_superadmin() or tenant_id = public.current_tenant_id());

select '0011 — emploi par établissement créé' as resultat;
