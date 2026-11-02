-- ============================================================================
-- Remplissage des fiches : Enfants d'Asie, KEPCHILDREN, Au-Delà Les Rizières
-- ----------------------------------------------------------------------------
-- Données issues des SITES OFFICIELS (accessibles), validées par l'admin.
-- Idempotent. À exécuter dans le SQL Editor Supabase (superadmin).
-- Formats jsonb : history {year,text} · public_team {name,role,photo_url} ·
--                 impact {value,label}.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENFANTS D'ASIE  (slug: enfants-dasie)
-- ---------------------------------------------------------------------------
update public.businesses
set
  description = 'Aide à l''enfance défavorisée en Asie du Sud-Est : scolarisation et insertion, de la base à l''emploi.',
  long_description =
    'Enfants d''Asie couvre les besoins de base des enfants, assure leur '
    'scolarisation et leur formation jusqu''à leur insertion professionnelle, '
    'dans quatre pays (Cambodge, Laos, Philippines, Vietnam). Reconnue '
    'd''utilité publique et labellisée IDEAS, l''association est née sous le '
    'nom « Aspeca » à Phnom Penh en 1991.',
  founded_year = 1991,
  history = '[
    {"year":"1991","text":"Création de l''Aspeca à Phnom Penh : aide à plus de 2 000 enfants, plus de 1 000 parrains."},
    {"year":"1992","text":"Reconstruction d''orphelinats, foyers et écoles au Cambodge (partenaires dont l''UNESCO)."},
    {"year":"1994","text":"Début des activités au Laos (parrainages à Vientiane)."},
    {"year":"1995","text":"Actions de santé au Cambodge ; début des programmes au Vietnam (Hô Chi Minh-Ville)."},
    {"year":"1999","text":"Création de l''École des Arts à Siem Reap (don de Luciano Pavarotti)."},
    {"year":"2003","text":"Formation professionnelle aux Philippines (informatique, couture)."},
    {"year":"2012","text":"Reconnaissance par le Département pour l''action sociale des Philippines ; ouverture d''un Training Center."},
    {"year":"2014","text":"Systèmes d''adduction d''eau à Oudomxay (Laos), avec Aquassistance."},
    {"year":"2021","text":"Aides d''urgence (financières, alimentaires, hygiène) pendant la crise sanitaire."}
  ]'::jsonb,
  public_team = '[
    {"name":"Laurent Thong Vanh","role":"Président","photo_url":null},
    {"name":"Michel Ziegler","role":"Vice-président","photo_url":null},
    {"name":"Ludovic Levasseur","role":"Directeur général","photo_url":null},
    {"name":"Charlotte de Turckheim","role":"Ambassadrice et marraine","photo_url":null},
    {"name":"Chansophea Ngin","role":"Directrice pays Cambodge","photo_url":null},
    {"name":"Vincent Prosper","role":"Directeur pays Laos","photo_url":null},
    {"name":"Mathilde Moulin","role":"Coordinatrice pays Vietnam","photo_url":null},
    {"name":"Barbie Guardiario","role":"Directrice pays Philippines","photo_url":null}
  ]'::jsonb,
  -- Impact : aucun chiffre global (site contradictoire) → onglet laissé vide.
  email = coalesce(nullif(email,''), 'contacts@enfantsdasie.com'),
  phone = coalesce(nullif(phone,''), '+33 1 47 00 19 00'),
  facebook = coalesce(nullif(facebook,''), 'https://www.facebook.com/enfants.dasie/'),
  instagram = coalesce(nullif(instagram,''), 'https://www.instagram.com/enfantsdasie/')
where slug = 'enfants-dasie';

insert into public.association_projects (business_id, tenant_id, title, description, status, position)
select b.id, b.tenant_id, v.title, v.description, 'active', v.position
from public.businesses b
cross join (values
  ('Scolarisation et formation', 'Accompagnement de la scolarisation jusqu''à l''insertion professionnelle.', 0),
  ('Parrainage individuel', 'Parrainer un enfant ou un étudiant.', 1),
  ('Parrainage collectif', 'Parrainer un groupe d''enfants.', 2)
) as v(title, description, position)
where b.slug = 'enfants-dasie'
  and not exists (select 1 from public.association_projects p where p.business_id = b.id and p.title = v.title);

-- ---------------------------------------------------------------------------
-- 2. KEPCHILDREN — Kep Children  (slug: kepchildren-kep)
-- ---------------------------------------------------------------------------
update public.businesses
set
  description = 'Association franco-cambodgienne (2012) qui aide les enfants pauvres de Kep à aller à l''école.',
  long_description =
    'Créée en 2012, KEPCHILDREN aide les enfants les plus pauvres de Kep à '
    'accéder à l''école : scolarité, santé, transport, alimentation, soutien '
    'social et activités culturelles. L''association travaille avec l''école '
    'publique de Kep et des partenaires locaux. Son accompagnement repose sur '
    'un « contrat moral » : la famille veille à ce que l''enfant aille à '
    'l''école chaque jour.',
  founded_year = 2012,
  history = '[
    {"year":"2012","text":"Création de l''association franco-cambodgienne."},
    {"year":"2019","text":"Décès de Khet, cofondateur, qui reste membre d''honneur."}
  ]'::jsonb,
  public_team = '[
    {"name":"Anne-Sophie","role":"Fondatrice","photo_url":null},
    {"name":"Sreynay","role":"Directrice (Cambodge)","photo_url":null},
    {"name":"Piseth","role":"Travailleur social et animateur","photo_url":null},
    {"name":"Sothéréra","role":"Animatrice des maternelles","photo_url":null},
    {"name":"Apolline","role":"Chargée de projet","photo_url":null},
    {"name":"Marthe","role":"Vice-présidente","photo_url":null},
    {"name":"Jennifer","role":"Trésorière","photo_url":null},
    {"name":"Valérie","role":"Secrétaire","photo_url":null}
  ]'::jsonb,
  impact = '[
    {"value":"~70","label":"enfants scolarisés chaque jour"},
    {"value":"10 kg","label":"de riz par mois et par enfant"}
  ]'::jsonb,
  facebook = coalesce(nullif(facebook,''), 'https://www.facebook.com/KepChildren'),
  instagram = coalesce(nullif(instagram,''), 'https://www.instagram.com/kepchildren_officiel')
