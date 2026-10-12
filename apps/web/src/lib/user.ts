import { createBrowserClient } from '@supabase/ssr';

const supabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export type UserRequestType = 'donation' | 'volunteer' | 'contact' | 'contribution';

export interface UserRequest {
  id: string;
  type: UserRequestType;
  business_name: string;
  business_slug: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
}

export interface UserReview {
  id: string;
  business_name: string;
  business_slug: string;
  rating: number;
  text: string;
  status: 'pending' | 'published' | 'rejected';
  created_at: string;
}

export interface UserFavorite {
  id: string;
  business_id: string;
  business_name: string;
  business_slug: string;
  business_city: string;
  business_image: string | null;
  created_at: string;
}

export interface ProfileHistoryEntry {
  id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export const PROFILE_CHANGE_LABELS: Record<string, string> = {
  name: 'Nom',
  email: 'Email',
  phone: 'Téléphone',
  avatar: 'Photo de profil',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  declined: 'Refusée',
  completed: 'Terminée',
};

// ═══════════════════════════════════════════════════════════
// UTILISATEUR COURANT
// ═══════════════════════════════════════════════════════════

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data: { session } } = await supabase().auth.getSession();
  if (!session?.user) return null;

  const u = session.user;
  return {
    id: u.id,
    name: u.user_metadata?.name || u.email?.split('@')[0] || 'Utilisateur',
    email: u.email || '',
    avatar_url: u.user_metadata?.avatar_url,
    created_at: u.created_at,
  };
}

// ═══════════════════════════════════════════════════════════
// FAVORIS
// ═══════════════════════════════════════════════════════════

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const { data, error } = await supabase()
    .from('favorites')
    .select(`
      id, created_at, business_id,
      business:businesses!favorites_business_id_fkey(
        id, name, slug, city, photos
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getUserFavorites:', error); return []; }

  return (data || []).map((f: any) => ({
    id: f.id,
    business_id: f.business_id,
    business_name: f.business?.name || '—',
    business_slug: f.business?.slug || '',
    business_city: f.business?.city || '',
    business_image: f.business?.photos?.[0] || null,
    created_at: f.created_at,
  }));
}

export async function addFavorite(userId: string, businessId: string) {
  const { error } = await supabase()
    .from('favorites')
    .insert({ user_id: userId, business_id: businessId });
  if (error) console.error('addFavorite:', error);
}

export async function removeFavorite(userId: string, businessId: string) {
  const { error } = await supabase()
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('business_id', businessId);
  if (error) console.error('removeFavorite:', error);
}

// ═══════════════════════════════════════════════════════════
// DEMANDES (via contact_messages)
// ═══════════════════════════════════════════════════════════

export async function getUserRequests(userEmail: string): Promise<UserRequest[]> {
  const { data, error } = await supabase()
    .from('contact_messages')
    .select(`
      id, subject, message, source, status, created_at,
      business:businesses!contact_messages_business_id_fkey(name, slug)
    `)
    .eq('email', userEmail)
    .order('created_at', { ascending: false });

  if (error) { console.error('getUserRequests:', error); return []; }

  return (data || []).map((r: any) => ({
    id: r.id,
    type: (r.source || 'contact') as UserRequestType,
    business_name: r.business?.name || '—',
    business_slug: r.business?.slug || '',
    message: r.message || '',
    status: r.status === 'new' ? 'pending' : (r.status || 'pending'),
    created_at: r.created_at,
  }));
}

// ═══════════════════════════════════════════════════════════
// AVIS
// ═══════════════════════════════════════════════════════════

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  const { data, error } = await supabase()
    .from('reviews')
    .select(`
      id, rating, text, status, created_at,
      business:businesses!reviews_business_id_fkey(name, slug)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getUserReviews:', error); return []; }

  return (data || []).map((r: any) => ({
    id: r.id,
    business_name: r.business?.name || '—',
    business_slug: r.business?.slug || '',
    rating: r.rating,
    text: r.text || '',
    status: r.status,
    created_at: r.created_at,
  }));
}

// ═══════════════════════════════════════════════════════════
// COMPTEURS
// ═══════════════════════════════════════════════════════════

export async function getPendingReviewsCount(userId: string): Promise<number> {
  const { count } = await supabase()
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('status', 'pending');
  return count || 0;
}

export async function getNewRequestsCount(userEmail: string): Promise<number> {
  const { count } = await supabase()
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('email', userEmail)
    .eq('status', 'new');
  return count || 0;
}

export async function getReviewCounts(userId: string) {
  const [total, pending, published] = await Promise.all([
    supabase().from('reviews').select('*', { count: 'exact', head: true }).eq('author_id', userId),
    supabase().from('reviews').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'pending'),
    supabase().from('reviews').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'published'),
  ]);

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    published: published.count || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// HISTORIQUE PROFIL
// ═══════════════════════════════════════════════════════════

export async function getProfileHistory(userId: string): Promise<ProfileHistoryEntry[]> {
  const { data, error } = await supabase()
    .from('profile_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) { console.error('getProfileHistory:', error); return []; }
  return data || [];
}

export async function addProfileChange(
  userId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null
) {
  const { error } = await supabase()
    .from('profile_history')
    .insert({
      user_id: userId,
      field,
      old_value: oldValue,
      new_value: newValue,
    });
  if (error) console.error('addProfileChange:', error);
}

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)} j`;
  if (seconds < 2592000) return `il y a ${Math.floor(seconds / 604800)} sem`;
  if (seconds < 31536000) return `il y a ${Math.floor(seconds / 2592000)} mois`;
  return `il y a ${Math.floor(seconds / 31536000)} an${Math.floor(seconds / 31536000) > 1 ? 's' : ''}`;
}