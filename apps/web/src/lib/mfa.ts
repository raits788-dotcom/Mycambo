// ═══════════════════════════════════════════════════════════
// MFA (2FA) — Utilitaires TOTP pour l'app web
// ═══════════════════════════════════════════════════════════
import { createBrowserClient } from '@supabase/ssr';

// Client Supabase local
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ═══════════════════════════════════════════════════════════
// Import dynamique (compatibilité CommonJS/ESM)
// ═══════════════════════════════════════════════════════════
async function getAuthenticator(): Promise<any> {
  const mod: any = await import('otplib');
  return mod.authenticator || mod.default?.authenticator || mod.default || mod;
}

async function getQRCode(): Promise<any> {
  const mod: any = await import('qrcode');
  return mod.default || mod;
}

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION — Secret TOTP + QR code
// ═══════════════════════════════════════════════════════════
export async function generateMFASecret(email: string) {
  const authenticator = await getAuthenticator();
  const QRCode = await getQRCode();

  const secret = authenticator.generateSecret();

  // Construction manuelle de l'URI otpauth (indépendant de la version d'otplib)
  const issuer = 'MyCambo';
  const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    email
  )}?secret=${secret}&issuer=${encodeURIComponent(
    issuer
  )}&algorithm=SHA1&digits=6&period=30`;

  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return { secret, qrCodeDataUrl };
}

// ═══════════════════════════════════════════════════════════
// VÉRIFICATION — Code TOTP
// ═══════════════════════════════════════════════════════════
export async function verifyTOTP(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const authenticator = await getAuthenticator();
    return authenticator.verify({ token, secret });
  } catch (err) {
    console.error('verifyTOTP error:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// ACTIVATION — Sauvegarde du secret pour l'utilisateur
// ═══════════════════════════════════════════════════════════
export async function enableMFA(userId: string, secret: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from('user_mfa').upsert({
    user_id: userId,
    totp_secret: secret,
    is_enabled: true,
    is_verified: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('enableMFA error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// LECTURE — Secret MFA d'un utilisateur
// ═══════════════════════════════════════════════════════════
export async function getMFASecret(userId: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_mfa')
    .select('totp_secret, is_enabled, is_verified')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getMFASecret error:', error);
    return null;
  }
  return data;
}

// ═══════════════════════════════════════════════════════════
// CONFIG — Vérifie si un rôle exige la MFA
// ═══════════════════════════════════════════════════════════
export async function roleRequiresMFA(role: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('role_settings')
    .select('require_mfa')
    .eq('role', role)
    .maybeSingle();

  if (error || !data) return false;
  return data.require_mfa === true;
}