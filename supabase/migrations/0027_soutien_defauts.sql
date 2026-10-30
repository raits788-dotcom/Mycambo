-- ============================================================================
-- 0027 — Pré-activation des soutiens essentiels pour les associations
-- ----------------------------------------------------------------------------
-- Toute fiche d'association propose par défaut : Don, Bénévolat, Adhésion.
-- (Parrainage, Mécénat, Boutique restent à activer au cas par cas.)
--
--   1. fonction + trigger : à la création d'un business de catégorie
--      "association" sans support_options, on initialise les essentiels.
--   2. rattrapage : les associations existantes sans support_options en
--      reçoivent les essentiels.
-- Idempotent.
-- ============================================================================

-- Valeur par défaut des soutiens essentiels.
create or replace function public.default_support_options()
returns jsonb language sql immutable as $$
  select '[
    {"type":"don","enabled":true},
    {"type":"benevolat","enabled":true},
    {"type":"adhesion","enabled":true}
  ]'::jsonb;
$$;

-- Trigger : initialise support_options pour une nouvelle fiche association.
create or replace function public.ensure_support_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_asso boolean;
begin
  -- Déjà renseigné ? on ne touche pas.
  if new.support_options is not null
     and jsonb_array_length(new.support_options) > 0 then
    return new;
  end if;

  select (c.slug = 'association') into v_is_asso
  from public.categories c
  where c.id = new.category_id;

  if coalesce(v_is_asso, false) then
    new.support_options := public.default_support_options();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_support_defaults on public.businesses;
create trigger trg_support_defaults
  before insert on public.businesses
  for each row
  execute function public.ensure_support_defaults();

-- Rattrapage des associations existantes sans soutiens configurés.
update public.businesses b
set support_options = public.default_support_options()
from public.categories c
where b.category_id = c.id
  and c.slug = 'association'
  and (b.support_options is null or jsonb_array_length(b.support_options) = 0);

select '✅ Soutiens essentiels pré-activés pour les associations' as resultat,
       (select count(*) from public.businesses b
        join public.categories c on c.id = b.category_id
        where c.slug = 'association'
          and jsonb_array_length(b.support_options) > 0) as assos_configurees;
