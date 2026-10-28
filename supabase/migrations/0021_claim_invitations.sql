-- ============================================================================
-- 0021 — Réclamation d'accès des associations en gérance (sur invitation)
-- ----------------------------------------------------------------------------
-- Flux : myCAMBO INVITE une asso en gérance à réclamer son accès (pas de
-- bouton public, pour éviter le spam). L'asso reçoit un lien unique, finalise
-- son compte, complète son dossier, puis soumet. myCAMBO valide = l'asso sort
-- de la gérance et gère sa fiche.
--
-- Cycle de vie (status) :
--   invited            -> invitation envoyée, lien actif, pas encore ouvert
--   account_created    -> l'asso a ouvert le lien et créé son compte (mdp)
--   submitted          -> dossier complété et soumis, en attente de validation
--   approved           -> myCAMBO a validé : accès accordé
--   rejected           -> myCAMBO a refusé (avec motif)
--   expired / revoked  -> lien expiré ou annulé par myCAMBO
-- Idempotent.
-- ============================================================================

create table if not exists public.claim_invitations (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  business_id     uuid references public.businesses(id) on delete set null,
  -- email auquel l'invitation est envoyée (par défaut l'email importé du tenant)
  invited_email   text not null,
  -- jeton du lien d'invitation (haché, jamais stocké en clair)
  token_hash      text not null unique,
  expires_at      timestamptz not null,
  status          text not null default 'invited'
    check (status in ('invited','account_created','submitted','approved','rejected','expired','revoked')),
  -- compte rattaché une fois créé par l'asso
  requester_user_id uuid,
  requester_name    text,
  justificatif_url  text,
  -- suivi
  invited_by       uuid,            -- superadmin qui a envoyé l'invitation
  reviewed_by      uuid,            -- superadmin qui a validé/refusé
  reviewed_at      timestamptz,
  rejection_reason text,
  submitted_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_claim_invitations_tenant on public.claim_invitations(tenant_id);
create index if not exists idx_claim_invitations_status on public.claim_invitations(status);
create unique index if not exists idx_claim_invitations_token on public.claim_invitations(token_hash);

-- updated_at auto
create or replace function public.touch_claim_invitations()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists trg_touch_claim_invitations on public.claim_invitations;
create trigger trg_touch_claim_invitations
  before update on public.claim_invitations
  for each row execute function public.touch_claim_invitations();

-- ---------------------------------------------------------------------------
-- RLS : tout passe par des Edge Functions en service_role. On verrouille donc
-- l'accès direct : seul le superadmin peut lire via l'anon/authenticated role.
-- ---------------------------------------------------------------------------
alter table public.claim_invitations enable row level security;

drop policy if exists claim_invitations_superadmin on public.claim_invitations;
create policy claim_invitations_superadmin
  on public.claim_invitations for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

select '✅ Table claim_invitations créée' as resultat;
