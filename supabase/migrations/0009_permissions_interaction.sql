-- ============================================================================
-- 0009 — PERMISSIONS D'INTERACTION PAR FORMULE
-- ============================================================================
-- Ajoute aux permissions de chaque formule ce que le PUBLIC peut faire sur la
-- fiche : messagerie, réservation, offres, candidatures. Ainsi l'abonnement
-- débloque de vrais services, pas seulement de l'affichage.
-- On fusionne les nouveaux drapeaux dans la colonne permissions (jsonb) existante.
-- ============================================================================

-- Découverte : fiche vitrine, aucune interaction
update public.plans set permissions = permissions ||
  '{"canReceiveMessages":false,"canReceiveReservations":false,"canPublishOffers":false,"canReceiveApplications":false}'::jsonb
  where slug = 'decouverte';

-- Essentiel : contact seulement
update public.plans set permissions = permissions ||
  '{"canReceiveMessages":true,"canReceiveReservations":false,"canPublishOffers":false,"canReceiveApplications":false}'::jsonb
  where slug = 'essentiel';

-- Pro : contact + réservations + candidatures
update public.plans set permissions = permissions ||
  '{"canReceiveMessages":true,"canReceiveReservations":true,"canPublishOffers":false,"canReceiveApplications":true}'::jsonb
  where slug = 'pro';

-- Business : tout, dont offres du moment
update public.plans set permissions = permissions ||
  '{"canReceiveMessages":true,"canReceiveReservations":true,"canPublishOffers":true,"canReceiveApplications":true}'::jsonb
  where slug = 'business';

-- Entreprise : tout
update public.plans set permissions = permissions ||
  '{"canReceiveMessages":true,"canReceiveReservations":true,"canPublishOffers":true,"canReceiveApplications":true}'::jsonb
  where slug = 'entreprise';

-- Association (gratuite) : contact + candidatures (bénévolat), pas de réservation/offres
update public.plans set permissions = permissions ||
  '{"canReceiveMessages":true,"canReceiveReservations":false,"canPublishOffers":false,"canReceiveApplications":true}'::jsonb
  where slug = 'association';

select '0009 — permissions d''interaction par formule' as resultat;
