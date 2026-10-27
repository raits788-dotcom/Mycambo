-- ============================================================================
-- IMPORT EN MASSE — Associations (lot 1 : 4 associations)
-- ============================================================================
-- Pour chaque association : 1 tenant en gérance myCAMBO (sans compte de
-- connexion) + 1 fiche établissement en statut "pending" (à valider dans la
-- console). Les logos/photos ne sont PAS importés automatiquement (droits) :
-- à ajouter ensuite via la médiathèque après vérification des droits.
--
-- Prérequis : migration 0018 appliquée (colonnes managed_by_mycambo, claimed_at).
-- Idempotent : si un slug existe déjà, l'association n'est pas recréée.
-- ============================================================================

do $$
declare
  v_cat_association uuid;
  v_tenant uuid;
begin
  -- Catégorie "association"
  select id into v_cat_association from public.categories where slug = 'association' limit 1;
  if v_cat_association is null then
    raise exception 'Catégorie association introuvable';
  end if;

  -- ----- 1. ASKEP (Association Sportive de Kep) -----
  if not exists (select 1 from public.tenants where slug = 'askep') then
    insert into public.tenants (slug, name, email, city, description, status, managed_by_mycambo, verification_level)
    values ('askep', 'ASKEP - Association Sportive de Kep', 'askep1901@gmail.com', 'Kep',
            'Association franco-cambodgienne (2010) qui utilise le tennis comme outil éducatif : activités sportives gratuites pour les enfants de milieux modestes.',
            'active', true, 'inscrit')
    returning id into v_tenant;

    insert into public.businesses (tenant_id, category_id, name, slug, city, email, status,
      short_description, long_description, website, facebook, instagram, photos)
    values (v_tenant, v_cat_association, 'ASKEP - Association Sportive de Kep', 'askep-kep', 'Kep', 'askep1901@gmail.com', 'pending',
      'Le tennis comme outil éducatif pour les enfants de Kep.',
      'Association franco-cambodgienne créée en 2010, l''ASKEP utilise le tennis comme outil éducatif au Cambodge. Elle propose gratuitement des activités sportives aux enfants de milieux modestes et vise l''inclusion sociale, la confiance en soi et des valeurs comme le respect, la discipline et l''entraide, en y intégrant la santé et l''hygiène.',
      'https://askep.org/', 'https://www.facebook.com/askepofficiel/', 'https://www.instagram.com/askepofficiel/', '[]'::jsonb);
  end if;

  -- ----- 2. KEPCHILDREN (Kep Children) -----
  if not exists (select 1 from public.tenants where slug = 'kepchildren') then
    insert into public.tenants (slug, name, email, phone, address, city, description, status, managed_by_mycambo, verification_level)
    values ('kepchildren', 'KEPCHILDREN - Kep Children', 'kepchildren@gmail.com', '+855 97 648 2737',
            'NR33A, Krong Kaeb', 'Kep',
            'Association franco-cambodgienne (2012) : scolarisation, santé, alimentation et logement pour les enfants démunis de Kep.',
            'active', true, 'inscrit')
    returning id into v_tenant;

    insert into public.businesses (tenant_id, category_id, name, slug, city, address, phone, email, status,
      short_description, long_description, website, facebook, instagram, photos)
    values (v_tenant, v_cat_association, 'KEPCHILDREN - Kep Children', 'kepchildren-kep', 'Kep',
      'NR33A, Krong Kaeb', '+855 97 648 2737', 'kepchildren@gmail.com', 'pending',
      'Aider les enfants démunis de Kep à aller à l''école.',
      'Association franco-cambodgienne fondée en 2012, Kep Children aide les enfants les plus démunis de Kep à aller à l''école et soutient environ 70 enfants chaque jour. Elle intervient aussi sur la santé, l''alimentation, le logement et le soutien aux familles.',
      'https://kepchildren.fr/', 'https://www.facebook.com/KepChildren', 'https://www.instagram.com/kepchildren_officiel', '[]'::jsonb);
  end if;

  -- ----- 3. Au-Delà Les Rizières -----
  if not exists (select 1 from public.tenants where slug = 'audela-les-rizieres') then
    insert into public.tenants (slug, name, email, address, city, description, status, managed_by_mycambo, verification_level)
    values ('audela-les-rizieres', 'Au-Delà Les Rizières', 'audelalesrizieres@gmail.com',
            'O''Krassar, Krong Kaeb, Province de Kep', 'O''Krassar',
            'Association (2018) gérant un centre socio-éducatif pour enfants défavorisés à O''Krassar, province de Kep.',
            'active', true, 'inscrit')
    returning id into v_tenant;

    insert into public.businesses (tenant_id, category_id, name, slug, city, address, email, status,
      short_description, long_description, website, facebook, instagram, photos)
    values (v_tenant, v_cat_association, 'Au-Delà Les Rizières', 'audela-les-rizieres', 'O''Krassar',
      'O''Krassar, Krong Kaeb, Province de Kep', 'audelalesrizieres@gmail.com', 'pending',
      'Un centre socio-éducatif pour les enfants d''O''Krassar.',
      'Fondée en 2018, l''association Au-Delà Les Rizières gère un centre socio-éducatif destiné aux enfants du village d''O''Krassar, dans la province de Kep. Elle développe une alternative éducative pour des enfants défavorisés et finance ses actions exclusivement sur le terrain.',
      'https://audelalesrizieres.org/', 'https://www.facebook.com/audelalesrizieres/', 'https://www.instagram.com/audelalesrizieres/', '[]'::jsonb);
  end if;

  -- ----- 4. Enfants d'Asie -----
  if not exists (select 1 from public.tenants where slug = 'enfants-dasie') then
    insert into public.tenants (slug, name, email, phone, city, description, status, managed_by_mycambo, verification_level)
    values ('enfants-dasie', 'Enfants d''Asie', 'contacts@enfantsdasie.com', '+33 1 47 00 19 00', 'Phnom Penh',
            'Association reconnue d''utilité publique (1991) : scolarisation, formation et insertion des enfants défavorisés au Cambodge et en Asie du Sud-Est.',
            'active', true, 'inscrit')
    returning id into v_tenant;

    insert into public.businesses (tenant_id, category_id, name, slug, city, email, phone, status,
      short_description, long_description, website, facebook, instagram, photos)
    values (v_tenant, v_cat_association, 'Enfants d''Asie', 'enfants-dasie', 'Phnom Penh',
      'contacts@enfantsdasie.com', '+33 1 47 00 19 00', 'pending',
      'Scolarisation et insertion des enfants défavorisés en Asie du Sud-Est.',
      'Association d''aide à l''enfance défavorisée fondée en 1991 et reconnue d''utilité publique. Enfants d''Asie couvre les besoins essentiels des enfants, assure leur scolarisation et leur formation jusqu''à leur insertion professionnelle, en travaillant avec des partenaires locaux. Elle intervient au Cambodge et dans trois autres pays d''Asie du Sud-Est.',
      'https://enfantsdasie.com/', 'https://www.facebook.com/enfants.dasie/', 'https://www.instagram.com/enfantsdasie/', '[]'::jsonb);
  end if;

