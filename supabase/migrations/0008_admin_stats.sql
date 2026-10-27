-- ============================================================================
-- 0008 — STATISTIQUES ADMIN RÉELLES (remplacent les KPIS mockés)
-- ============================================================================
-- Fonction d'agrégation qui calcule les vraies stats plateforme depuis la base :
-- événements (business_events), demandes partenaires, top catégories et villes.
-- Réservée au staff.
-- ============================================================================

create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_views int;
  v_clicks int;
  v_requests int;
  v_establishments int;
  v_top_categories jsonb;
  v_top_cities jsonb;
  v_monthly jsonb;
begin
  if not public.is_superadmin() then
    return jsonb_build_object('error', 'Non autorisé');
  end if;

  -- Pages vues (30 derniers jours)
  select count(*) into v_views from public.business_events
    where event_type = 'view' and created_at > now() - interval '30 days';

  -- Clics sur fiches (téléphone + site + itinéraire, 30j)
  select count(*) into v_clicks from public.business_events
    where event_type in ('click_phone','click_website','click_directions')
      and created_at > now() - interval '30 days';

  -- Demandes partenaires (30j)
  select count(*) into v_requests from public.partner_requests
    where created_at > now() - interval '30 days';

  -- Établissements publiés
  select count(*) into v_establishments from public.businesses
    where status in ('approved','published','active');

  -- Top catégories par nombre d'établissements
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_top_categories from (
    select c.name, count(b.id) as count
    from public.categories c
    left join public.businesses b on b.category_id = c.id
    where c.is_active = true
    group by c.name
    order by count desc
    limit 6
  ) t;

  -- Top villes par nombre d'établissements
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_top_cities from (
    select coalesce(city, 'Non renseignée') as name, count(*) as count
    from public.businesses
    where city is not null and city <> ''
    group by city
    order by count desc
    limit 6
  ) t;

  -- Vues par mois sur les 12 derniers mois
  select coalesce(jsonb_agg(row_to_json(t) order by t.mois), '[]'::jsonb) into v_monthly from (
    select to_char(date_trunc('month', created_at), 'YYYY-MM') as mois,
           count(*) as views
    from public.business_events
    where event_type = 'view' and created_at > now() - interval '12 months'
    group by 1
  ) t;

  return jsonb_build_object(
    'views_30d', v_views,
    'clicks_30d', v_clicks,
    'requests_30d', v_requests,
    'establishments', v_establishments,
    'top_categories', v_top_categories,
    'top_cities', v_top_cities,
    'monthly', v_monthly
  );
end$$;

revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

select '0008 — fonction admin_stats créée' as resultat;
