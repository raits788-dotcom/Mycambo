-- ============================================================================
-- MY CAMBO — MFA (TOTP) + Role Settings
-- ============================================================================
-- Migration : 0003_mfa.sql
-- ============================================================================

-- Table user_mfa : secrets TOTP par utilisateur
create table if not exists public.user_mfa (
  user_id uuid primary key references auth.users(id) on delete cascade,
  totp_secret text not null,
  is_enabled boolean not null default false,
  is_verified boolean not null default false,
  backup_codes text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_mfa enable row level security;

create policy "user_mfa_self_all"
  on public.user_mfa for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_mfa_superadmin_read"
  on public.user_mfa for select
  to authenticated
  using (public.is_superadmin());

-- Table role_settings : politique MFA par rôle
create table if not exists public.role_settings (
  role text primary key,
  require_mfa boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.role_settings (role, require_mfa) values
  ('superadmin', true),
  ('admin', true),
  ('moderator', false),
  ('editor', false),
  ('content_manager', false),
  ('finance', true)
on conflict (role) do nothing;

alter table public.role_settings enable row level security;

create policy "role_settings_public_read"
  on public.role_settings for select
  to authenticated
  using (true);

create policy "role_settings_superadmin_all"
  on public.role_settings for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

create trigger user_mfa_updated_at before update on public.user_mfa
  for each row execute function public.set_updated_at();