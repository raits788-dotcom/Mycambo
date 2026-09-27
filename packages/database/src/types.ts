/**
 * Types TypeScript pour les tables Supabase de My Cambo.
 * À compléter au fur et à mesure qu'on ajoute des tables.
 */

export type TenantStatus = 'pending' | 'active' | 'suspended';
export type BusinessStatus = 'pending' | 'approved' | 'suspended';
export type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'past_due';
export type PaymentMethod = 'aba' | 'wing' | 'bakong' | 'stripe';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string | null;
  plan_id: string | null;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  photos: string[] | null;
  status: BusinessStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number | null;
  currency: 'USD' | 'KHR';
  max_businesses: number;
  features: Record<string, unknown>;
  trial_days: number;
  position: number;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  tenant_id: string;
  amount: number;
  currency: 'USD' | 'KHR';
  method: PaymentMethod;
  gateway_ref: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface PartnerRequest {
  id: string;
  company_name: string;
  email: string;
  category: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}
