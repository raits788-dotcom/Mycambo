-- ============================================================================
-- SCRIPT 3 — VÉRIFICATION APRÈS MIGRATION (lecture seule)
-- ============================================================================
-- À lancer APRÈS avoir exécuté les migrations 0004 → 0017.
-- Confirme que tout est en place et qu'aucune donnée n'a été perdue
-- involontairement.
-- ============================================================================

-- 1. Les 10 nouvelles tables existent-elles maintenant ?
select '1. NOUVELLES TABLES CRÉÉES' as verification;
select expected.name as table_attendue,
       case when t.tablename is not null then '✅ présente' else '❌ MANQUANTE' end as etat
from (values
  ('offers'),('reservations'),('job_offers'),('job_applications'),
  ('suspensions'),('suspension_alerts'),('business_events'),
  ('category_services'),('platform_settings'),('deletion_requests')
) as expected(name)
left join pg_tables t on t.schemaname = 'public' and t.tablename = expected.name
order by expected.name;

-- 2. Les fonctions clés existent-elles ?
select '2. FONCTIONS CRÉÉES' as verification;
select expected.name as fonction_attendue,
       case when r.routine_name is not null then '✅ présente' else '❌ MANQUANTE' end as etat
from (values
  ('validate_manual_payment'),('can_switch_plan'),('expire_subscriptions'),
  ('admin_stats'),('tenant_roi_stats'),('start_trial'),('publish_plan_version'),
  ('current_plan_version'),('process_subscriptions_daily')
) as expected(name)
left join information_schema.routines r
  on r.routine_schema = 'public' and r.routine_name = expected.name
order by expected.name;

-- 3. Les 6 formules ont-elles leurs permissions + une version "current" ?
select '3. FORMULES ET VERSIONS' as verification;
select p.slug,
       case when p.permissions ? 'canShowPhotos' then '✅ permissions OK' else '❌ permissions manquantes' end as permissions,
       case when v.id is not null then '✅ version current' else '❌ pas de version' end as version
from public.plans p
left join public.plan_versions v on v.plan_id = p.id and v.status = 'current'
order by p.position;

-- 4. La formule Association (gratuite) existe-t-elle ?
select '4. FORMULE ASSOCIATION' as verification;
select case when exists (select 1 from public.plans where slug = 'association')
  then '✅ formule association présente'
  else '❌ formule association absente' end as etat;

-- 5. Les services par catégorie sont-ils en base ?
select '5. SERVICES PAR CATÉGORIE' as verification;
select category_slug, count(*) as nb_services
from public.category_services group by category_slug order by category_slug;

-- 6. Les coordonnées de virement sont-elles configurables ?
select '6. PARAMÈTRES PLATEFORME' as verification;
select key, case when value is null or value = '' then '(à configurer)' else value end as valeur
from public.platform_settings order by key;

-- 7. CONTRÔLE DONNÉES : aucune perte involontaire
--    Compare avec les chiffres notés dans le script 00 (point 6).
select '7. VOLUMÉTRIE APRÈS MIGRATION (comparez avec le script 00)' as verification;
select 'plans' as table_name, count(*) as lignes from public.plans
union all select 'businesses', count(*) from public.businesses
union all select 'tenants', count(*) from public.tenants
union all select 'subscriptions', count(*) from public.subscriptions
union all select 'payments', count(*) from public.payments
union all select 'reviews', count(*) from public.reviews;

-- 8. Comparaison souscriptions : avant vs après (via la sauvegarde)
select '8. SOUSCRIPTIONS : AVANT vs APRÈS' as verification;
select
  (select count(*) from backup_premig.subscriptions) as avant,
  (select count(*) from public.subscriptions) as apres,
  (select count(*) from backup_premig.subscriptions) - (select count(*) from public.subscriptions) as supprimees_par_dedoublonnage;
-- "supprimees_par_dedoublonnage" doit correspondre au nombre de doublons
-- détectés dans le script 00 (point 1). Si c'est le cas, tout est normal.
