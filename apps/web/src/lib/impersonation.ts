// ============================================================================
// Lecture du token d'impersonation depuis l'URL
// ============================================================================
import { createBrowserClient } from '@supabase/ssr';

const TOKEN_KEY = 'mycambo_impersonate_token';

export function getImpersonateToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Récupère le token depuis l'URL (sans modifier l'URL tout de suite)
  const url = new URL(window.location.href);
  const urlToken = url.searchParams.get('impersonate');

  if (urlToken) {
    // Stocke D'ABORD
    sessionStorage.setItem(TOKEN_KEY, urlToken);
    return urlToken;
  }

  // 2. Sinon, récupère depuis la session
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Nettoie l'URL en enlevant ?impersonate=xxx
 * À appeler UNIQUEMENT quand on est sûr d'avoir fini de lire le token
 */
export function cleanImpersonateParamFromUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.has('impersonate')) {
    url.searchParams.delete('impersonate');
    window.history.replaceState({}, '', url.toString());
  }
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
    sessionStorage.removeItem(TOKEN_KEY);
    return null;
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    sessionStorage.removeItem(TOKEN_KEY);
    return null;
  }

  // ✅ Nettoie l'URL seulement APRÈS avoir validé le token
  cleanImpersonateParamFromUrl();

  return tokenData.tenants;
}

export function clearImpersonation() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function isImpersonating(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(TOKEN_KEY);
}