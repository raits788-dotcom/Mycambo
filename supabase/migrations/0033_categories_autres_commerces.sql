-- ============================================================================
-- 0033 — Regroupement « Autres commerces » (catégorie parente + enfants)
-- ----------------------------------------------------------------------------
-- Crée un parent « Autres commerces » et y rattache des sous-catégories via
-- categories.parent_id. Réutilise les slugs existants (activite, shopping,
-- transport) pour NE PAS perdre les établissements déjà rangés dedans.
-- Les catégories de 1er niveau de la barre (Hôtels, Restaurants, Associations)
-- restent parent_id = NULL. Tout reste pilotable depuis la console superadmin.
-- Idempotent : rejouable sans effet de bord.
-- ============================================================================

-- 1. Catégorie parente « Autres commerces » (apparaît dans la barre)
insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
values ('Autres commerces', 'autres-commerces', '🏬', 'bg-ic-violet', 5, true, null)
on conflict (slug) do update
  set name = excluded.name,
      icon = coalesce(public.categories.icon, excluded.icon),
      is_active = true,
      parent_id = null;

-- Récupère l'id du parent pour les enfants
do $$
declare
  v_parent uuid;
begin
  select id into v_parent from public.categories where slug = 'autres-commerces';

  -- 2. Enfants — on upsert chaque sous-catégorie et on force parent_id = parent.
  --    Les slugs existants (activite, shopping, transport) sont simplement
  --    rattachés (leurs établissements suivent automatiquement).

  -- Chaque enfant : on rattache au parent ET on normalise nom/icône/position
  -- pour une sous-barre cohérente. Les slugs existants conservent leurs
  -- établissements (le filtrage se fait par category_id).

  -- Cafés & Salons de thé (nouveau)
  insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
  values ('Cafés & Salons de thé', 'cafe', '☕', 'bg-ic-orange', 1, true, v_parent)
  on conflict (slug) do update
    set parent_id = v_parent, is_active = true,
        name = excluded.name, icon = excluded.icon, position = excluded.position;

  -- Boutiques & Shopping (reprend 'shopping')
  insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
  values ('Boutiques & Shopping', 'shopping', '🛍️', 'bg-ic-bleu', 2, true, v_parent)
  on conflict (slug) do update
    set parent_id = v_parent, is_active = true,
        name = excluded.name, icon = excluded.icon, position = excluded.position;

  -- Activités & Loisirs (reprend 'activite')
  insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
  values ('Activités & Loisirs', 'activite', '🎟️', 'bg-ic-vert', 3, true, v_parent)
  on conflict (slug) do update
    set parent_id = v_parent, is_active = true,
        name = excluded.name, icon = excluded.icon, position = excluded.position;

  -- Spas & Bien-être (nouveau)
  insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
  values ('Spas & Bien-être', 'spa', '💆', 'bg-ic-rose', 4, true, v_parent)
  on conflict (slug) do update
    set parent_id = v_parent, is_active = true,
        name = excluded.name, icon = excluded.icon, position = excluded.position;

  -- Immobilier (nouveau)
  insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
  values ('Immobilier', 'immobilier', '🏠', 'bg-ic-or', 5, true, v_parent)
  on conflict (slug) do update
    set parent_id = v_parent, is_active = true,
        name = excluded.name, icon = excluded.icon, position = excluded.position;

  -- Transport & Location (reprend 'transport' : tuk-tuk, taxi, location véhicule)
  insert into public.categories (name, slug, icon, color, position, is_active, parent_id)
  values ('Transport & Location', 'transport', '🛺', 'bg-ic-cyan', 6, true, v_parent)
  on conflict (slug) do update
    set parent_id = v_parent, is_active = true,
        name = excluded.name, icon = excluded.icon, position = excluded.position;
end$$;

-- 3. Vérification : le parent et ses enfants
select c.slug, c.name, c.position,
       case when c.parent_id is null then '— (racine)' else p.slug end as parent
from public.categories c
left join public.categories p on p.id = c.parent_id
where c.slug = 'autres-commerces' or c.parent_id = (select id from public.categories where slug = 'autres-commerces')
order by c.parent_id nulls first, c.position;

select '0033 — Autres commerces (parent + enfants)' as resultat;
