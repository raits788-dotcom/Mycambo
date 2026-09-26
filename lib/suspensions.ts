// ============================================================================
// SUSPENSIONS D'ÉTABLISSEMENTS (mock — localStorage)
// ============================================================================

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

const STORAGE_KEY = 'mycambo_suspensions';

export function getSuspensions(): Suspension[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveSuspensions(): Suspension[] {
  return getSuspensions().filter((s) => s.status === 'active');
}

export function getSuspensionBySlug(slug: string): Suspension | null {
  const suspensions = getSuspensions();
  return (
    suspensions.find(
      (s) => s.establishmentSlug === slug && s.status === 'active'
    ) || null
  );
}

export function addSuspension(
  data: Omit<Suspension, 'id' | 'suspendedAt' | 'status'>
): Suspension {
  const all = getSuspensions();
  const suspension: Suspension = {
    ...data,
    id: 'susp_' + Date.now(),
    status: 'active',
    suspendedAt: new Date().toISOString(),
  };
  all.push(suspension);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return suspension;
}

export function liftSuspension(
  slug: string,
  liftedBy: string,
  liftReason: string
): boolean {
  const all = getSuspensions();
  const index = all.findIndex(
    (s) => s.establishmentSlug === slug && s.status === 'active'
  );
  if (index === -1) return false;

  all[index] = {
    ...all[index],
    status: 'lifted',
    liftedAt: new Date().toISOString(),
    liftedBy,
    liftReason,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return true;
}

// ============================================================================
// SIGNALEMENTS AUTOMATIQUES
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

const ALERTS_KEY = 'mycambo_content_alerts';

export function getContentAlerts(): ContentAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addContentAlert(
  data: Omit<ContentAlert, 'id' | 'detectedAt' | 'reviewed'>
): ContentAlert {
  const all = getContentAlerts();
  const alert: ContentAlert = {
    ...data,
    id: 'alert_' + Date.now(),
    detectedAt: new Date().toISOString(),
    reviewed: false,
  };
  all.push(alert);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(all));
  return alert;
}

export function markAlertReviewed(id: string): void {
  const all = getContentAlerts();
  const updated = all.map((a) =>
    a.id === id ? { ...a, reviewed: true } : a
  );
  localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
}