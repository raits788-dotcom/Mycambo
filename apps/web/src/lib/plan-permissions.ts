// ============================================================================
// Permissions par formule
// ============================================================================

export type PlanSlug = 'decouverte' | 'essentiel' | 'pro' | 'business' | 'entreprise' | 'association';

export interface PlanPermissions {
  canShowPhotos: boolean;
  canShowDescription: boolean;
  canShowHours: boolean;
  canShowSocialLinks: boolean;
  canShowStats: boolean;
  canBeFeatured: boolean;
  canShowBanner: boolean;
  canUseMessaging: boolean;
  maxPhotos: number;
  maxEstablishments: number;
  // ===== Permissions d'INTERACTION (ce que le public peut faire sur la fiche) =====
  canReceiveMessages: boolean;      // bouton Contact actif
  canReceiveReservations: boolean;  // réservation hôtel / restaurant
  canPublishOffers: boolean;        // offres du moment visibles
  canReceiveApplications: boolean;  // candidatures emploi / bénévolat
}

// Valeurs d'interaction par défaut selon qu'une formule est "active" ou "bridée".
const INTERACTIONS_OFF = {
  canReceiveMessages: false,
  canReceiveReservations: false,
  canPublishOffers: false,
  canReceiveApplications: false,
};

export const PLAN_PERMISSIONS: Record<PlanSlug, PlanPermissions> = {
  decouverte: {
    canShowPhotos: false,
    canShowDescription: false,
    canShowHours: false,
    canShowSocialLinks: false,
    canShowStats: false,
    canBeFeatured: false,
    canShowBanner: false,
    canUseMessaging: false,
    maxPhotos: 0,
    maxEstablishments: 1,
    canReceiveMessages: false, canReceiveReservations: false, canPublishOffers: false, canReceiveApplications: false,
  },
  essentiel: {
    canShowPhotos: true,
    canShowDescription: true,
    canShowHours: true,
    canShowSocialLinks: true,
    canShowStats: true,
    canBeFeatured: false,
    canShowBanner: false,
    canUseMessaging: true,
    maxPhotos: 20,
    maxEstablishments: 1,
    canReceiveMessages: true, canReceiveReservations: false, canPublishOffers: false, canReceiveApplications: false,
  },
  pro: {
    canShowPhotos: true,
    canShowDescription: true,
    canShowHours: true,
    canShowSocialLinks: true,
    canShowStats: true,
    canBeFeatured: true,
    canShowBanner: false,
    canUseMessaging: true,
    maxPhotos: 999,
    maxEstablishments: 3,
    canReceiveMessages: true, canReceiveReservations: true, canPublishOffers: false, canReceiveApplications: true,
  },
  business: {
    canShowPhotos: true,
    canShowDescription: true,
    canShowHours: true,
    canShowSocialLinks: true,
    canShowStats: true,
    canBeFeatured: true,
    canShowBanner: true,
    canUseMessaging: true,
    maxPhotos: 999,
    maxEstablishments: 10,
    canReceiveMessages: true, canReceiveReservations: true, canPublishOffers: true, canReceiveApplications: true,
  },
  entreprise: {
    canShowPhotos: true,
    canShowDescription: true,
    canShowHours: true,
    canShowSocialLinks: true,
    canShowStats: true,
    canBeFeatured: true,
    canShowBanner: true,
    canUseMessaging: true,
    maxPhotos: 999,
    maxEstablishments: 999,
    canReceiveMessages: true, canReceiveReservations: true, canPublishOffers: true, canReceiveApplications: true,
  },
  association: {
    canShowPhotos: true,
    canShowDescription: true,
    canShowHours: true,
    canShowSocialLinks: true,
    canShowStats: true,
    canBeFeatured: false,
    canShowBanner: false,
    canUseMessaging: true,
    maxPhotos: 10,
    maxEstablishments: 3,
    canReceiveMessages: true, canReceiveReservations: false, canPublishOffers: false, canReceiveApplications: true,
  },
};

export function getPlanPermissions(planSlug: string | null | undefined): PlanPermissions {
  const slug = (planSlug || 'decouverte') as PlanSlug;
  return PLAN_PERMISSIONS[slug] || PLAN_PERMISSIONS.decouverte;
}
// ============================================================================
// Version pilotée par la base : lit la colonne `permissions` de `plans`.
// Les valeurs en dur ci-dessus servent désormais UNIQUEMENT de filet de
// sécurité (fallback) si la base ne renvoie rien. Pour changer ce qu'offre
// une formule, on modifie la base — plus le code.
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

// Cache mémoire léger pour éviter de requêter à chaque fiche.
let _cache: Record<string, PlanPermissions> | null = null;

export async function getPlanPermissionsFromDB(
  planSlug: string | null | undefined
): Promise<PlanPermissions> {
  const slug = (planSlug || 'decouverte') as PlanSlug;

  if (!_cache) {
    try {
      const sb = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await sb.from('plans').select('slug, permissions');
      _cache = {};
      for (const row of data || []) {
        if (row.permissions && Object.keys(row.permissions).length > 0) {
          _cache[row.slug] = row.permissions as PlanPermissions;
        }
      }
    } catch {
      _cache = {};
    }
  }

  // base → sinon fallback sur les valeurs en dur → sinon Découverte
  return _cache[slug] || PLAN_PERMISSIONS[slug] || PLAN_PERMISSIONS.decouverte;
}

// Vide le cache (utile après une modif des formules dans la console admin).
export function clearPlanPermissionsCache(): void {
  _cache = null;
}
