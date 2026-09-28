-- ============================================================================
-- MY CAMBO — Seed (données de démo)
-- ============================================================================
-- Fichier : supabase/seed.sql
-- Description : Peuple la base avec des données réalistes pour tester.
-- ⚠️ À exécuter UNIQUEMENT en DEV, jamais en PROD.
-- ============================================================================

-- Nettoie les données existantes (ordre inverse des FK)
truncate table public.payments cascade;
truncate table public.subscriptions cascade;
truncate table public.business_labels cascade;
truncate table public.businesses cascade;
truncate table public.tenants cascade;
truncate table public.plans cascade;
truncate table public.categories cascade;
truncate table public.labels cascade;
truncate table public.partner_requests cascade;
truncate table public.carousel_slides cascade;
truncate table public.cms_pages cascade;

-- ============================================================================
-- 1. PLANS (formules d'abonnement)
-- ============================================================================
insert into public.plans (name, slug, price_monthly, price_yearly, currency, max_businesses, features, trial_days, position, is_active) values
  ('Découverte', 'decouverte', 0, 0, 'USD', 1,
   '["Fiche basique", "Sans mise en avant", "Support email"]'::jsonb, 0, 1, true),
  ('Essentiel', 'essentiel', 15, 150, 'USD', 1,
   '["Fiche complète", "Photos illimitées", "Horaires", "1 label", "Support email"]'::jsonb, 14, 2, true),
  ('Pro', 'pro', 39, 390, 'USD', 3,
   '["Tout Essentiel", "3 établissements", "Mise en avant catégorie", "Statistiques", "Agenda"]'::jsonb, 14, 3, true),
  ('Business', 'business', 79, 790, 'USD', 10,
   '["Tout Pro", "10 établissements", "Coup de cœur possible", "Bannière", "Priorité support"]'::jsonb, 14, 4, true),
  ('Entreprise', 'entreprise', 199, 1990, 'USD', 999,
   '["Tout Business", "Établissements illimités", "Multi-sites", "API", "Account manager"]'::jsonb, 30, 5, false);

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================
insert into public.categories (name, slug, icon, color, position, is_active) values
  ('Hôtels', 'hotel', '🏨', '#2C5599', 1, true),
  ('Restaurants', 'restaurant', '🍜', '#F07C29', 2, true),
  ('Associations', 'association', '❤️', '#E5407A', 3, true),
  ('Activités', 'activite', '🛶', '#35A85B', 4, true),
  ('Shopping', 'shopping', '🧵', '#D9A441', 5, true),
  ('Spa & Bien-être', 'spa', '💆', '#7B3FE4', 6, true),
  ('Transports', 'transport', '🛺', '#2C82D6', 7, true);

-- ============================================================================
-- 3. LABELS
-- ============================================================================
insert into public.labels (name, slug, color, icon) values
  ('Vérifié My Cambo', 'verifie', '#1B3A6B', '✓'),
  ('Coup de cœur', 'coup-de-coeur', '#D9A441', '⭐'),
  ('Éco-responsable', 'eco-responsable', '#35A85B', '🌱'),
  ('Coup de pouce local', 'coup-de-pouce', '#F07C29', '🤝');

-- ============================================================================
-- 4. TENANTS (8 partenaires)
-- ============================================================================
insert into public.tenants (id, slug, name, email, phone, address, city, description, status) values
  ('11111111-1111-1111-1111-111111111111', 'le-bistro-khmer', 'Le Bistro Khmer', 'contact@bistro-khmer.com', '+855 12 345 678', '12 Street 240, Daun Penh', 'Phnom Penh', 'Restaurant khmer authentique au cœur de Phnom Penh.', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'sokha-spa', 'Sokha Spa & Massage', 'hello@sokha-spa.kh', '+855 63 555 111', 'Sivatha Blvd', 'Siem Reap', 'Spa traditionnel khmer, massage et soins naturels.', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'angkor-travel', 'Angkor Travel Co.', 'info@angkor-travel.com', '+855 63 777 222', 'Wat Bo Road', 'Siem Reap', 'Agence de voyage spécialisée Angkor et temples.', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'green-umbrella', 'Green Umbrella', 'sokha@greenumbrella-kh.org', '+855 23 888 333', 'St 240', 'Phnom Penh', 'ONG qui soutient les enfants défavorisés du Cambodge.', 'active'),
  ('55555555-5555-5555-5555-555555555555', 'kampot-pepper', 'Kampot Pepper Farm', 'visit@kampot-pepper.kh', '+855 33 999 444', 'Route 33', 'Kampot', 'Ferme de poivre de Kampot IGP, visites guidées.', 'pending'),
  ('66666666-6666-6666-6666-666666666666', 'tonle-sap-cruises', 'Tonle Sap Cruises', 'booking@tonlesap-cruises.com', '+855 63 222 555', 'Chong Kneas', 'Siem Reap', 'Croisières sur le lac Tonle Sap et village flottant.', 'pending'),
  ('77777777-7777-7777-7777-777777777777', 'khmer-ceramics', 'Khmer Ceramics Center', 'ceramics@khmercenter.org', '+855 63 333 666', 'Charles de Gaulle', 'Siem Reap', 'Centre de céramique khmère, ateliers et boutiques.', 'suspended'),
  ('88888888-8888-8888-8888-888888888888', 'pp-food-tours', 'Phnom Penh Food Tours', 'book@pp-foodtours.kh', '+855 12 777 999', 'St 172', 'Phnom Penh', 'Circuits gastronomiques dans Phnom Penh.', 'active');

-- ============================================================================
-- 5. BUSINESSES (10 établissements)
-- ============================================================================
insert into public.businesses (tenant_id, category_id, name, slug, description, address, city, phone, status, is_featured, featured_position) values
  ('11111111-1111-1111-1111-111111111111',
   (select id from public.categories where slug = 'restaurant'),
   'Le Bistro Khmer — Daun Penh', 'bistro-khmer-daun-penh',
   'Notre adresse principale à Daun Penh.', '12 Street 240', 'Phnom Penh', '+855 12 345 678',
   'approved', true, 1),
  ('11111111-1111-1111-1111-111111111111',
   (select id from public.categories where slug = 'restaurant'),
   'Le Bistro Khmer — BKK1', 'bistro-khmer-bkk1',
   'Notre seconde adresse à BKK1.', 'St 278', 'Phnom Penh', '+855 12 345 679',
   'approved', false, null),
  ('11111111-1111-1111-1111-111111111111',
   (select id from public.categories where slug = 'restaurant'),
   'Le Bistro Khmer Express', 'bistro-khmer-express',
   'Format rapide pour déjeuner.', 'St 51', 'Phnom Penh', '+855 12 345 680',
   'pending', false, null),
  ('22222222-2222-2222-2222-222222222222',
   (select id from public.categories where slug = 'spa'),
   'Sokha Spa — Riverside', 'sokha-spa-riverside',
   'Spa de luxe au bord de la rivière.', 'Sivatha Blvd', 'Siem Reap', '+855 63 555 111',
   'approved', true, 2),
  ('33333333-3333-3333-3333-333333333333',
   (select id from public.categories where slug = 'activite'),
   'Angkor Travel Co.', 'angkor-travel-co',
   'Tours privés Angkor Wat, Bayon, Ta Prohm.', 'Wat Bo Road', 'Siem Reap', '+855 63 777 222',
   'approved', false, null),
  ('44444444-4444-4444-4444-444444444444',
   (select id from public.categories where slug = 'association'),
   'Green Umbrella HQ', 'green-umbrella-hq',
   'Siège de l''ONG Green Umbrella.', 'St 240', 'Phnom Penh', '+855 23 888 333',
   'approved', false, null),
  ('55555555-5555-5555-5555-555555555555',
   (select id from public.categories where slug = 'shopping'),
   'Kampot Pepper Farm', 'kampot-pepper-farm',
   'Visites et vente directe de poivre de Kampot.', 'Route 33', 'Kampot', '+855 33 999 444',
   'pending', false, null),
  ('66666666-6666-6666-6666-666666666666',
   (select id from public.categories where slug = 'activite'),
   'Tonle Sap Cruises', 'tonle-sap-cruises',
   'Croisières coucher de soleil sur le Tonle Sap.', 'Chong Kneas', 'Siem Reap', '+855 63 222 555',
   'pending', false, null),
  ('77777777-7777-7777-7777-777777777777',
   (select id from public.categories where slug = 'shopping'),
   'Khmer Ceramics — Atelier', 'khmer-ceramics-atelier',
   'Atelier de céramique khmère traditionnelle.', 'Charles de Gaulle', 'Siem Reap', '+855 63 333 666',
   'suspended', false, null),
  ('88888888-8888-8888-8888-888888888888',
   (select id from public.categories where slug = 'activite'),
   'Phnom Penh Food Tours', 'pp-food-tours',
   'Circuits gastronomiques à travers Phnom Penh.', 'St 172', 'Phnom Penh', '+855 12 777 999',
   'approved', true, 3);

-- ============================================================================
-- 6. SUBSCRIPTIONS (8 abonnements)
-- ============================================================================
insert into public.subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end) values
  ('11111111-1111-1111-1111-111111111111', (select id from public.plans where slug = 'pro'), 'active', '2025-02-15', '2025-03-15'),
  ('22222222-2222-2222-2222-222222222222', (select id from public.plans where slug = 'essentiel'), 'active', '2025-02-10', '2025-03-10'),
  ('33333333-3333-3333-3333-333333333333', (select id from public.plans where slug = 'business'), 'expiring', '2025-02-05', '2025-03-05'),
  ('44444444-4444-4444-4444-444444444444', (select id from public.plans where slug = 'essentiel'), 'active', '2025-02-01', '2025-03-01'),
  ('55555555-5555-5555-5555-555555555555', (select id from public.plans where slug = 'pro'), 'past_due', '2025-01-20', '2025-02-20'),
  ('66666666-6666-6666-6666-666666666666', (select id from public.plans where slug = 'decouverte'), 'expired', '2025-01-15', '2025-02-15'),
  ('77777777-7777-7777-7777-777777777777', (select id from public.plans where slug = 'pro'), 'active', '2025-02-12', '2025-03-12'),
  ('88888888-8888-8888-8888-888888888888', (select id from public.plans where slug = 'business'), 'active', '2025-02-08', '2025-03-08');

