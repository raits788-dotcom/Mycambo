-- ============================================================================
-- 0029 — Éditer la version COURANTE d'une formule (bouton "Modifier")
-- ----------------------------------------------------------------------------
-- Complète 0015 (qui ne proposait que "nouvelle version"). Ici on corrige la
-- version courante en place, avec option de propager aux abonnements qui la
-- partagent déjà. Les permissions sont désormais transmises explicitement
-- (calculées par la modale à partir du catalogue d'options).
-- Réservé au superadmin. Idempotent.
-- ============================================================================

create or replace function public.update_current_plan_version(
  p_plan_id       uuid,
  p_price_monthly numeric,
  p_price_yearly  numeric,
  p_max_businesses int,
  p_permissions   jsonb,
  p_features      jsonb,
  p_apply_existing boolean default false
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if not public.is_superadmin() then
    return jsonb_build_object('ok', false, 'error', 'Non autorisé');
  end if;

  -- Version courante de la formule
  select id into v_id from public.plan_versions
    where plan_id = p_plan_id and status = 'current' limit 1;

  if v_id is null then
    return jsonb_build_object('ok', false, 'error', 'Aucune version courante');
  end if;

  -- Mise à jour en place de la version courante
  update public.plan_versions set
    price_monthly  = p_price_monthly,
    price_yearly   = p_price_yearly,
    max_businesses = coalesce(p_max_businesses, max_businesses),
    permissions    = p_permissions,
    features       = p_features
  where id = v_id;

  -- Refléter sur la ligne `plans` (affichage public + lecture permissions)
  update public.plans set
    price_monthly  = p_price_monthly,
    price_yearly   = p_price_yearly,
    max_businesses = coalesce(p_max_businesses, max_businesses),
    permissions    = p_permissions,
    features       = p_features
  where id = p_plan_id;

  -- Option : rattacher les abonnements actifs du plan à cette version
  -- (ils liront alors les nouvelles permissions). Sans cela, seuls les
  -- abonnements déjà sur cette version profitent de la correction.
  if p_apply_existing then
    update public.subscriptions
      set plan_version_id = v_id
      where plan_id = p_plan_id and status in ('active','expiring');
  end if;

  return jsonb_build_object('ok', true, 'version_id', v_id);
end$$;

revoke all on function public.update_current_plan_version(uuid, numeric, numeric, int, jsonb, jsonb, boolean) from public, anon;
grant execute on function public.update_current_plan_version(uuid, numeric, numeric, int, jsonb, jsonb, boolean) to authenticated;

select '0029 — édition en place de la version courante (Modifier)' as resultat;
