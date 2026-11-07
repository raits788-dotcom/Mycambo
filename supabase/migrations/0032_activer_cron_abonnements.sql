-- ============================================================================
-- 0032 — ACTIVER le cron quotidien des abonnements (une fois pg_cron activé)
-- ----------------------------------------------------------------------------
-- La migration 0014 avait préparé process_subscriptions_daily() mais le bloc
-- cron.schedule a été ignoré faute d'extension pg_cron activée à ce moment-là.
--
-- À LANCER UNIQUEMENT APRÈS avoir activé pg_cron :
--   Dashboard Supabase → Database → Extensions → rechercher "pg_cron" → Enable
--
-- Ce script :
--   - vérifie que pg_cron est présent (sinon il s'arrête proprement, sans erreur) ;
--   - (ré)installe le job quotidien à 03:00 UTC, sans doublon ;
--   - ajoute aussi l'envoi quotidien des emails de relance, qui respecte de
--     lui-même le flag renewal_emails_enabled (donc inactif tant que le flag
--     vaut 'false' — rien ne part sans que tu l'actives).
-- Idempotent : relançable sans risque.
-- ============================================================================

do $$
declare
  v_fn_url text;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron non activé — rien planifié. Active l''extension puis relance ce script.';
    return;
  end if;

  -- 1. Traitement quotidien (expiration + relances in-app). Idempotent.
  perform cron.unschedule('mycambo-abonnements-daily')
    where exists (select 1 from cron.job where jobname = 'mycambo-abonnements-daily');
  perform cron.schedule(
    'mycambo-abonnements-daily',
    '0 3 * * *',
    $cron$ select public.process_subscriptions_daily(); $cron$
  );
  raise notice 'Job "mycambo-abonnements-daily" planifié à 03:00 UTC.';

  -- 2. (Optionnel) Emails de relance quotidiens via l'Edge Function.
  --    Ne part QUE si renewal_emails_enabled = 'true' (contrôlé dans l'Edge
  --    Function elle-même, mode 'auto'). Nécessite l'extension pg_net.
  if exists (select 1 from pg_extension where extname = 'pg_net') then
    v_fn_url := current_setting('app.settings.supabase_url', true);
    -- NB : l'URL de l'Edge Function et la clé service_role sont à renseigner
    -- côté Dashboard (Vault / variables). Laissé en commentaire volontairement :
    -- décommente et renseigne SUPABASE_URL + SERVICE_ROLE_KEY quand tu actives
    -- réellement les emails automatiques.
    --
    -- perform cron.unschedule('mycambo-relances-emails')
    --   where exists (select 1 from cron.job where jobname = 'mycambo-relances-emails');
    -- perform cron.schedule(
    --   'mycambo-relances-emails',
    --   '30 3 * * *',
    --   $cron$
    --     select net.http_post(
    --       url := '<SUPABASE_URL>/functions/v1/send-renewal-reminders',
    --       headers := jsonb_build_object(
    --         'Content-Type','application/json',
    --         'Authorization','Bearer <SERVICE_ROLE_KEY>'),
    --       body := jsonb_build_object('mode','auto')
    --     );
    --   $cron$
    -- );
    raise notice 'pg_net présent : cron emails disponible (bloc à décommenter quand tu actives les relances auto).';
  else
    raise notice 'pg_net absent : les emails de relance restent manuels (bouton console). OK.';
  end if;
end$$;

-- Vérification : liste les jobs cron myCAMBO planifiés.
select jobname, schedule, active
from cron.job
where jobname like 'mycambo-%'
order by jobname;
