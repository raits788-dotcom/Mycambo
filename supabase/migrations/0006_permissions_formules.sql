-- ============================================================================
-- 0006 — DROITS DES FORMULES EN BASE (fin du "rien en dur" sur les formules)
-- ============================================================================
-- Ajoute une colonne `permissions` (JSONB) à `plans` : les drapeaux
-- fonctionnels qui décident ce que chaque formule débloque sur le site.
-- (La colonne `features` existante reste pour les textes d'affichage.)
-- Insère/MAJ les 6 formules, dont la formule Association GRATUITE qui
-- manquait, et la formule Entreprise réactivée.
-- ============================================================================

alter table public.plans add column if not exists permissions jsonb default '{}'::jsonb;

-- Garantit une contrainte unique sur plans.slug (nécessaire au ON CONFLICT).
-- Sans elle, l'upsert échoue. On la crée si elle n'existe pas déjà.
do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'plans' and c.contype in ('u','p')
      and pg_get_constraintdef(c.oid) ilike '%(slug)%'
  ) and not exists (
    select 1 from pg_indexes where tablename = 'plans' and indexdef ilike '%unique%(slug)%'
  ) then
    execute 'alter table public.plans add constraint plans_slug_unique unique (slug)';
  end if;
end$$;

-- Upsert des 6 formules avec leurs permissions.
-- On insère si le slug n'existe pas, sinon on met à jour price/permissions.
insert into public.plans (name, slug, price_monthly, price_yearly, currency, max_businesses, features, permissions, trial_days, position, is_active)
values
  ('Découverte', 'decouverte', 0, 0, 'USD', 1,
   '["Fiche basique", "Sans mise en avant", "Support email"]'::jsonb,
   '{"canShowPhotos":false,"canShowDescription":false,"canShowHours":false,"canShowSocialLinks":false,"canShowStats":false,"canBeFeatured":false,"canShowBanner":false,"canUseMessaging":false,"maxPhotos":0,"maxEstablishments":1}'::jsonb,
   0, 1, true),

  ('Essentiel', 'essentiel', 15, 150, 'USD', 1,
   '["Fiche complète", "Jusqu''à 20 photos", "Horaires", "Liens sociaux", "Statistiques", "Messagerie"]'::jsonb,
   '{"canShowPhotos":true,"canShowDescription":true,"canShowHours":true,"canShowSocialLinks":true,"canShowStats":true,"canBeFeatured":false,"canShowBanner":false,"canUseMessaging":true,"maxPhotos":20,"maxEstablishments":1}'::jsonb,
   14, 2, true),

  ('Pro', 'pro', 39, 390, 'USD', 3,
   '["Tout Essentiel", "3 établissements", "Mise en avant catégorie", "Photos illimitées"]'::jsonb,
   '{"canShowPhotos":true,"canShowDescription":true,"canShowHours":true,"canShowSocialLinks":true,"canShowStats":true,"canBeFeatured":true,"canShowBanner":false,"canUseMessaging":true,"maxPhotos":999,"maxEstablishments":3}'::jsonb,
   14, 3, true),

  ('Business', 'business', 79, 790, 'USD', 10,
   '["Tout Pro", "10 établissements", "Coup de cœur", "Bannière", "Priorité support"]'::jsonb,
   '{"canShowPhotos":true,"canShowDescription":true,"canShowHours":true,"canShowSocialLinks":true,"canShowStats":true,"canBeFeatured":true,"canShowBanner":true,"canUseMessaging":true,"maxPhotos":999,"maxEstablishments":10}'::jsonb,
   14, 4, true),

  ('Entreprise', 'entreprise', 199, 1990, 'USD', 999,
   '["Tout Business", "Établissements illimités", "Multi-sites", "Account manager"]'::jsonb,
   '{"canShowPhotos":true,"canShowDescription":true,"canShowHours":true,"canShowSocialLinks":true,"canShowStats":true,"canBeFeatured":true,"canShowBanner":true,"canUseMessaging":true,"maxPhotos":999,"maxEstablishments":999}'::jsonb,
   30, 5, true),

  -- Formule ASSOCIATION : gratuite, réservée aux associations/ONG.
  ('Association', 'association', 0, 0, 'USD', 3,
   '["Gratuit pour les associations", "Jusqu''à 10 photos", "Horaires", "Liens sociaux", "Statistiques", "Messagerie"]'::jsonb,
   '{"canShowPhotos":true,"canShowDescription":true,"canShowHours":true,"canShowSocialLinks":true,"canShowStats":true,"canBeFeatured":false,"canShowBanner":false,"canUseMessaging":true,"maxPhotos":10,"maxEstablishments":3}'::jsonb,
   0, 6, true)

on conflict (slug) do update set
  price_monthly  = excluded.price_monthly,
  price_yearly   = excluded.price_yearly,
  max_businesses = excluded.max_businesses,
  features       = excluded.features,
  permissions    = excluded.permissions,
  position       = excluded.position,
  is_active      = excluded.is_active;

select '0006 — permissions de formules en base + formule Association créée' as resultat;
