-- ============================================================================
-- 0015 — VERSIONING DES FORMULES (geler le contenu souscrit)
-- ============================================================================
-- Objectif : éditer le prix/contenu d'une formule SANS impacter les abonnements
-- en cours. Chaque souscription est "gelée" sur la version souscrite ; seules
-- les nouvelles souscriptions (et les renouvellements) prennent la version
-- courante.
-- ============================================================================

-- 1. plan_versions : colonnes nécessaires au versioning (ajoutées si absentes).
--    status peut déjà exister avec sa propre contrainte : on ne l'ajoute que
--    s'il manque, sans imposer un CHECK qui entrerait en conflit.
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='plan_versions' and column_name='status') then
    alter table public.plan_versions add column status text not null default 'current';
  end if;
end$$;
alter table public.plan_versions add column if not exists max_businesses int;
alter table public.plan_versions add column if not exists permissions jsonb default '{}'::jsonb;
alter table public.plan_versions add column if not exists features jsonb default '[]'::jsonb;

-- Un seul "current" par formule
create unique index if not exists uniq_plan_version_current
  on public.plan_versions(plan_id) where status = 'current';

-- 2. Lier chaque souscription à la version souscrite
alter table public.subscriptions add column if not exists plan_version_id uuid
  references public.plan_versions(id) on delete set null;

-- 3. Créer une version "current" pour chaque formule existante si elle n'en a pas.
--    trial_days est fourni (NOT NULL dans le schéma), repris depuis la formule.
insert into public.plan_versions (plan_id, version, price_monthly, price_yearly, max_businesses, trial_days, permissions, features, status)
select p.id, 1, p.price_monthly, p.price_yearly, p.max_businesses, coalesce(p.trial_days, 0), p.permissions, p.features, 'current'
from public.plans p
where not exists (
  select 1 from public.plan_versions v where v.plan_id = p.id and v.status = 'current'
);

-- 4. Rattacher les souscriptions existantes à la version courante de leur formule
update public.subscriptions s
set plan_version_id = v.id
from public.plan_versions v
where v.plan_id = s.plan_id and v.status = 'current' and s.plan_version_id is null;

-- ----------------------------------------------------------------------------
-- 5. Récupérer la version courante d'une formule (pour la souscription)
-- ----------------------------------------------------------------------------
create or replace function public.current_plan_version(p_plan_slug text)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(v) from public.plan_versions v
  join public.plans p on p.id = v.plan_id
  where p.slug = p_plan_slug and v.status = 'current'
  limit 1;
$$;
grant execute on function public.current_plan_version(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. Publier une nouvelle version d'une formule : archive l'ancienne "current",
--    crée la nouvelle en "current". Les abonnements en cours gardent leur
--    version (plan_version_id figé) ; seules les nouvelles souscriptions
--    prendront la nouvelle. Réservé au staff.
-- ----------------------------------------------------------------------------
create or replace function public.publish_plan_version(
  p_plan_id uuid,
  p_price_monthly numeric,
  p_price_yearly numeric,
  p_max_businesses int,
  p_permissions jsonb,
  p_features jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_next int;
  v_id uuid;
begin
  if not public.is_superadmin() then
    return jsonb_build_object('ok', false, 'error', 'Non autorisé');
  end if;

  -- Archiver la version courante
  update public.plan_versions set status = 'archived'
    where plan_id = p_plan_id and status = 'current';

  -- Numéro de version suivant
  select coalesce(max(version), 0) + 1 into v_next
    from public.plan_versions where plan_id = p_plan_id;

  -- Nouvelle version courante (trial_days repris de la formule, NOT NULL).
  insert into public.plan_versions
    (plan_id, version, price_monthly, price_yearly, max_businesses, trial_days, permissions, features, status)
  values
    (p_plan_id, v_next, p_price_monthly, p_price_yearly, p_max_businesses,
     coalesce((select trial_days from public.plans where id = p_plan_id), 0),
     p_permissions, p_features, 'current')
  returning id into v_id;

  -- Refléter la version courante sur la ligne "plans" (pour l'affichage public)
  update public.plans set
    price_monthly = p_price_monthly,
    price_yearly  = p_price_yearly,
    max_businesses = coalesce(p_max_businesses, max_businesses),
    permissions   = p_permissions,
    features      = p_features
  where id = p_plan_id;

  return jsonb_build_object('ok', true, 'version', v_next, 'version_id', v_id);
end$$;
revoke all on function public.publish_plan_version(uuid, numeric, numeric, int, jsonb, jsonb) from public, anon;
grant execute on function public.publish_plan_version(uuid, numeric, numeric, int, jsonb, jsonb) to authenticated;

select '0015 — versioning des formules (abonnements en cours préservés)' as resultat;
