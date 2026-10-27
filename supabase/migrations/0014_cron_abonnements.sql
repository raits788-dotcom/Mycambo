-- ============================================================================
-- 0014 — AUTOMATISATION DES ABONNEMENTS (expiration + relances)
-- ============================================================================
-- Fonction quotidienne :
--  - marque "expiring" les abonnements qui arrivent à échéance (relance)
--  - crée une notification de relance au tenant
--  - expire ceux qui sont échus -> retombe en Découverte
-- Planifiée via pg_cron (disponible sur Supabase). Si pg_cron n'est pas
-- activé, la fonction reste appelable manuellement ou via une tâche externe.
-- ============================================================================

-- Fenêtre de relance (jours avant échéance) — réglable
create or replace function public.process_subscriptions_daily()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_expiring int := 0;
  v_expired int := 0;
begin
  -- 1. Relance : abonnements actifs à moins de 30 jours de l'échéance
  with soon as (
    update public.subscriptions s
      set status = 'expiring', updated_at = now()
      where s.status = 'active'
        and s.current_period_end between now() and now() + interval '30 days'
      returning s.tenant_id, s.current_period_end
  )
  select count(*) into v_expiring from soon;

  -- Notification de relance (une par tenant concerné, sans doublon du jour)
  insert into public.notifications (tenant_id, scope, title, body)
  select s.tenant_id, 'tenant',
         'Votre abonnement arrive à échéance',
         'Pensez à renouveler votre abonnement avant le '
           || to_char(s.current_period_end, 'DD/MM/YYYY')
           || ' pour garder votre établissement en ligne.'
  from public.subscriptions s
  where s.status = 'expiring'
    and s.current_period_end between now() and now() + interval '30 days'
    and not exists (
      select 1 from public.notifications n
      where n.tenant_id = s.tenant_id
        and n.title = 'Votre abonnement arrive à échéance'
        and n.created_at > now() - interval '7 days'
    );

  -- 2. Expiration : échus -> retombe en Découverte (fonction dédiée)
  select public.expire_subscriptions() into v_expired;

  return jsonb_build_object('expiring', v_expiring, 'expired', v_expired);
end$$;
revoke all on function public.process_subscriptions_daily() from public, anon;
grant execute on function public.process_subscriptions_daily() to authenticated;

-- Planification quotidienne via pg_cron (à 03:00). Ignorée si pg_cron absent.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'mycambo-abonnements-daily',
      '0 3 * * *',
      $cron$ select public.process_subscriptions_daily(); $cron$
    );
  end if;
exception when others then
  -- pg_cron non disponible : la fonction reste appelable manuellement.
  null;
end$$;

select '0014 — automatisation abonnements (expiration + relances)' as resultat;
