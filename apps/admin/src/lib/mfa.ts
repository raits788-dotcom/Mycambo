// ═══════════════════════════════════════════════════════════
// MFA (2FA) — Utilitaires TOTP
// Version avec imports dynamiques pour compatibilité Next.js
// ═══════════════════════════════════════════════════════════
import { createClient } from './supabase';

// ═══════════════════════════════════════════════════════════
// Import dynamique des modules CommonJS
// ═══════════════════════════════════════════════════════════
async function getAuthenticator(): Promise<any> {
  const mod: any = await import('otplib');
  // otplib exporte authenticator en défaut OU en named
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

  // 1. Générer le secret
  const secret = authenticator.generateSecret();

  // 2. Générer l'URI otpauth MANUELLEMENT (sans keyuri)
  const issuer = 'MyCambo';
  const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  // 3. Générer le QR code
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return { secret, qrCodeDataUrl };
}

// ═══════════════════════════════════════════════════════════
// VÉRIFICATION — Code TOTP
// ═══════════════════════════════════════════════════════════
export async function verifyTOTP(token: string, secret: string): Promise<boolean> {
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
  const supabase = createClient();

  const { error } = await supabase
    .from('user_mfa')
    .upsert({
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
  const supabase = createClient();

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
  const supabase = createClient();

  const { data, error } = await supabase
    .from('role_settings')
    .select('require_mfa')
    .eq('role', role)
    .maybeSingle();

  if (error || !data) return false;
  return data.require_mfa === true;
}