-- ============================================================================
-- 0017 — PÉRIODE D'ESSAI GRATUITE
-- ============================================================================
-- Essai réservé aux NOUVEAUX partenaires, UNE SEULE FOIS par établissement,
-- durée configurable (défaut 7 jours) depuis la console superadmin.
-- À la fin de l'essai sans paiement validé -> retombe en Découverte.
-- ============================================================================

-- Durée d'essai configurable (dans platform_settings)
insert into public.platform_settings (key, value, label) values
  ('trial_days', '7', 'Durée de la période d''essai (jours)')
on conflict (key) do nothing;

-- Marqueur d'essai sur l'établissement (ne se réinitialise jamais)
alter table public.businesses add column if not exists trial_used boolean not null default false;
alter table public.businesses add column if not exists trial_ends_at timestamptz;

-- subscriptions.business_id : souscription par établissement (attendu par le code,
-- absent du schéma initial qui ne liait la souscription qu'au tenant).
alter table public.subscriptions add column if not exists business_id uuid
  references public.businesses(id) on delete cascade;

-- subscriptions.business_id unique (nécessaire au "on conflict" de start_trial).
-- Nettoie d'abord d'éventuels doublons en gardant la souscription la plus récente.
delete from public.subscriptions s
using public.subscriptions s2
where s.business_id = s2.business_id
  and s.business_id is not null
  and s.created_at < s2.created_at;
create unique index if not exists uniq_subscription_business
  on public.subscriptions(business_id);

-- ----------------------------------------------------------------------------
-- Démarrer un essai : seulement si jamais utilisé pour cet établissement.
-- Crée une souscription active limitée à la durée d'essai (pas de paiement).
-- ----------------------------------------------------------------------------
create or replace function public.start_trial(p_business uuid, p_plan_slug text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_used boolean;
  v_tenant uuid;
  v_plan uuid;
  v_version uuid;
  v_days int;
  v_sub uuid;
begin
  select trial_used, tenant_id into v_used, v_tenant
    from public.businesses where id = p_business;
  if v_used is null then
    return jsonb_build_object('ok', false, 'error', 'Établissement introuvable');
  end if;
  if v_used then
    return jsonb_build_object('ok', false, 'error', 'Essai déjà utilisé pour cet établissement');
  end if;

  select id into v_plan from public.plans where slug = p_plan_slug;
  if v_plan is null then
    return jsonb_build_object('ok', false, 'error', 'Formule inconnue');
  end if;
  select id into v_version from public.plan_versions
    where plan_id = v_plan and status = 'current' limit 1;

  -- Durée d'essai configurée
  select coalesce(nullif(value, '')::int, 7) into v_days
    from public.platform_settings where key = 'trial_days';
  v_days := coalesce(v_days, 7);

  -- Souscription d'essai active, limitée à la durée d'essai
  insert into public.subscriptions
    (tenant_id, business_id, plan_id, plan_version_id, status,
     current_period_start, current_period_end)
  values
    (v_tenant, p_business, v_plan, v_version, 'active',
     now(), now() + make_interval(days => v_days))
  on conflict (business_id) do update set
    plan_id = excluded.plan_id,
    plan_version_id = excluded.plan_version_id,
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + make_interval(days => v_days),
    updated_at = now()
  returning id into v_sub;

  -- Marquer l'essai comme utilisé + publier l'établissement
  update public.businesses
    set trial_used = true, trial_ends_at = now() + make_interval(days => v_days),
        status = 'approved'
    where id = p_business;

  return jsonb_build_object('ok', true, 'subscription', v_sub,
    'trial_ends_at', now() + make_interval(days => v_days), 'days', v_days);
end$$;
revoke all on function public.start_trial(uuid, text) from public, anon;
grant execute on function public.start_trial(uuid, text) to authenticated;

-- Note : l'expiration de l'essai est gérée par expire_subscriptions() (0012),
-- qui fait retomber en Découverte toute souscription active échue. Comme
-- l'essai est une souscription active avec current_period_end = fin d'essai,
-- il est traité automatiquement par la tâche quotidienne (0014).

select '0017 — période d''essai gratuite' as resultat;
