-- ============================================================================
-- 0031 — Flag d'activation des emails de relance (désactivé par défaut)
-- ----------------------------------------------------------------------------
-- Les emails de relance de renouvellement sont PRÉPARÉS mais NON ENVOYÉS tant
-- que ce réglage vaut 'false'. L'envoi (bouton admin / cron) vérifie ce flag.
-- Idempotent.
-- ============================================================================

insert into public.platform_settings (key, value, label)
values ('renewal_emails_enabled', 'false',
        'Emails de relance de renouvellement (annuel) — activer pour envoyer')
on conflict (key) do nothing;

-- Vue des abonnements à relancer (expirant sous 30 jours, non expirés).
-- Sert au bouton d'envoi et au cron. Lecture seule.
create or replace view public.subscriptions_to_remind as
select s.id as subscription_id,
       s.tenant_id,
       t.name as tenant_name,
       t.email as tenant_email,
       s.current_period_end,
       (s.current_period_end::date - now()::date) as days_left
from public.subscriptions s
join public.tenants t on t.id = s.tenant_id
where s.status in ('active', 'expiring')
  and s.current_period_end between now() and now() + interval '30 days'
  and t.email is not null;

select '0031 — flag emails de relance + vue subscriptions_to_remind' as resultat;
