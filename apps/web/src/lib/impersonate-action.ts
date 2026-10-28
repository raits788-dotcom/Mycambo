// ============================================================================
// Helper : router une opération partenaire via l'Edge Function
// impersonate-action quand un superadmin est en impersonation.
// Retourne null si on n'est PAS en impersonation (le code appelant fait alors
// son accès Supabase direct normal, couvert par la RLS).
// ============================================================================
import { getImpersonateToken } from '@/lib/impersonation';

export function isImpersonatingNow(): boolean {
  return !!getImpersonateToken();
}

export async function impersonateAction(op: string, payload?: any): Promise<any> {
  const token = getImpersonateToken();
  if (!token) throw new Error('NOT_IMPERSONATING');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/impersonate-action`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ token, op, payload }),
    }
  );
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out?.ok) {
    throw new Error(out?.error || `Échec ${op}`);
  }
  return out;
}