where slug = 'kepchildren-kep';

insert into public.association_projects (business_id, tenant_id, title, description, status, position)
select b.id, b.tenant_id, v.title, v.description, 'active', v.position
from public.businesses b
cross join (values
  ('Prise en charge scolaire', 'Matériel, uniformes, chaussures, cours de soutien, cours d''anglais, jardin d''enfants.', 0),
  ('Prise en charge santé', 'Bilan dentaire annuel, remboursement de frais médicaux, accès à une douche.', 1),
  ('Prise en charge transport', 'Dons de vélos, ramassage en tuktuk, aide au financement d''une moto pour les étudiants.', 2),
  ('Prise en charge sociale', 'Soutien socio-éducatif, aide à l''accès aux soins et au logement.', 3),
  ('Prise en charge alimentaire', 'Distribution de riz et repas à la cantine.', 4),
  ('Prise en charge socio-culturelle', 'Sorties, boxe khmère, mini-camps, centre aéré.', 5)
) as v(title, description, position)
where b.slug = 'kepchildren-kep'
  and not exists (select 1 from public.association_projects p where p.business_id = b.id and p.title = v.title);

-- ---------------------------------------------------------------------------
-- 3. AU-DELÀ LES RIZIÈRES  (slug: audela-les-rizieres)
--    Mise à jour depuis le vrai site officiel (remplace l'équipe précédente).
-- ---------------------------------------------------------------------------
update public.businesses
set
  description = 'Centre socio-éducatif pour les enfants du village d''O''Krassar, province de Kep.',
  long_description =
    'Au-Delà Les Rizières porte un centre socio-éducatif offrant une '
    'alternative éducative aux enfants défavorisés du village d''O''Krassar, '
    'dans la province de Kep. Association française fondée par Aurélie Gayod ; '
    'chaque don est intégralement consacré au centre (déductible à 66 %). '
    'L''association propose aussi du bénévolat sur place et du mécénat de '
    'compétences.',
  founded_year = 2018,
  history = '[
    {"year":"2018","text":"Fondation du centre socio-éducatif et de l''association."}
  ]'::jsonb,
  public_team = '[
    {"name":"Aurélie Gayod","role":"Présidente et fondatrice","photo_url":null},
    {"name":"Sok Ngo Sisowath","role":"Membre d''honneur","photo_url":null},
    {"name":"Erwan Lanio","role":"Secrétaire général","photo_url":null},
    {"name":"Célia Desplanques","role":"Trésorière","photo_url":null},
    {"name":"Naomi Lim","role":"Chargée de communication","photo_url":null},
    {"name":"Corentin Bertrand","role":"Chef de projet","photo_url":null},
    {"name":"To Suon","role":"Professeur d''anglais et de khmer","photo_url":null}
  ]'::jsonb,
  -- Impact : chiffres du site = événements ponctuels → écartés.
  facebook = coalesce(nullif(facebook,''), 'https://www.facebook.com/audelalesrizieres/'),
  instagram = coalesce(nullif(instagram,''), 'https://www.instagram.com/audelalesrizieres/')
where slug = 'audela-les-rizieres';

insert into public.association_projects (business_id, tenant_id, title, description, status, position)
select b.id, b.tenant_id, v.title, v.description, 'active', v.position
from public.businesses b
cross join (values
  ('Centre socio-éducatif', 'Alternative éducative pour les enfants défavorisés d''O''Krassar.', 0),
  ('Sorties éducatives et culturelles', 'Découvertes locales (fermes, événements, fêtes).', 1),
  ('Ateliers de théâtre', 'Expression scénique et travail sur les émotions.', 2),
  ('Bénévolat et mécénat de compétences', 'Accueil de bénévoles et soutien en compétences.', 3)
) as v(title, description, position)
where b.slug = 'audela-les-rizieres'
  and not exists (select 1 from public.association_projects p where p.business_id = b.id and p.title = v.title);

-- ---------------------------------------------------------------------------
-- Vérification
-- ---------------------------------------------------------------------------
select slug,
       jsonb_array_length(history)     as nb_histoire,
       jsonb_array_length(public_team) as nb_equipe,
       jsonb_array_length(impact)      as nb_impact,
       (select count(*) from public.association_projects p where p.business_id = b.id) as nb_projets
from public.businesses b
where slug in ('enfants-dasie', 'kepchildren-kep', 'audela-les-rizieres')
order by slug;
