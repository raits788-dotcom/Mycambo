-- ============================================================================
-- SCRIPT 2 — SAUVEGARDE AVANT MIGRATION
-- ============================================================================
-- IMPORTANT : ce script est un FILET DE SECOURS CIBLÉ, pas une sauvegarde
-- complète. Il copie les tables que les migrations modifient, pour pouvoir
-- restaurer en cas de problème.
--
-- ⚠️ LA VRAIE SAUVEGARDE COMPLÈTE se fait côté Supabase, PAS en SQL :
--    Supabase → Database → Backups → "Create backup" (ou activez les
--    Point-in-Time Recovery si disponible). Faites-la AVANT de lancer ce
--    script. Ce script complète la sauvegarde Supabase, il ne la remplace pas.
--
-- À lancer juste avant les migrations. Crée un schéma "backup_premig".
-- ============================================================================

create schema if not exists backup_premig;

-- Sauvegarde des tables que les migrations touchent (structure + données)
-- La plus critique : subscriptions (0017 y supprime des doublons)
drop table if exists backup_premig.subscriptions;
create table backup_premig.subscriptions as select * from public.subscriptions;

-- Les autres tables modifiées (ajout de colonnes, upserts)
drop table if exists backup_premig.plans;
create table backup_premig.plans as select * from public.plans;

drop table if exists backup_premig.plan_versions;
create table backup_premig.plan_versions as select * from public.plan_versions;

drop table if exists backup_premig.businesses;
create table backup_premig.businesses as select * from public.businesses;

-- Horodatage de la sauvegarde
drop table if exists backup_premig.info;
create table backup_premig.info as
  select now() as sauvegarde_le,
         (select count(*) from public.subscriptions) as subscriptions_count,
         (select count(*) from public.plans) as plans_count,
         (select count(*) from public.businesses) as businesses_count;

select '✅ Sauvegarde créée dans le schéma backup_premig' as resultat;
select * from backup_premig.info;

-- ----------------------------------------------------------------------------
-- POUR RESTAURER subscriptions en cas de problème (À NE LANCER QU'EN CAS DE SOUCI) :
--   truncate public.subscriptions;
--   insert into public.subscriptions select * from backup_premig.subscriptions;
-- (ne fonctionne que si la structure n'a pas changé ; sinon restaurez via
--  le backup Supabase complet)
--
-- POUR SUPPRIMER la sauvegarde une fois tout validé :
--   drop schema backup_premig cascade;
-- ----------------------------------------------------------------------------
