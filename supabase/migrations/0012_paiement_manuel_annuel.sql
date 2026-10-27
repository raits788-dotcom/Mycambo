-- ============================================================================
-- 0012 — PAIEMENT MANUEL + ABONNEMENT ANNUEL + DOWNGRADE CONTRÔLÉ
-- ============================================================================
-- Règles métier :
--  - Souscrire crée une souscription "pending_payment" (NON active) + un
--    paiement manuel "pending". Les fonctionnalités restent bridées.
--  - myCAMBO valide le paiement -> souscription "active" pour 1 an.
--  - Changement de formule seulement à l'échéance ; downgrade bloqué si le
--    partenaire dépasse les limites de la formule visée.
--  - À l'expiration sans paiement -> retombe en formule "decouverte" (visible).
-- ============================================================================

-- 1. Étendre les statuts de subscriptions pour inclure 'pending_payment'
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('pending_payment','active','expiring','expired','past_due','canceled'));

-- 2. Champs utiles : preuve de paiement + référence sur payments
alter table public.payments add column if not exists proof_url text;
alter table public.payments add column if not exists reference text;

-- ----------------------------------------------------------------------------
-- 3. Valider un paiement manuel -> active la souscription pour 1 an
--    (réservé au staff ; appelé depuis la console superadmin)
-- ----------------------------------------------------------------------------
create or replace function public.validate_manual_payment(p_payment uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sub uuid;
  v_tenant uuid;
begin
  if not public.is_superadmin() then
    return jsonb_build_object('ok', false, 'error', 'Non autorisé');
  end if;

  select subscription_id, tenant_id into v_sub, v_tenant
  from public.payments where id = p_payment;
  if v_sub is null then
    return jsonb_build_object('ok', false, 'error', 'Paiement ou souscription introuvable');
  end if;

  -- Paiement payé
  update public.payments
    set status = 'paid', paid_at = now()
    where id = p_payment;

  -- Souscription active pour 1 an à partir de maintenant
  update public.subscriptions
    set status = 'active',
        current_period_start = now(),
        current_period_end = now() + interval '1 year',
        updated_at = now()
    where id = v_sub;

  -- Le tenant devient actif
  update public.tenants set status = 'active' where id = v_tenant;

  return jsonb_build_object('ok', true, 'subscription', v_sub, 'valid_until', (now() + interval '1 year'));
end$$;
revoke all on function public.validate_manual_payment(uuid) from public, anon;
grant execute on function public.validate_manual_payment(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Vérifier si un tenant peut passer à une formule (contrôle downgrade)
--    Renvoie {ok, blocking:[...]} : la liste des dépassements à corriger.
-- ----------------------------------------------------------------------------
create or replace function public.can_switch_plan(p_tenant uuid, p_plan_slug text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_max_estab int;
  v_max_photos int;
  v_estab_count int;
  v_over_photos int;
  v_blocking jsonb := '[]'::jsonb;
begin
  -- Limites de la formule visée (depuis permissions + max_businesses)
  select coalesce((permissions->>'maxPhotos')::int, 0),
         coalesce(max_businesses, 1)
    into v_max_photos, v_max_estab
  from public.plans where slug = p_plan_slug;

  if v_max_photos is null then
    return jsonb_build_object('ok', false, 'error', 'Formule inconnue');
  end if;

  -- Nombre d'établissements du tenant
  select count(*) into v_estab_count
  from public.businesses where tenant_id = p_tenant and status <> 'suspended';

  if v_estab_count > v_max_estab then
    v_blocking := v_blocking || jsonb_build_object(
      'type', 'establishments',
      'current', v_estab_count, 'max', v_max_estab,
      'message', 'Vous avez ' || v_estab_count || ' établissement(s) ; cette formule en autorise ' || v_max_estab || '. Désactivez-en ' || (v_estab_count - v_max_estab) || '.');
  end if;

  -- Établissements dépassant la limite de photos
  select count(*) into v_over_photos
  from public.businesses
  where tenant_id = p_tenant
    and status <> 'suspended'
    and coalesce(jsonb_array_length(photos), 0) > v_max_photos;

  if v_over_photos > 0 then
    v_blocking := v_blocking || jsonb_build_object(
      'type', 'photos',
      'count', v_over_photos, 'max', v_max_photos,
      'message', v_over_photos || ' établissement(s) dépassent la limite de ' || v_max_photos || ' photos. Retirez les photos en trop.');
  end if;

  return jsonb_build_object(
    'ok', (jsonb_array_length(v_blocking) = 0),
    'blocking', v_blocking);
end$$;
grant execute on function public.can_switch_plan(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Expirer les abonnements échus -> retombent en formule "decouverte"
--    (à appeler par une tâche planifiée quotidienne)
-- ----------------------------------------------------------------------------
create or replace function public.expire_subscriptions()
returns int language plpgsql security definer set search_path = public as $$
declare
  v_decouverte uuid;
  v_count int := 0;
begin
  select id into v_decouverte from public.plans where slug = 'decouverte' limit 1;

  -- Les abonnements actifs dont la période est finie -> expired + bascule Découverte
  with expired as (
    update public.subscriptions
      set status = 'expired', plan_id = coalesce(v_decouverte, plan_id), updated_at = now()
      where status = 'active' and current_period_end < now()
      returning tenant_id
  )
  select count(*) into v_count from expired;

  return v_count;
end$$;
revoke all on function public.expire_subscriptions() from public, anon;
grant execute on function public.expire_subscriptions() to authenticated;

select '0012 — paiement manuel + abonnement annuel + downgrade contrôlé' as resultat;
