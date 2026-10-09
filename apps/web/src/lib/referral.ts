import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

export async function getMyReferralCode(tenantId: string) {
  const { data } = await supabase()
    .from('referral_codes')
    .select('code')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  return data?.code || null;
}

export async function getMyReferrals(tenantId: string) {
  const { data } = await supabase()
    .from('referrals')
    .select(`
      *,
      referred:tenants!referrals_referred_tenant_id_fkey(name, email, created_at)
    `)
    .eq('referrer_tenant_id', tenantId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getReferralTiers() {
  const { data } = await supabase()
    .from('referral_tiers')
    .select('*')
    .eq('is_active', true)
    .order('tier_order');
  return data || [];
}

export async function getReferralSettings() {
  const { data } = await supabase()
    .from('referral_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  return data || { enabled: true, referee_discount_percent: 10 };
}

// ═══════════════════════════════════════════════════════════
// INSCRIPTION — Capture du code parrain
// ═══════════════════════════════════════════════════════════

export async function getReferrerByCode(code: string) {
  const { data } = await supabase()
    .from('referral_codes')
    .select('tenant_id, tenants(id, name)')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  return data;
}

export async function saveReferral(params: {
  code: string;
  referredTenantId: string;
}) {
  const referrer = await getReferrerByCode(params.code);
  if (!referrer) return { success: false, error: 'CODE_NOT_FOUND' };
  if (referrer.tenant_id === params.referredTenantId) {
    return { success: false, error: 'SELF_REFERRAL' };
  }

  const { error } = await supabase()
    .from('referrals')
    .insert({
      referrer_tenant_id: referrer.tenant_id,
      referred_tenant_id: params.referredTenantId,
      code: params.code.toUpperCase(),
      status: 'pending',
    });

  if (error) {
    console.error('saveReferral:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export function getStoredRefCode(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('mycambo_ref_code');
}

export function storeRefCode(code: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mycambo_ref_code', code.toUpperCase());
  }
}