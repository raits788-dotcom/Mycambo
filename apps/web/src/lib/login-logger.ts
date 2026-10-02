// ═══════════════════════════════════════════════════════════
// Utilitaire de logging des connexions
// ═══════════════════════════════════════════════════════════
import { createBrowserClient } from '@supabase/ssr';

interface LogLoginParams {
  userId?: string | null;
  email: string;
  role?: string | null;
  status: 'success' | 'failed' | 'mfa_required' | 'mfa_failed' | 'logout';
  failureReason?: string;
}

function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  if (/mac/i.test(ua)) return 'Mac';
  if (/windows/i.test(ua)) return 'Windows';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Desktop';
}

export async function logLogin({
  userId,
  email,
  role,
  status,
  failureReason,
}: LogLoginParams) {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from('login_logs').insert({
      user_id: userId || null,
      email: email,
      role: role || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      device: getDeviceInfo(),
      status: status,
      failure_reason: failureReason || null,
    });
  } catch (err) {
    // Silent fail — ne bloque pas la connexion si le log échoue
    console.error('logLogin error:', err);
  }
}