-- ============================================================================
-- 0019 — Génération automatique des codes de parrainage
-- ----------------------------------------------------------------------------
-- Problème : les tenants créés hors du flux d'inscription (ex. import en masse
-- d'associations en gérance myCAMBO) n'avaient pas de ligne dans
-- referral_codes → le lien de parrainage affichait "?ref=null".
--
-- Solution durable ("tout en base") :
--   1. une fonction qui génère un code court unique ;
--   2. un trigger qui crée le code à chaque nouveau tenant ;
--   3. un rattrapage pour tous les tenants existants sans code.
-- Idempotent.
-- ============================================================================

-- 1. Génération d'un code court unique (8 caractères alphanumériques majuscules)
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  v_code text;
  v_exists boolean;
begin
  loop
    -- 8 caractères hexadécimaux majuscules, générés sans dépendre d'une
    -- extension (md5 est toujours disponible). Collision gérée par la boucle.
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    select exists(select 1 from public.referral_codes where code = v_code) into v_exists;
    exit when not v_exists;
  end loop;
  return v_code;
end;
$$;

-- 2. Fonction trigger : crée le code pour le nouveau tenant s'il n'en a pas
create or replace function public.ensure_referral_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.referral_codes where tenant_id = new.id) then
    insert into public.referral_codes (tenant_id, code)
    values (new.id, public.generate_referral_code());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ensure_referral_code on public.tenants;
create trigger trg_ensure_referral_code
  after insert on public.tenants
  for each row
  execute function public.ensure_referral_code();

-- 3. Rattrapage : tous les tenants existants sans code en reçoivent un
insert into public.referral_codes (tenant_id, code)
select t.id, public.generate_referral_code()
from public.tenants t
where not exists (
  select 1 from public.referral_codes rc where rc.tenant_id = t.id
);

select '✅ Codes de parrainage générés' as resultat,
       (select count(*) from public.referral_codes) as total_codes;