-- ============================================================================
-- 7. PAYMENTS (12 paiements)
-- ============================================================================
insert into public.payments (tenant_id, subscription_id, amount, currency, method, gateway_ref, status, paid_at) values
  ('11111111-1111-1111-1111-111111111111', (select id from public.subscriptions where tenant_id = '11111111-1111-1111-1111-111111111111' limit 1), 39, 'USD', 'aba', 'ABA-20250215-8821', 'paid', '2025-02-15 10:00:00+07'),
  ('11111111-1111-1111-1111-111111111111', (select id from public.subscriptions where tenant_id = '11111111-1111-1111-1111-111111111111' limit 1), 39, 'USD', 'aba', 'ABA-20250115-1122', 'paid', '2025-01-15 10:00:00+07'),
  ('22222222-2222-2222-2222-222222222222', (select id from public.subscriptions where tenant_id = '22222222-2222-2222-2222-222222222222' limit 1), 15, 'USD', 'wing', 'WG-20250213-4412', 'paid', '2025-02-13 11:30:00+07'),
  ('33333333-3333-3333-3333-333333333333', (select id from public.subscriptions where tenant_id = '33333333-3333-3333-3333-333333333333' limit 1), 79, 'USD', 'bakong', 'BK-20250212-9001', 'paid', '2025-02-12 14:20:00+07'),
  ('44444444-4444-4444-4444-444444444444', (select id from public.subscriptions where tenant_id = '44444444-4444-4444-4444-444444444444' limit 1), 15, 'USD', 'aba', 'ABA-20250211-3355', 'paid', '2025-02-11 09:15:00+07'),
  ('55555555-5555-5555-5555-555555555555', (select id from public.subscriptions where tenant_id = '55555555-5555-5555-5555-555555555555' limit 1), 39, 'USD', 'aba', 'ABA-20250210-1122', 'failed', null),
  ('77777777-7777-7777-7777-777777777777', (select id from public.subscriptions where tenant_id = '77777777-7777-7777-7777-777777777777' limit 1), 39, 'USD', 'stripe', 'ST-20250209-7788', 'paid', '2025-02-09 16:45:00+07'),
  ('88888888-8888-8888-8888-888888888888', (select id from public.subscriptions where tenant_id = '88888888-8888-8888-8888-888888888888' limit 1), 79, 'USD', 'aba', 'ABA-20250208-5566', 'paid', '2025-02-08 12:00:00+07'),
  ('11111111-1111-1111-1111-111111111111', (select id from public.subscriptions where tenant_id = '11111111-1111-1111-1111-111111111111' limit 1), 39, 'USD', 'aba', 'ABA-20250207-5566', 'refunded', '2025-02-07 10:00:00+07'),
  ('22222222-2222-2222-2222-222222222222', (select id from public.subscriptions where tenant_id = '22222222-2222-2222-2222-222222222222' limit 1), 15, 'USD', 'wing', 'WG-20250113-3322', 'paid', '2025-01-13 11:30:00+07'),
  ('33333333-3333-3333-3333-333333333333', (select id from public.subscriptions where tenant_id = '33333333-3333-3333-3333-333333333333' limit 1), 79, 'USD', 'bakong', 'BK-20250112-8001', 'paid', '2025-01-12 14:20:00+07'),
  ('88888888-8888-8888-8888-888888888888', (select id from public.subscriptions where tenant_id = '88888888-8888-8888-8888-888888888888' limit 1), 79, 'USD', 'aba', 'ABA-20250108-4466', 'paid', '2025-01-08 12:00:00+07');

