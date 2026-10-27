-- ============================================================================
-- SCRIPT 1 — VÉRIFICATION AVANT MIGRATION (lecture seule, ne modifie RIEN)
-- ============================================================================
-- À lancer dans le SQL Editor de Supabase AVANT d'exécuter les migrations.
-- Il ne fait que LIRE. Il vous dit s'il y a des points à régler d'abord.
-- Lisez chaque résultat : si une section renvoie des lignes marquées
-- "⚠️ À VÉRIFIER", réglez-les avant de migrer.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. LE POINT CRITIQUE : doublons de souscriptions par établissement
--    La migration 0017 SUPPRIME les doublons (garde le plus récent).
--    Si cette requête renvoie des lignes, des souscriptions SERONT supprimées.
-- ----------------------------------------------------------------------------
select '1. DOUBLONS DE SOUSCRIPTIONS (seront supprimés par 0017)' as verification;
select business_id,
       count(*) as nb_souscriptions,
       '⚠️ À VÉRIFIER : ' || (count(*) - 1) || ' souscription(s) seront supprimées' as impact
from public.subscriptions
where business_id is not null
group by business_id
having count(*) > 1;
-- Si AUCUNE ligne : rien ne sera supprimé, vous pouvez migrer sereinement.

-- ----------------------------------------------------------------------------
-- 2. Combien de souscriptions au total (pour comparer après migration)
-- ----------------------------------------------------------------------------
select '2. NOMBRE DE SOUSCRIPTIONS (notez ce chiffre)' as verification;
select count(*) as total_souscriptions,
       count(*) filter (where business_id is not null) as avec_business_id,
       count(*) filter (where business_id is null) as sans_business_id
from public.subscriptions;

-- ----------------------------------------------------------------------------
-- 3. Les tables que mes migrations vont CRÉER existent-elles déjà ?
--    (si oui, le "if not exists" les laisse intactes — pas de risque)
-- ----------------------------------------------------------------------------
select '3. TABLES NOUVELLES (seront créées si absentes)' as verification;
select t.tablename,
       case when t.tablename is not null then 'existe déjà (sera préservée)' else 'sera créée' end as etat
from (values
  ('offers'),('reservations'),('job_offers'),('job_applications'),
  ('suspensions'),('suspension_alerts'),('business_events'),
  ('category_services'),('platform_settings'),('deletion_requests')
) as expected(name)
left join pg_tables t on t.schemaname = 'public' and t.tablename = expected.name;

-- ----------------------------------------------------------------------------
-- 4. Les fonctions que mes migrations remplacent (create or replace)
--    Si vous en avez des versions MAISON, elles seront écrasées.
-- ----------------------------------------------------------------------------
select '4. FONCTIONS QUI SERONT REMPLACÉES (vérifiez si versions maison)' as verification;
select routine_name,
       '⚠️ sera remplacée par ma version' as impact
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'validate_manual_payment','can_switch_plan','expire_subscriptions',
    'admin_stats','tenant_roi_stats','start_trial','publish_plan_version',
    'current_plan_version','process_subscriptions_daily','featured_by_sector',
    'featured_all','set_featured','count_featured'
  )
order by routine_name;
-- Les fonctions NON listées ici n'existent pas encore et seront créées proprement.

-- ----------------------------------------------------------------------------
-- 5. plans.slug a-t-il une contrainte unique ? (0006 en a besoin)
-- ----------------------------------------------------------------------------
select '5. CONTRAINTE UNIQUE SUR plans.slug' as verification;
select case
  when exists (
    select 1 from pg_constraint c join pg_class t on t.oid = c.conrelid
    where t.relname = 'plans' and c.contype in ('u','p')
      and pg_get_constraintdef(c.oid) ilike '%(slug)%'
  ) then '✅ existe déjà'
  else 'sera créée par 0006 (plans_slug_unique)'
end as etat;

-- ----------------------------------------------------------------------------
-- 6. Résumé : nombre de lignes dans les tables clés (à comparer après)
-- ----------------------------------------------------------------------------
select '6. VOLUMÉTRIE ACTUELLE (notez pour comparer après migration)' as verification;
select 'plans' as table_name, count(*) as lignes from public.plans
union all select 'businesses', count(*) from public.businesses
union all select 'tenants', count(*) from public.tenants
union all select 'subscriptions', count(*) from public.subscriptions
union all select 'payments', count(*) from public.payments
union all select 'reviews', count(*) from public.reviews;
