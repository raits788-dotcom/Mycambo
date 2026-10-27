-- ============================================================================
-- 0013 — PARAMÈTRES PLATEFORME (clé/valeur)
-- ============================================================================
-- Réglages globaux éditables sans toucher au code : coordonnées de virement,
-- email de contact, etc. Lecture publique (pour afficher les coordonnées de
-- paiement au partenaire), écriture superadmin.
-- ============================================================================

create table if not exists public.platform_settings (
  key text primary key,
  value text,
  label text,
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;
drop policy if exists platform_settings_read on public.platform_settings;
create policy platform_settings_read on public.platform_settings for select using (true);
drop policy if exists platform_settings_write on public.platform_settings;
create policy platform_settings_write on public.platform_settings for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Valeurs par défaut (à personnaliser dans la console superadmin)
insert into public.platform_settings (key, value, label) values
  ('payment_beneficiary', 'myCAMBO', 'Bénéficiaire du virement'),
  ('payment_aba',         '',        'Compte ABA'),
  ('payment_wing',        '',        'Compte Wing'),
  ('payment_instructions','Effectuez votre virement puis indiquez la référence. Votre établissement sera mis en ligne dès validation.', 'Instructions de paiement'),
  ('contact_email',       'contact@mycambo.net', 'Email de contact')
on conflict (key) do nothing;

select '0013 — platform_settings créée' as resultat;