-- ============================================================================
-- 8. PARTNER_REQUESTS (5 demandes)
-- ============================================================================
insert into public.partner_requests (company_name, email, phone, category, city, message, status) values
  ('Koh Rong Diving Center', 'dive@kohrong-diving.com', '+855 92 111 222', 'Activité', 'Koh Rong',
   'Bonjour, nous souhaitons rejoindre My Cambo pour promouvoir nos plongées autour de l''archipel de Koh Rong.', 'pending'),
  ('Battambang Bamboo Train', 'info@bamboo-train.kh', '+855 92 333 444', 'Activité', 'Battambang',
   'Nous opérons le célèbre train de bambou de Battambang.', 'pending'),
  ('Malis Restaurant', 'reservation@malis-restaurant.com', '+855 23 555 666', 'Restaurant', 'Phnom Penh',
   'Restaurant gastronomique khmer, 15 ans d''existence.', 'approved'),
  ('Friends International', 'contact@friends-international.org', '+855 23 777 888', 'Association', 'Phnom Penh',
   'ONG internationale qui soutient les enfants marginalisés.', 'approved'),
  ('Angkor Silk Farm', 'visit@angkor-silk.kh', '+855 63 999 000', 'Shopping', 'Siem Reap',
   'Ferme de soie proposant visites guidées et ateliers.', 'rejected');

