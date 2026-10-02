// ============================================================================
// Lecture du token d'impersonation depuis l'URL
// ============================================================================
import { createBrowserClient } from '@supabase/ssr';

let cachedTenant: any = null;

export function getImpersonateToken(): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('impersonate');
  if (token) {
    sessionStorage.setItem('mycambo_impersonate_token', token);
    // Nettoie l'URL (enlève ?impersonate=xxx)
    url.searchParams.delete('impersonate');
    window.history.replaceState({}, '', url.toString());
    return token;
  }
  return sessionStorage.getItem('mycambo_impersonate_token');
}

export async function getImpersonatedTenant(): Promise<any | null> {
  if (cachedTenant) return cachedTenant;

  const token = getImpersonateToken();
  if (!token) return null;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Récupère le tenant lié au token
  const { data: tokenData, error: tokenErr } = await supabase
    .from('impersonation_tokens')
    .select('tenant_id, expires_at, used_at, tenants(*)')
    .eq('token', token)
    .maybeSingle();

  if (tokenErr || !tokenData) {
    sessionStorage.removeItem('mycambo_impersonate_token');
    return null;
  }

  // Vérifie expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    sessionStorage.removeItem('mycambo_impersonate_token');
    return null;
  }

  cachedTenant = tokenData.tenants;
  return cachedTenant;
}

export function clearImpersonation() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('mycambo_impersonate_token');
  }
  cachedTenant = null;
}

export function isImpersonating(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem('mycambo_impersonate_token');
}