// ============================================================================
// Lecture du token d'impersonation depuis l'URL
// ============================================================================
import { createBrowserClient } from '@supabase/ssr';

export function getImpersonateToken(): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('impersonate');
  if (token) {
    // Écrase TOUJOURS l'ancien token
    sessionStorage.setItem('mycambo_impersonate_token', token);
    // Nettoie l'URL
    url.searchParams.delete('impersonate');
    window.history.replaceState({}, '', url.toString());
    return token;
  }
  return sessionStorage.getItem('mycambo_impersonate_token');
}

export async function getImpersonatedTenant(): Promise<any | null> {
  const token = getImpersonateToken();
  if (!token) return null;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: tokenData, error: tokenErr } = await supabase
    .from('impersonation_tokens')
    .select('tenant_id, expires_at, used_at, tenants(*)')
    .eq('token', token)
    .maybeSingle();

  if (tokenErr || !tokenData) {
    sessionStorage.removeItem('mycambo_impersonate_token');
    return null;
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    sessionStorage.removeItem('mycambo_impersonate_token');
    return null;
  }

  return tokenData.tenants;
}

export function clearImpersonation() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('mycambo_impersonate_token');
  }
}

export function isImpersonating(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem('mycambo_impersonate_token');
}