-- ============================================================================
-- 0016 — STATISTIQUES ROI PARTENAIRE
-- ============================================================================
-- Agrège les vraies données d'un tenant (tous ses établissements) pour lui
-- prouver son retour : vues, clics, réservations, candidatures, note moyenne,
-- évolution mensuelle, et comparaison au mois précédent.
-- ============================================================================

create or replace function public.tenant_roi_stats(p_tenant uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_biz uuid[];
  v_views_30 int;
  v_views_prev int;
  v_clicks_30 int;
  v_supports_30 int;
  v_reservations int;
  v_applications int;
  v_avg_rating numeric;
  v_reviews_count int;
  v_monthly jsonb;
begin
  -- Établissements du tenant
  select array_agg(id) into v_biz from public.businesses where tenant_id = p_tenant;
  if v_biz is null then
    return jsonb_build_object('empty', true);
  end if;

  -- Vues 30 derniers jours + 30 jours précédents (pour l'évolution)
  select count(*) into v_views_30 from public.business_events
    where business_id = any(v_biz) and event_type = 'view'
      and created_at > now() - interval '30 days';
  select count(*) into v_views_prev from public.business_events
    where business_id = any(v_biz) and event_type = 'view'
      and created_at between now() - interval '60 days' and now() - interval '30 days';

  -- Clics (téléphone/site/itinéraire) 30j
  select count(*) into v_clicks_30 from public.business_events
    where business_id = any(v_biz)
      and event_type in ('click_phone','click_website','click_directions')
      and created_at > now() - interval '30 days';

  -- Soutiens 30j
  select count(*) into v_supports_30 from public.business_events
    where business_id = any(v_biz) and event_type = 'support'
      and created_at > now() - interval '30 days';

  -- Réservations et candidatures reçues (total)
  select count(*) into v_reservations from public.reservations where business_id = any(v_biz);
  select count(*) into v_applications from public.job_applications where business_id = any(v_biz);

  -- Note moyenne + nombre d'avis approuvés
  select coalesce(round(avg(rating), 1), 0), count(*)
    into v_avg_rating, v_reviews_count
  from public.reviews
  where business_id = any(v_biz) and status = 'approved';

  -- Vues par mois sur 6 mois (pour le graphique d'évolution)
  select coalesce(jsonb_agg(row_to_json(t) order by (t->>'mois')), '[]'::jsonb) into v_monthly
  from (
    select to_char(date_trunc('month', created_at), 'YYYY-MM') as mois,
           count(*) as views
    from public.business_events
    where business_id = any(v_biz) and event_type = 'view'
      and created_at > now() - interval '6 months'
    group by 1
  ) t;

  return jsonb_build_object(
    'views_30d', v_views_30,
    'views_prev_30d', v_views_prev,
    'views_delta_pct', case when v_views_prev > 0
        then round(((v_views_30 - v_views_prev)::numeric / v_views_prev) * 100)
        else null end,
    'clicks_30d', v_clicks_30,
    'supports_30d', v_supports_30,
    'reservations_total', v_reservations,
    'applications_total', v_applications,
    'avg_rating', v_avg_rating,
    'reviews_count', v_reviews_count,
    'monthly', v_monthly
  );
end$$;
grant execute on function public.tenant_roi_stats(uuid) to authenticated;

select '0016 — statistiques ROI partenaire' as resultat;
