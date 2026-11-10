-- ============================================================================
-- 0040 — Réconciliation des clés de services (businesses.services)
-- ----------------------------------------------------------------------------
-- Après l'unification des commodités (0038), les fiches créées AVANT stockent
-- d'anciennes clés dans businesses.services (jsonb { "<clé>": true }) :
--   - clés "fonctionnelles" (0007)      : menu, reservations, shipping, rooms…
--   - libellés du wizard (texte brut)   : "Wi-Fi", "Climatisation", "Livraison"…
-- Le nouvel éditeur ne connaît que les nouvelles clés (wifi, clim, livraison…)
-- → les cases apparaissent décochées alors que le public affiche encore les
-- anciennes. On convertit ici les anciennes clés vers les nouvelles.
--
-- 1) On ajoute d'abord Menu + Réservation aux commodités restaurant (demandé),
--    pour que ces fonctionnalités restent affichables comme commodités.
-- 2) On remappe businesses.services clé par clé.
-- ============================================================================

-- ── 1) Compléments de commodités ────────────────────────────────────────────
-- 'resa' (Réservation) existe déjà pour restaurant en 0038 : on ajoute 'menu'.
insert into public.category_amenities (category_slug, amenity_key, label, icon_key, position) values
  ('restaurant', 'menu', 'Menu', 'utensils', 0)
on conflict (category_slug, amenity_key) do update set
  label = excluded.label, icon_key = excluded.icon_key, is_active = true;

-- ── 2) Remappage des clés dans businesses.services ──────────────────────────
-- Fonction utilitaire : renomme une clé jsonb (ancienne -> nouvelle) si présente
-- et à true, sans écraser une nouvelle clé déjà à true.
create or replace function public._remap_service_key(
  svc jsonb, old_key text, new_key text
) returns jsonb language plpgsql as $$
begin
  if svc is null then return svc; end if;
  if (svc ? old_key) then
    if (svc ->> old_key) = 'true' then
      svc := svc || jsonb_build_object(new_key, true);
    end if;
    svc := svc - old_key;
  end if;
  return svc;
end;
$$;

-- Boucle sur une table de correspondance (ancienne, nouvelle) via VALUES.
do $$
declare
  r record;
begin
  for r in
    select * from (values
      -- fonctionnelles (0007)
      ('shipping','livraison'),
      ('reservations','resa'),
      ('rooms','resa'),          -- "chambres" → pas d'équivalent commodité → résa
      ('offers','resa'),
      ('tours','resa'),
      ('products','emporter'),
      -- libellés wizard (texte brut) → clés courtes
      ('Wi-Fi','wifi'),
      ('Parking','parking'),
      ('Piscine','piscine'),
      ('Climatisation','clim'),
      ('Petit-déjeuner','petit_dej'),
      ('Restaurant','resto'),
      ('Navette','navette'),
      ('Accès PMR','pmr'),
      ('Terrasse','terrasse'),
      ('Réservation','resa'),
      ('Végétarien','veggie'),
      ('Livraison','livraison'),
      ('À emporter','emporter'),
      ('Bénévolat','benevolat'),
      ('Dons','dons'),
      ('Visites','visites'),
      ('Partenariats','partenariats')
    ) as t(old_key, new_key)
  loop
    update public.businesses
    set services = public._remap_service_key(services, r.old_key, r.new_key)
    where services ? r.old_key;
  end loop;
end $$;

drop function if exists public._remap_service_key(jsonb, text, text);

-- Contrôle : clés encore présentes dans businesses.services
select key, count(*) as nb
from public.businesses b, jsonb_object_keys(coalesce(b.services,'{}'::jsonb)) as key
group by key order by nb desc;