-- ============================================================================
-- 9. CAROUSEL_SLIDES (3 slides)
-- ============================================================================
insert into public.carousel_slides (title, subtitle, image_url, cta_label, cta_href, position, is_active) values
  ('Le Cambodge se dévoile', 'Temples millénaires, artisans et hospitalité légendaire.', 'https://images.unsplash.com/photo-1509631166464-1b1e1e1e1e1e?w=1920', 'Explorer le pays', '/decouvrir', 1, true),
  ('Découvrez Angkor', 'La cité perdue des Khmers vous attend.', 'https://images.unsplash.com/photo-1563492065-1a1e1e1e1e1e?w=1920', 'Voir les temples', '/decouvrir/culture', 2, true),
  ('Bienvenue au Cambodge', 'Terre d''hospitalité et de saveurs uniques.', 'https://images.unsplash.com/photo-1528181304800-1a1e1e1e1e1e?w=1920', 'Devenir partenaire', '/partenaire', 3, true);

-- ============================================================================
-- 10. CMS_PAGES (5 pages)
-- ============================================================================
insert into public.cms_pages (slug, title, content, seo_title, seo_description, status) values
  ('accueil', 'Accueil', '{"blocks": []}'::jsonb, 'MyCambo — Tout le Cambodge dans votre poche', 'Plateforme numérique dédiée au Cambodge : annuaire, culture, vie locale.', 'published'),
  ('a-propos', 'À propos', '{"blocks": []}'::jsonb, 'À propos de MyCambo', 'Notre mission : mettre en avant le Cambodge.', 'published'),
  ('contact', 'Contact', '{"blocks": []}'::jsonb, 'Contact · MyCambo', 'Nous contacter.', 'published'),
  ('cgu', 'Conditions générales', '{"blocks": []}'::jsonb, 'CGU · MyCambo', 'Conditions générales d''utilisation.', 'published'),
  ('confidentialite', 'Politique de confidentialité', '{"blocks": []}'::jsonb, 'Confidentialité · MyCambo', 'Notre politique RGPD.', 'published');

-- ============================================================================
-- FIN DU SEED
-- ============================================================================