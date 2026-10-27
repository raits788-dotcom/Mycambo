-- ============================================================================
-- CORRECTIF — Attribuer la formule "Association" (gratuite) aux associations
--             déjà importées (lot 1) qui n'ont pas de formule.
-- ============================================================================
-- Une association doit avoir la formule Association d'office (gratuite).
-- On renseigne plan_id sur le tenant ET la fiche, et on crée une souscription
-- active (la formule gratuite n'a pas besoin de paiement).
-- Idempotent : ne fait rien si la formule est déjà posée.
-- ============================================================================

do $$
declare
  v_plan uuid;
  v_version uuid;
  r record;
begin
  -- Formule Association + sa version courante
  select id into v_plan from public.plans where slug = 'association' limit 1;
  if v_plan is null then
    raise exception 'Formule association introuvable (exécutez d''abord 0006)';
  end if;
  select id into v_version from public.plan_versions
    where plan_id = v_plan and status = 'current' limit 1;

  -- Pour chaque association importée en gérance, sans formule
  for r in
    select t.id as tenant_id, b.id as business_id
    from public.tenants t
    join public.businesses b on b.tenant_id = t.id
    where t.managed_by_mycambo = true
      and b.category_id = (select id from public.categories where slug = 'association')
  loop
    -- Formule sur le tenant et la fiche
    update public.tenants set plan_id = v_plan where id = r.tenant_id and plan_id is distinct from v_plan;
    update public.businesses set plan_id = v_plan where id = r.business_id and plan_id is distinct from v_plan;

    -- Souscription active (gratuite, 1 an) si pas déjà une
    if not exists (select 1 from public.subscriptions where business_id = r.business_id) then
      insert into public.subscriptions
        (tenant_id, business_id, plan_id, plan_version_id, status, current_period_start, current_period_end)
      values
        (r.tenant_id, r.business_id, v_plan, v_version, 'active', now(), now() + interval '1 year');
    end if;
  end loop;
end$$;

select '✅ Formule Association attribuée aux associations importées' as resultat,
       (select count(*) from public.tenants t
        join public.plans p on p.id = t.plan_id
        where p.slug = 'association' and t.managed_by_mycambo = true) as associations_avec_formule;