-- ----- Attribuer la formule Association (gratuite) à toutes les assos importées -----
  declare
    v_plan_assoc uuid;
    v_ver_assoc uuid;
  begin
    select id into v_plan_assoc from public.plans where slug = 'association' limit 1;
    if v_plan_assoc is not null then
      select id into v_ver_assoc from public.plan_versions where plan_id = v_plan_assoc and status = 'current' limit 1;
      -- formule sur tenants + fiches en gérance de catégorie association
      update public.tenants t set plan_id = v_plan_assoc
        where t.managed_by_mycambo = true and t.plan_id is null
          and exists (select 1 from public.businesses b where b.tenant_id = t.id
                      and b.category_id = v_cat_association);
      update public.businesses b set plan_id = v_plan_assoc
        where b.category_id = v_cat_association and b.plan_id is null
          and exists (select 1 from public.tenants t where t.id = b.tenant_id and t.managed_by_mycambo = true);
      -- souscription active pour chaque fiche sans souscription
      insert into public.subscriptions (tenant_id, business_id, plan_id, plan_version_id, status, current_period_start, current_period_end)
      select b.tenant_id, b.id, v_plan_assoc, v_ver_assoc, 'active', now(), now() + interval '1 year'
      from public.businesses b
      join public.tenants t on t.id = b.tenant_id
      where t.managed_by_mycambo = true and b.category_id = v_cat_association
        and not exists (select 1 from public.subscriptions s where s.business_id = b.id);
    end if;
  end;

end$$;

select '✅ Import lot 1 terminé' as resultat,
       (select count(*) from public.businesses where status = 'pending' and category_id = (select id from public.categories where slug='association')) as assos_en_attente;
