-- ============================================================================
-- 0034 — Sous-catégories pour Hôtels, Restaurants, Associations
-- ----------------------------------------------------------------------------
-- Étend le pattern « sous-barre » (déjà en place pour Autres commerces) aux
-- trois rubriques principales. Chaque sous-catégorie est un enfant (parent_id)
-- de la catégorie racine correspondante.
--
-- Les établissements existants restent rattachés à la racine (ils apparaissent
-- dans « Tous ») tant qu'ils ne sont pas reclassés dans une sous-catégorie
-- depuis la console. Aucune donnée perdue.
-- Idempotent : rejouable sans effet de bord.
-- ============================================================================

do $$
declare
  v_hotel uuid;
  v_resto uuid;
  v_asso  uuid;
begin
  select id into v_hotel from public.categories where slug = 'hotel';
  select id into v_resto from public.categories where slug = 'restaurant';
  select id into v_asso  from public.categories where slug = 'association';

  -- ========================================================================
  -- HÔTELS — par type d'hébergement
  -- ========================================================================
  if v_hotel is not null then
    insert into public.categories (name, slug, icon, color, position, is_active, parent_id) values
      ('Hôtels',            'hotel-standard',  '🏨', 'bg-ic-bleu',   1, true, v_hotel),
      ('Resorts',           'hotel-resort',    '🏖️', 'bg-ic-orange', 2, true, v_hotel),
      ('Guesthouses',       'hotel-guesthouse','🏡', 'bg-ic-vert',   3, true, v_hotel),
      ('Boutique-hôtels',   'hotel-boutique',  '🛏️', 'bg-ic-violet', 4, true, v_hotel),
      ('Hostels',           'hotel-hostel',    '🎒', 'bg-ic-or',     5, true, v_hotel),
      ('Appart-hôtels',     'hotel-appart',    '🏢', 'bg-ic-rose',   6, true, v_hotel)
    on conflict (slug) do update
      set parent_id = v_hotel, is_active = true,
          name = excluded.name, icon = excluded.icon, position = excluded.position;
  end if;

  -- ========================================================================
  -- RESTAURANTS — par type de cuisine
  -- ========================================================================
  if v_resto is not null then
    insert into public.categories (name, slug, icon, color, position, is_active, parent_id) values
      ('Cuisine khmère',    'resto-khmer',    '🇰🇭', 'bg-ic-rose',   1, true, v_resto),
      ('Asiatique',         'resto-asie',     '🌏', 'bg-ic-orange', 2, true, v_resto),
      ('Occidentale',       'resto-ouest',    '🍷', 'bg-ic-bleu',   3, true, v_resto),
      ('Végétarien & Vegan','resto-veggie',   '🥗', 'bg-ic-vert',   4, true, v_resto),
      ('Fruits de mer',     'resto-mer',      '🦀', 'bg-ic-cyan',   5, true, v_resto),
      ('Bars & Cafés-resto','resto-bar',      '🍹', 'bg-ic-or',     6, true, v_resto),
      ('Street food',       'resto-street',   '🏍️', 'bg-ic-violet', 7, true, v_resto)
    on conflict (slug) do update
      set parent_id = v_resto, is_active = true,
          name = excluded.name, icon = excluded.icon, position = excluded.position;
  end if;

  -- ========================================================================
  -- ASSOCIATIONS — par domaine d'action
  -- ========================================================================
  if v_asso is not null then
    insert into public.categories (name, slug, icon, color, position, is_active, parent_id) values
      ('Enfance & Éducation', 'asso-enfance', '👶', 'bg-ic-rose',   1, true, v_asso),
      ('Environnement',       'asso-enviro',  '🌱', 'bg-ic-vert',   2, true, v_asso),
      ('Santé & Social',      'asso-sante',   '⚕️', 'bg-ic-bleu',   3, true, v_asso),
      ('Culture & Patrimoine','asso-culture', '🎨', 'bg-ic-or',     4, true, v_asso),
      ('Animaux',             'asso-animaux', '🐘', 'bg-ic-orange', 5, true, v_asso),
      ('Handicap',            'asso-handicap','♿', 'bg-ic-violet', 6, true, v_asso)
    on conflict (slug) do update
      set parent_id = v_asso, is_active = true,
          name = excluded.name, icon = excluded.icon, position = excluded.position;
  end if;
end$$;

-- Vérification : les 3 rubriques et leurs enfants
select p.slug as rubrique, c.slug as sous_categorie, c.name, c.position
from public.categories c
join public.categories p on p.id = c.parent_id
where p.slug in ('hotel', 'restaurant', 'association')
order by p.slug, c.position;

select '0034 — sous-catégories Hôtels / Restaurants / Associations' as resultat;
