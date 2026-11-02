-- ============================================================================
-- Suppression définitive de catégories du menu (Shopping, Spa & Bien-être,
-- Cafés, etc.) — à adapter selon le résultat du SELECT de contrôle.
-- ----------------------------------------------------------------------------
-- Les établissements éventuellement rattachés passent category_id = NULL
-- (contrainte on delete set null) : aucune suppression en cascade.
-- ============================================================================

-- 1) CONTRÔLE : liste les catégories et combien d'établissements y sont liés.
select c.id, c.slug, c.name, c.is_active, c.position,
       (select count(*) from public.businesses b where b.category_id = c.id) as nb_etablissements
from public.categories c
order by c.position;

-- 2) SUPPRESSION par NOM (robuste quel que soit le slug).
--    ⚠️ Vérifie la liste ci-dessus AVANT. Décommente/ajuste les noms voulus.
-- delete from public.categories
-- where name in ('Shopping', 'Spa & Bien-être', 'Cafés', 'Cafés ')  -- gère un espace final éventuel
-- ;

-- Variante par slug (si tu préfères, après avoir vu les slugs réels) :
-- delete from public.categories
-- where slug in ('shopping', 'spa-bien-etre', 'cafes');

-- 3) CONTRÔLE APRÈS : ce qui reste.
-- select slug, name, is_active, position from public.categories order by position;
