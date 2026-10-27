-- ============================================================================
-- 0010 — RÉSERVATIONS & OFFRES DU MOMENT
-- ============================================================================
-- Rend fonctionnelles les interactions commerce :
--  - reservations : le public demande une réservation (hôtel/restaurant)
--  - offers : le partenaire publie des offres du moment, visibles sur la fiche
-- Le bridage par formule (canReceiveReservations / canPublishOffers) est géré
-- côté application.
-- ============================================================================

-- Demandes de réservation (hôtel : séjour ; restaurant : table)
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  party_size int,                       -- nb de personnes (resto) / chambres (hôtel)
  date_from date,                       -- date de réservation / arrivée
  date_to date,                         -- départ (hôtel) ; null pour resto
  time_slot text,                       -- créneau (restaurant)
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists idx_reservations_biz on public.reservations(business_id);

alter table public.reservations enable row level security;
-- Le public peut CRÉER une demande ; seul le tenant/staff la lit et la gère.
drop policy if exists reservations_insert on public.reservations;
create policy reservations_insert on public.reservations for insert with check (true);
drop policy if exists reservations_read on public.reservations;
create policy reservations_read on public.reservations for select
  using (public.is_superadmin() or tenant_id = public.current_tenant_id());
drop policy if exists reservations_update on public.reservations;
create policy reservations_update on public.reservations for update
  using (public.is_superadmin() or tenant_id = public.current_tenant_id());

-- Offres du moment (promotions publiées par le partenaire)
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  discount text,                        -- ex : "-20%", "2 pour 1"
  valid_from date,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_offers_biz on public.offers(business_id);

alter table public.offers enable row level security;
-- Le public LIT les offres actives ; le tenant/staff les gère.
drop policy if exists offers_read on public.offers;
create policy offers_read on public.offers for select
  using (is_active = true or public.is_superadmin() or tenant_id = public.current_tenant_id());
drop policy if exists offers_write on public.offers;
create policy offers_write on public.offers for all
  using (public.is_superadmin() or tenant_id = public.current_tenant_id())
  with check (public.is_superadmin() or tenant_id = public.current_tenant_id());

select '0010 — réservations & offres créées' as resultat;
