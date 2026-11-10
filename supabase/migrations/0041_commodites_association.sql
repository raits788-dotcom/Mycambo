-- ============================================================================
-- 0041 — Commodités association = clés FONCTIONNELLES (pas de doublon)
-- ----------------------------------------------------------------------------
-- Pour les associations, certaines "commodités" pilotent de vraies
-- fonctionnalités de la fiche (pas un simple affichage) :
--   services.donations === true  -> bouton "Faire un don"
--   services.volunteers === true -> bouton "Bénévolat"
--   services.projects === true   -> onglet "Nos projets"
--
-- En 0038 on avait seedé pour association des clés d'affichage (benevolat, dons)
-- qui FONT DOUBLON avec ces interrupteurs. On corrige : l'éditeur de services
-- doit proposer les clés fonctionnelles, pour que cocher la case active
-- réellement le bouton/onglet correspondant.
--
-- Les données existantes (volunteers/donations/projects dans businesses.services)
-- NE SONT PAS touchées : elles pilotent déjà les fonctionnalités.
-- ============================================================================

-- Retire les clés d'affichage en doublon pour association.
delete from public.category_amenities
where category_slug = 'association' and amenity_key in ('benevolat', 'dons');

-- Pose les bonnes clés fonctionnelles (+ visites/partenariats conservés).
insert into public.category_amenities (category_slug, amenity_key, label, icon_key, position) values
  ('association', 'donations',    'Dons',         'heart',     1),
  ('association', 'volunteers',   'Bénévolat',    'users',     2),
  ('association', 'projects',     'Projets',      'compass',   3),
  ('association', 'visites',      'Visites',      'compass',   4),
  ('association', 'partenariats', 'Partenariats', 'handshake', 5)
on conflict (category_slug, amenity_key) do update set
  label = excluded.label, icon_key = excluded.icon_key, position = excluded.position, is_active = true;

-- Au cas où des fiches auraient reçu benevolat/dons via la migration 0040
-- (libellés wizard "Bénévolat"/"Dons") : on les ramène vers les clés
-- fonctionnelles, sinon le bouton ne s'activerait pas.
update public.businesses
set services = (services - 'benevolat') || jsonb_build_object('volunteers', true)
where services ? 'benevolat' and (services ->> 'benevolat') = 'true';

update public.businesses
set services = (services - 'dons') || jsonb_build_object('donations', true)
where services ? 'dons' and (services ->> 'dons') = 'true';

-- Retire les éventuels benevolat/dons restants (valeur false) pour ne pas
-- laisser de clés d'affichage orphelines.
update public.businesses set services = services - 'benevolat' where services ? 'benevolat';
update public.businesses set services = services - 'dons'      where services ? 'dons';

select category_slug, amenity_key, label
from public.category_amenities where category_slug = 'association' order by position;
