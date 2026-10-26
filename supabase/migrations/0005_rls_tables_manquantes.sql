-- ============================================================================
-- 0005 — RLS DES TABLES MANQUANTES
-- ============================================================================
-- Active RLS + policies sur les 21 tables de 0004, en réutilisant les helpers
-- existants : is_superadmin(), current_tenant_id().
-- Principe : référentiels lisibles par tous, écriture staff ; données de tenant
-- visibles par leur tenant + staff.
-- ============================================================================

-- Référentiels publics (lecture tous, écriture superadmin)
do $$
declare t text;
begin
  foreach t in array array['cities','label_catalog','plan_features','plan_versions',
                           'referral_settings','referral_tiers','storage_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_read on public.%I', t, t);
    execute format('create policy %I_read on public.%I for select using (true)', t, t);
    execute format('drop policy if exists %I_write on public.%I', t, t);
    execute format('create policy %I_write on public.%I for all using (public.is_superadmin()) with check (public.is_superadmin())', t, t);
  end loop;
end$$;

-- Tables liées à un tenant (lecture : tenant propriétaire + superadmin ; écriture : superadmin)
do $$
declare t text;
begin
  foreach t in array array['tenant_labels','modification_requests','deletion_requests',
                           'suspensions','tenant_verifications',
                           'verification_history','contact_messages','referral_codes',
                           'storage_alerts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_read on public.%I', t, t);
    execute format('create policy %I_read on public.%I for select using (public.is_superadmin() or tenant_id = public.current_tenant_id())', t, t);
    execute format('drop policy if exists %I_staff on public.%I', t, t);
    execute format('create policy %I_staff on public.%I for all using (public.is_superadmin()) with check (public.is_superadmin())', t, t);
  end loop;
end$$;

-- suspension_alerts & referrals : lecture + écriture staff seulement
--   (pas de tenant_id direct : suspension_alerts a business_id, referrals a referred_tenant_id)
alter table public.suspension_alerts enable row level security;
drop policy if exists suspension_alerts_staff on public.suspension_alerts;
create policy suspension_alerts_staff on public.suspension_alerts for all
  using (public.is_superadmin()) with check (public.is_superadmin());

alter table public.referrals enable row level security;
drop policy if exists referrals_read on public.referrals;
create policy referrals_read on public.referrals for select
  using (public.is_superadmin() or referred_tenant_id = public.current_tenant_id());
drop policy if exists referrals_write on public.referrals;
create policy referrals_write on public.referrals for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Avis : lecture publique des avis approuvés, écriture staff
alter table public.reviews enable row level security;
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select
  using (status = 'approved' or public.is_superadmin() or tenant_id = public.current_tenant_id());
drop policy if exists reviews_write on public.reviews;
create policy reviews_write on public.reviews for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Favoris : chacun gère les siens
alter table public.favorites enable row level security;
drop policy if exists favorites_own on public.favorites;
create policy favorites_own on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notifications : chacun voit les siennes (user ou tenant) + admin
alter table public.notifications enable row level security;
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select
  using (user_id = auth.uid() or tenant_id = public.current_tenant_id() or public.is_superadmin());
drop policy if exists notifications_write on public.notifications;
create policy notifications_write on public.notifications for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Événements stats : écriture par tous (tracking), lecture tenant + staff
alter table public.business_events enable row level security;
drop policy if exists events_insert on public.business_events;
create policy events_insert on public.business_events for insert with check (true);
drop policy if exists events_read on public.business_events;
create policy events_read on public.business_events for select
  using (public.is_superadmin() or exists (
    select 1 from public.businesses b
    where b.id = business_events.business_id and b.tenant_id = public.current_tenant_id()));

-- Login logs & profile history : lecture staff, insertion système
alter table public.login_logs enable row level security;
drop policy if exists login_logs_read on public.login_logs;
create policy login_logs_read on public.login_logs for select using (public.is_superadmin());
drop policy if exists login_logs_insert on public.login_logs;
create policy login_logs_insert on public.login_logs for insert with check (true);

alter table public.profile_history enable row level security;
drop policy if exists profile_history_own on public.profile_history;
create policy profile_history_own on public.profile_history for select
  using (user_id = auth.uid() or public.is_superadmin());
drop policy if exists profile_history_insert on public.profile_history;
create policy profile_history_insert on public.profile_history for insert with check (true);

select '0005 — RLS des tables manquantes appliquée' as resultat;
