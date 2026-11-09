-- ============================================================================
-- 0036 — Liens magiques d'accès partenaire (30 jours, usage unique)
-- ----------------------------------------------------------------------------
-- À l'approbation d'une demande, on génère un lien magique : le partenaire
-- clique, définit son mot de passe, le compte est activé. Le lien :
--   - expire après 30 jours,
--   - est à usage unique (consommé = inutilisable),
--   - référence le user Auth concerné.
-- Un code de vérification email (6 chiffres) permet de redemander un lien.
-- ============================================================================

create table if not exists public.magic_links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  email       text not null,
  token_hash  text not null unique,         -- hash du token (jamais le token en clair)
  purpose     text not null default 'partner_activation',
  expires_at  timestamptz not null,
  used_at     timestamptz,                  -- null tant que non utilisé
  created_at  timestamptz not null default now()
);
create index if not exists idx_magic_links_user on public.magic_links(user_id);
create index if not exists idx_magic_links_email on public.magic_links(email);

-- Codes de vérification email (6 chiffres) pour redemander un lien.
create table if not exists public.email_verification_codes (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code_hash   text not null,
  purpose     text not null default 'magic_resend',
  expires_at  timestamptz not null,
  used_at     timestamptz,
  attempts    int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_evc_email on public.email_verification_codes(email);

-- RLS : ces tables ne sont jamais lues côté client (tout passe par des
-- fonctions security definer / Edge Functions service_role).
alter table public.magic_links enable row level security;
alter table public.email_verification_codes enable row level security;

-- ----------------------------------------------------------------------------
-- Consommer un lien magique : vérifie hash + validité + usage unique, marque
-- utilisé, renvoie le user_id. security definer (appelée par Edge Function).
-- ----------------------------------------------------------------------------
create or replace function public.consume_magic_link(p_token_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_row public.magic_links%rowtype;
begin
  select * into v_row from public.magic_links where token_hash = p_token_hash;
  if v_row.id is null then
    return jsonb_build_object('ok', false, 'error', 'INVALID');
  end if;
  if v_row.used_at is not null then
    return jsonb_build_object('ok', false, 'error', 'USED');
  end if;
  if v_row.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'EXPIRED');
  end if;

  update public.magic_links set used_at = now() where id = v_row.id;
  return jsonb_build_object('ok', true, 'user_id', v_row.user_id, 'email', v_row.email);
end$$;
revoke all on function public.consume_magic_link(text) from public;
do $$ begin
  revoke all on function public.consume_magic_link(text) from anon;
  revoke all on function public.consume_magic_link(text) from authenticated;
exception when undefined_object then null; end $$;

select '0036 — magic_links + email_verification_codes' as resultat;
