import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export interface TenantVerification {
  id?: string;
  tenant_id: string;
  legal_name: string | null;
  registration_number: string | null;
  legal_representative_name: string | null;
  legal_address: string | null;
  business_license_number: string | null;
  tax_number: string | null;
  photo_exterior_url: string | null;
  photo_interior_url: string | null;
  photo_id_representative_url: string | null;
  photo_business_license_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  google_maps_url: string | null;
  status: 'incomplete' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewer_notes: string | null;
  submitted_at?: string | null;
  reviewed_at: string | null;
  submission_count?: number;
  last_submitted_at?: string | null;
}

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

export async function getTenantVerification(tenantId: string): Promise<TenantVerification | null> {
  const { data, error } = await supabase()
    .from('tenant_verifications')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) {
    console.error('getTenantVerification:', error);
    return null;
  }
  return data as TenantVerification | null;
}

// ═══════════════════════════════════════════════════════════
// UPLOAD PHOTO
// ═══════════════════════════════════════════════════════════

export async function uploadVerificationPhoto(
  tenantId: string,
  file: File,
  slot: 'exterior' | 'interior' | 'id' | 'license'
): Promise<string | null> {
  const supabaseClient = supabase();

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${tenantId}/${slot}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: uploadErr } = await supabaseClient.storage
    .from('verification-docs')
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (uploadErr) {
    console.error('uploadVerificationPhoto:', uploadErr);
    return null;
  }

  const { data: { publicUrl } } = supabaseClient.storage
    .from('verification-docs')
    .getPublicUrl(filename);

  return publicUrl;
}

// ═══════════════════════════════════════════════════════════
// SOUMISSION
// ═══════════════════════════════════════════════════════════

export async function submitTenantVerification(payload: {
  tenant_id: string;
  legal_name: string;
  registration_number: string;
  legal_representative_name: string;
  legal_address: string;
  business_license_number?: string;
  tax_number?: string;
  photo_exterior_url: string;
  photo_interior_url: string;
  photo_id_representative_url?: string;
  photo_business_license_url?: string;
  website_url?: string;
  facebook_url?: string;
  google_maps_url?: string;
}) {
  const supabaseClient = supabase();

  const { data, error } = await supabaseClient.rpc('submit_tenant_verification', {
    p_tenant_id: payload.tenant_id,
    p_legal_name: payload.legal_name,
    p_registration_number: payload.registration_number,
    p_legal_representative_name: payload.legal_representative_name,
    p_legal_address: payload.legal_address,
    p_business_license_number: payload.business_license_number || null,
    p_tax_number: payload.tax_number || null,
    p_photo_exterior_url: payload.photo_exterior_url,
    p_photo_interior_url: payload.photo_interior_url,
    p_photo_id_representative_url: payload.photo_id_representative_url || null,
    p_photo_business_license_url: payload.photo_business_license_url || null,
    p_website_url: payload.website_url || null,
    p_facebook_url: payload.facebook_url || null,
    p_google_maps_url: payload.google_maps_url || null,
  });

  if (error) throw error;

  // Notification email à l'admin (non bloquant)
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-admin-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ tenant_id: payload.tenant_id }),
        }
      );
    }
  } catch (notifyErr) {
    console.warn('Notification email échouée:', notifyErr);
  }

  return data;
}