-- ============================================================================
-- 0030 — Synchroniser tenants.plan_id à la validation du paiement
-- ----------------------------------------------------------------------------
-- Bug corrigé : la fiche publique et l'espace partenaire lisent le plan via
-- tenants.plan_id, mais la validation d'un paiement (changement de formule)
-- ne mettait à jour que la souscription — pas tenants.plan_id. Un commerce
-- passant en Pro gardait donc les permissions de Découverte sur sa fiche.
--
-- On aligne tenants.plan_id sur le plan de la souscription validée.
-- Idempotent.
-- ============================================================================

create or replace function public.validate_manual_payment(p_payment uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sub uuid;
  v_tenant uuid;
  v_plan uuid;
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
    where id = v_sub
    returning plan_id into v_plan;

  -- Le tenant devient actif ET prend le plan de la souscription validée
  -- (c'est ce que lit la fiche publique / les permissions).
  update public.tenants
    set status = 'active',
        plan_id = coalesce(v_plan, plan_id)
    where id = v_tenant;

  return jsonb_build_object(
    'ok', true, 'subscription', v_sub,
    'plan', v_plan,
    'valid_until', (now() + interval '1 year')
  );
end$$;

revoke all on function public.validate_manual_payment(uuid) from public, anon;
grant execute on function public.validate_manual_payment(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Expiration : aligner aussi tenants.plan_id sur Découverte quand un
-- abonnement PAYANT expire. Les associations (plan gratuit) et les tenants
-- déjà en Découverte ne sont pas concernés.
-- ----------------------------------------------------------------------------
create or replace function public.expire_subscriptions()
returns int language plpgsql security definer set search_path = public as $$
declare
  v_decouverte uuid;
  v_count int := 0;
begin
  select id into v_decouverte from public.plans where slug = 'decouverte' limit 1;

  with expired as (
    update public.subscriptions s
      set status = 'expired',
          plan_id = coalesce(v_decouverte, s.plan_id),
          updated_at = now()
      where s.status = 'active' and s.current_period_end < now()
      returning s.tenant_id, s.plan_id as old_plan
  )
  select count(*) into v_count from expired;

  -- Fait retomber le tenant en Découverte, SAUF s'il est sur un plan gratuit
  -- dédié (association) — on ne downgrade que les commerces payants expirés.
  update public.tenants t
    set plan_id = coalesce(v_decouverte, t.plan_id)
  from public.subscriptions s
  where s.tenant_id = t.id
    and s.status = 'expired'
    and s.updated_at > now() - interval '1 minute'
    and t.plan_id is distinct from v_decouverte
    and not exists (
      select 1 from public.plans p
      where p.id = t.plan_id and p.slug = 'association'
    );

  return v_count;
end$$;
revoke all on function public.expire_subscriptions() from public, anon;
grant execute on function public.expire_subscriptions() to authenticated;

select '0030 — tenants.plan_id synchronisé (paiement validé + expiration)' as resultat;
