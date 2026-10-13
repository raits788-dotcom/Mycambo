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
}

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
  },
};

export function getPlanPermissions(planSlug: string | null | undefined): PlanPermissions {
  const slug = (planSlug || 'decouverte') as PlanSlug;
  return PLAN_PERMISSIONS[slug] || PLAN_PERMISSIONS.decouverte;
}