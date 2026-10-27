// ============================================================================
// SUSPENSIONS D'ÉTABLISSEMENTS (Supabase)
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

const sb = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export type SuspensionReason =
  | 'inappropriate_photos'
  | 'hateful_content'
  | 'false_advertising'
  | 'unauthorized_change'
  | 'user_reports'
  | 'other';

export const SUSPENSION_REASONS: Record<
  SuspensionReason,
  { label: string; description: string }
> = {
  inappropriate_photos: {
    label: 'Photos inappropriées',
    description: 'Contenu visuel non conforme à la charte',
  },
  hateful_content: {
    label: 'Contenu offensant / haineux',
    description: 'Propos discriminatoires, insultes',
  },
  false_advertising: {
    label: 'Publicité mensongère',
    description: 'Fausses informations, promesses non tenues',
  },
  unauthorized_change: {
    label: 'Modification non autorisée',
    description: 'Champs verrouillés modifiés sans validation',
  },
  user_reports: {
    label: 'Signalements utilisateurs',
    description: 'Plusieurs signalements reçus',
  },
  other: {
    label: 'Autre motif',
    description: 'Précisez ci-dessous',
  },
};

export type Suspension = {
  id: string;
  establishmentSlug: string;
  establishmentName: string;
  reason: SuspensionReason;
  customReason?: string;
  detail: string;
  suspendedBy: string;       // Nom de l'admin
  suspendedAt: string;
  tenantNotified: boolean;
  status: 'active' | 'lifted';
  liftedAt?: string;
  liftedBy?: string;
  liftReason?: string;
};

// ----------------------------------------------------------------------------
// Mapping colonnes Supabase (snake_case) -> type de retour (camelCase).
// La table `suspensions` : id, business_id, tenant_id, reason, custom_reason,
// detail, suspended_by, active bool, created_at, lifted_at.
// Certains champs historiques (establishmentName, tenantNotified, liftedBy,
// liftReason) ne sont pas stockés : on les laisse vides/par défaut pour
// conserver la MÊME forme de retour.
// ----------------------------------------------------------------------------
type SuspensionRow = {
  id: string;
  business_id: string | null;
  tenant_id: string | null;
  reason: SuspensionReason;
  custom_reason: string | null;
  detail: string | null;
  suspended_by: string | null;
  active: boolean;
  created_at: string;
  lifted_at: string | null;
};

function mapSuspension(row: SuspensionRow): Suspension {
  return {
    id: row.id,
    establishmentSlug: row.business_id ?? '',
    establishmentName: '',
    reason: row.reason,
    customReason: row.custom_reason ?? undefined,
    detail: row.detail ?? '',
    suspendedBy: row.suspended_by ?? '',
    suspendedAt: row.created_at,
    tenantNotified: false,
    status: row.active ? 'active' : 'lifted',
    liftedAt: row.lifted_at ?? undefined,
    liftedBy: undefined,
    liftReason: undefined,
  };
}

export async function getSuspensions(): Promise<Suspension[]> {
  const { data, error } = await sb()
    .from('suspensions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as SuspensionRow[]).map(mapSuspension);
}

export async function getActiveSuspensions(): Promise<Suspension[]> {
  const { data, error } = await sb()
    .from('suspensions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as SuspensionRow[]).map(mapSuspension);
}

// NOTE: filtre désormais par business_id (passez un businessId).
export async function getSuspensionBySlug(
  businessId: string
): Promise<Suspension | null> {
  const { data, error } = await sb()
    .from('suspensions')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return mapSuspension(data[0] as SuspensionRow);
}

export async function addSuspension(
  data: Omit<Suspension, 'id' | 'suspendedAt' | 'status'>
): Promise<Suspension> {
  const { data: inserted, error } = await sb()
    .from('suspensions')
    .insert({
      business_id: data.establishmentSlug,
      reason: data.reason,
      custom_reason: data.customReason ?? null,
      detail: data.detail,
      suspended_by: data.suspendedBy,
      active: true,
    })
    .select('*')
    .single();
  if (error || !inserted) {
    throw error ?? new Error('Insertion suspension échouée');
  }
  return mapSuspension(inserted as SuspensionRow);
}

export async function liftSuspension(id: string): Promise<boolean> {
  const { error } = await sb()
    .from('suspensions')
    .update({ active: false, lifted_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

// ============================================================================
// SIGNALEMENTS AUTOMATIQUES (table suspension_alerts)
// ============================================================================

export type ContentAlert = {
  id: string;
  establishmentSlug: string;
  establishmentName: string;
  type: 'keywords' | 'links' | 'reports' | 'manual';
  message: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
  reviewed: boolean;
};

// ----------------------------------------------------------------------------
// Table `suspension_alerts` : id, business_id, type, message, resolved bool,
// created_at. Les champs historiques establishmentName et severity ne sont pas
// stockés : valeurs par défaut pour conserver la MÊME forme de retour.
// ----------------------------------------------------------------------------
type ContentAlertRow = {
  id: string;
  business_id: string | null;
  type: ContentAlert['type'];
  message: string | null;
  resolved: boolean;
  created_at: string;
};

function mapAlert(row: ContentAlertRow): ContentAlert {
  return {
    id: row.id,
    establishmentSlug: row.business_id ?? '',
    establishmentName: '',
    type: row.type,
    message: row.message ?? '',
    severity: 'low',
    detectedAt: row.created_at,
    reviewed: row.resolved,
  };
}

export async function getContentAlerts(): Promise<ContentAlert[]> {
  const { data, error } = await sb()
    .from('suspension_alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as ContentAlertRow[]).map(mapAlert);
}

export async function addContentAlert(
  data: Omit<ContentAlert, 'id' | 'detectedAt' | 'reviewed'>
): Promise<ContentAlert> {
  const { data: inserted, error } = await sb()
    .from('suspension_alerts')
    .insert({
      business_id: data.establishmentSlug,
      type: data.type,
      message: data.message,
      resolved: false,
    })
    .select('*')
    .single();
  if (error || !inserted) {
    throw error ?? new Error('Insertion suspension_alert échouée');
  }
  return mapAlert(inserted as ContentAlertRow);
}

export async function markAlertReviewed(id: string): Promise<void> {
  await sb()
    .from('suspension_alerts')
    .update({ resolved: true })
    .eq('id', id);
}
