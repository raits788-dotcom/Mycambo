-- ============================================================================
-- 0041 — Réconciliation des clés de services des ASSOCIATIONS (oubli de 0040)
-- ----------------------------------------------------------------------------
-- 0040 a converti les libellés ("Bénévolat", "Dons") mais pas les clés
-- FONCTIONNELLES de 0007 (volunteers, donations, projects) encore présentes
-- dans businesses.services de 3 associations.
--
-- Décision :
--   volunteers → benevolat   (commodité association existante, 0038)
--   donations  → dons         (commodité association existante, 0038)
--   projects   → RETIRÉE      (les projets sont gérés par l'onglet dédié des
--                              associations, pas par les commodités)
-- ============================================================================

create or replace function public._remap_service_key(
  svc jsonb, old_key text, new_key text
) returns jsonb language plpgsql as $$
begin
  if svc is null then return svc; end if;
  if (svc ? old_key) then
    if new_key is not null and (svc ->> old_key) = 'true' then
      svc := svc || jsonb_build_object(new_key, true);
    end if;
    svc := svc - old_key;   -- retire toujours l'ancienne clé
  end if;
  return svc;
end;
$$;

-- volunteers → benevolat, donations → dons
update public.businesses
set services = public._remap_service_key(services, 'volunteers', 'benevolat')
where services ? 'volunteers';

update public.businesses
set services = public._remap_service_key(services, 'donations', 'dons')
where services ? 'donations';

-- projects → retirée (new_key NULL = suppression simple)
update public.businesses
set services = public._remap_service_key(services, 'projects', null)
where services ? 'projects';

drop function if exists public._remap_service_key(jsonb, text, text);

-- ── Nettoyage des clés orphelines (ex. taxi avec pmr/livraison) ─────────────
-- La conversion globale de 0040 a pu laisser sur un établissement des clés qui
-- n'appartiennent pas aux commodités de SA famille (un taxi n'a ni "Accès PMR"
-- ni "Livraison"). On ne garde, pour chaque établissement, que les clés
-- présentes dans category_amenities de sa famille.
-- La résolution de la famille suit la même logique que lib/amenities.ts.

-- 1) Reconstruit services en ne gardant que les clés valides (quand au moins
--    une clé valide existe).
update public.businesses b
set services = sub.kept
from (
  select b2.id,
         coalesce(jsonb_object_agg(kv.key, kv.value), '{}'::jsonb) as kept
  from public.businesses b2
  join public.categories c on c.id = b2.category_id
  join lateral jsonb_each(b2.services) as kv(key, value) on true
  join public.category_amenities ca
    on ca.amenity_key = kv.key and ca.is_active
   and ca.category_slug = case
        when c.slug like 'hotel%'                          then 'hotel'
        when c.slug like 'resto%' or c.slug = 'restaurant' then 'restaurant'
        when c.slug like 'asso%'  or c.slug = 'association' then 'association'
        else c.slug end
  where b2.services is not null and b2.services <> '{}'::jsonb
  group by b2.id
) sub
where b.id = sub.id
  and b.services <> sub.kept;

-- 2) Cas où TOUTES les clés étaient orphelines (la jointure ci-dessus ne renvoie
--    alors rien pour ce business) → on vide services.
update public.businesses b
set services = '{}'::jsonb
where b.services is not null and b.services <> '{}'::jsonb
  and not exists (
    select 1
    from public.categories c
    join lateral jsonb_each(b.services) kv(key, value) on true
    join public.category_amenities ca
      on ca.amenity_key = kv.key and ca.is_active
     and ca.category_slug = case
          when c.slug like 'hotel%'                          then 'hotel'
          when c.slug like 'resto%' or c.slug = 'restaurant' then 'restaurant'
          when c.slug like 'asso%'  or c.slug = 'association' then 'association'
          else c.slug end
    where c.id = b.category_id
  );

-- Contrôle : clés restantes
select key, count(*) as nb
from public.businesses b, jsonb_object_keys(coalesce(b.services,'{}'::jsonb)) as key
group by key order by nb desc;
