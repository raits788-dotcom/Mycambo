-- ============================================================================
-- 0022 — Projets des associations (avec promesses de don fléchées)
-- ----------------------------------------------------------------------------
-- Une association peut présenter des projets concrets (titre, description,
-- objectif de collecte, montant déjà collecté, échéance). Le public voit les
-- projets actifs et peut faire une PROMESSE DE DON fléchée (aucun paiement en
-- ligne : mise en relation, cohérent avec le reste de la plateforme).
-- Idempotent.
-- ============================================================================

create table if not exists public.association_projects (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  tenant_id     uuid references public.tenants(id) on delete cascade,
  title         text not null,
  description   text,
  -- objectif de collecte (optionnel) et montant déjà réuni, en USD
  goal_amount   numeric,
  raised_amount numeric not null default 0,
  currency      text not null default 'USD',
  -- échéance / date butoir optionnelle
  deadline      date,
  image_url     text,
  status        text not null default 'active'
    check (status in ('active','completed','archived')),
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_assoc_projects_biz on public.association_projects(business_id);
create index if not exists idx_assoc_projects_status on public.association_projects(status);

create or replace function public.touch_association_projects()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists trg_touch_assoc_projects on public.association_projects;
create trigger trg_touch_assoc_projects
  before update on public.association_projects
  for each row execute function public.touch_association_projects();

-- ---------------------------------------------------------------------------
-- RLS : public lit les projets actifs ; le tenant (ou superadmin) gère.
-- ---------------------------------------------------------------------------
alter table public.association_projects enable row level security;

drop policy if exists assoc_projects_read on public.association_projects;
create policy assoc_projects_read on public.association_projects for select
  using (
    status = 'active'
    or public.is_superadmin()
    or tenant_id = public.current_tenant_id()
  );

drop policy if exists assoc_projects_write on public.association_projects;
create policy assoc_projects_write on public.association_projects for all
  using (public.is_superadmin() or tenant_id = public.current_tenant_id())
  with check (public.is_superadmin() or tenant_id = public.current_tenant_id());

select '✅ Table association_projects créée' as resultat;
