-- ============================================================================
-- Remplissage des fiches ASKEP + Au-Delà Les Rizières (données validées)
-- ----------------------------------------------------------------------------
-- À exécuter dans le SQL Editor Supabase (superadmin).
-- Idempotent : relançable sans doublon. Ne touche QUE les champs renseignés.
-- Les champs "non trouvés" lors de la collecte sont laissés vides volontairement.
--
-- ⚠️ Données issues de sources tierces/presse (sites officiels inaccessibles),
--    validées manuellement par l'administrateur avant exécution.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ASKEP — Association Sportive de Kep  (slug: askep-kep)
-- ---------------------------------------------------------------------------
update public.businesses
set
  description = coalesce(nullif(description, ''),
    'Le tennis comme outil éducatif pour des enfants défavorisés de Kep.'),
  long_description =
    'L''ASKEP gère l''École de Tennis de Kep, soutenue par IC (France). '
    'Elle offre encadrement et accompagnement à de jeunes enfants ayant un '
    'accès limité à la scolarité, dans une zone à faibles ressources, pour '
    'développer des compétences vers un meilleur avenir, en lien étroit avec '
    'la communauté locale.',
  history = '[
    {"year":"2010","text":"Fourniture d''équipement et d''infrastructures de tennis pour les jeunes de Kep."},
    {"year":"2020","text":"4e Tennis Open de Kep (février)."},
    {"year":"2021","text":"Activités sportives suspendues (contexte sanitaire) ; lien maintenu avec les enfants et les familles."},
    {"year":"2022","text":"Reprise des activités de tennis (janvier)."},
    {"year":"2023","text":"Installation d''un éclairage sur le court ; Seyha Chhim, ancien élève, devient responsable de la structure de Kep."},
    {"year":"2024","text":"Programme « Beyond Kep » : 60 enfants de l''école de Phnom Kulen (Siem Reap)."},
    {"year":"2025","text":"Plus de 100 enfants (Jardin des Langues) participent aux activités de tennis au KTC de Kep."}
  ]'::jsonb,
  public_team = '[
    {"name":"Seyha Chhim","role":"Responsable de la structure de Kep","photo_url":null}
  ]'::jsonb,
  impact = '[
    {"value":"14+","label":"années d''activité"},
    {"value":"100+","label":"enfants accompagnés (2025)"},
    {"value":"60","label":"enfants — programme Beyond Kep"}
  ]'::jsonb,
  facebook = coalesce(nullif(facebook, ''), 'https://www.facebook.com/askepofficiel/')
where slug = 'askep-kep';

-- Projets ASKEP (idempotent via un marqueur sur title)
insert into public.association_projects (business_id, tenant_id, title, description, status, position)
select b.id, b.tenant_id, v.title, v.description, 'active', v.position
from public.businesses b
cross join (values
  ('École de Tennis de Kep', 'Encadrement et développement de compétences par le tennis pour les enfants de Kep.', 0),
  ('Beyond Kep', 'Extension du programme aux élèves de Phnom Kulen (Siem Reap).', 1),
  ('Between the Lines', 'Le tennis comme levier de confiance et d''autonomisation des jeunes filles.', 2),
  ('Tennis Open de Kep', 'Tournoi annuel réunissant la communauté autour du tennis.', 3)
) as v(title, description, position)
where b.slug = 'askep-kep'
  and not exists (
    select 1 from public.association_projects p
    where p.business_id = b.id and p.title = v.title
  );

-- ---------------------------------------------------------------------------
-- 2. Au-Delà Les Rizières
--    ⚠️ Vérifier le slug réel avant exécution (remplace 'au-dela-les-rizieres'
--    par le slug exact si différent).
-- ---------------------------------------------------------------------------
update public.businesses
set
  description = coalesce(nullif(description, ''),
    'Centre socio-éducatif offrant cours et activités gratuits aux enfants d''O''Krassar (Kep).'),
  long_description =
    'Centre socio-éducatif situé dans le village d''O''Krassar (à ~15 min de Kep), '
    'animé par des bénévoles toute l''année. Cours et activités gratuits, accueil '
    'de tous les enfants sans inscription préalable. Anglais par le jeu (3 niveaux, '
    'enseignante cambodgienne 2×/semaine), activité manuelle et sportive '
    'hebdomadaires, cinéma de village, goûter quotidien, atelier cuisine, '
    'sensibilisation à l''environnement et au handicap, correspondance avec une '
    'école française.',
  history = '[
    {"year":"Origine","text":"Projet initié par Sok Ngo Sisowath (réfugié en France sous les Khmers rouges), fondateur du « Jardin des Langues » à Kep. Il achète un terrain à O''Krassar, rencontre Aurélie Gayod en France, qui concrétise le projet sur place."},
    {"year":"2025","text":"Inauguration de deux nouvelles salles (débutants avec coin bibliothèque ; avancés avec salle informatique) lors d''une journée portes ouvertes (avril)."}
  ]'::jsonb,
  public_team = '[
    {"name":"Sok Ngo Sisowath","role":"Initiateur du projet","photo_url":null},
    {"name":"Aurélie Gayod","role":"Porteuse du projet sur le terrain","photo_url":null}
  ]'::jsonb,
  impact = '[
    {"value":"15-45","label":"enfants accueillis par jour"},
    {"value":"2-14","label":"ans (tranche d''âge)"},
    {"value":"2","label":"nouvelles salles (2025)"}
  ]'::jsonb,
  phone = coalesce(nullif(phone, ''), '087824132')
where slug = 'au-dela-les-rizieres';

insert into public.association_projects (business_id, tenant_id, title, description, status, position)
select b.id, b.tenant_id, v.title, v.description, 'active', v.position
from public.businesses b
cross join (values
  ('Cours et activités gratuits', 'Anglais, activités culturelles et sportives, cinéma de village pour les enfants d''O''Krassar.', 0),
  ('Deux nouvelles salles de classe', 'Salles débutants et avancés inaugurées en 2025 (bibliothèque, salle informatique).', 1),
  ('Échanges avec une école française', 'Correspondance et ouverture culturelle avec des élèves en France.', 2)
) as v(title, description, position)
where b.slug = 'au-dela-les-rizieres'
  and not exists (
    select 1 from public.association_projects p
    where p.business_id = b.id and p.title = v.title
  );

-- ---------------------------------------------------------------------------
-- Vérification
-- ---------------------------------------------------------------------------
select slug,
       left(long_description, 40) || '…' as desc_debut,
       jsonb_array_length(history)    as nb_histoire,
       jsonb_array_length(public_team) as nb_equipe,
       jsonb_array_length(impact)      as nb_impact,
       (select count(*) from public.association_projects p where p.business_id = b.id) as nb_projets
from public.businesses b
where slug in ('askep-kep', 'au-dela-les-rizieres');
