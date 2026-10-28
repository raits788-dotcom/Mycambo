// ============================================================================
// Projets d'association (avec promesses de don fléchées)
// ============================================================================
import { createBrowserClient } from '@supabase/ssr';
import { isImpersonatingNow, impersonateAction } from '@/lib/impersonate-action';

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface AssociationProject {
  id: string;
  business_id: string;
  tenant_id: string | null;
  title: string;
  description: string | null;
  goal_amount: number | null;
  raised_amount: number;
  currency: string;
  deadline: string | null;
  image_url: string | null;
  status: 'active' | 'completed' | 'archived';
  position: number;
  created_at: string;
  updated_at: string;
}

/** Projets actifs d'une fiche (lecture publique). */
export async function getPublicProjects(
  businessId: string
): Promise<AssociationProject[]> {
  const { data, error } = await supabase()
    .from('association_projects')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) { console.error('getPublicProjects:', error); return []; }
  return (data || []) as AssociationProject[];
}

/** Tous les projets d'une fiche (espace partenaire). */
export async function getProjects(
  businessId: string
): Promise<AssociationProject[]> {
  if (isImpersonatingNow()) {
    try {
      const out = await impersonateAction('projects_list', { business_id: businessId });
      return (out.projects || []) as AssociationProject[];
    } catch { return []; }
  }
  const { data, error } = await supabase()
    .from('association_projects')
    .select('*')
    .eq('business_id', businessId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) { console.error('getProjects:', error); return []; }
  return (data || []) as AssociationProject[];
}

export async function createProject(payload: {
  business_id: string;
  tenant_id: string | null;
  title: string;
  description?: string;
  goal_amount?: number | null;
  deadline?: string | null;
}): Promise<boolean> {
  if (isImpersonatingNow()) {
    await impersonateAction('project_create', {
      business_id: payload.business_id,
      title: payload.title,
      description: payload.description ?? null,
      goal_amount: payload.goal_amount ?? null,
      deadline: payload.deadline ?? null,
    });
    return true;
  }
  const { error } = await supabase().from('association_projects').insert({
    business_id: payload.business_id,
    tenant_id: payload.tenant_id,
    title: payload.title,
    description: payload.description || null,
    goal_amount: payload.goal_amount ?? null,
    deadline: payload.deadline || null,
  });
  if (error) { console.error('createProject:', error); throw new Error(error.message); }
  return true;
}

export async function updateProject(
  id: string,
  payload: Partial<Pick<AssociationProject, 'title' | 'description' | 'goal_amount' | 'raised_amount' | 'deadline' | 'status'>>
): Promise<boolean> {
  if (isImpersonatingNow()) {
    await impersonateAction('project_update', { id, fields: payload });
    return true;
  }
  const { data, error } = await supabase()
    .from('association_projects')
    .update(payload)
    .eq('id', id)
    .select('id');
  if (error) { console.error('updateProject:', error); throw new Error(error.message); }
  if (!data || data.length === 0) {
    throw new Error("Aucun projet modifié (droits insuffisants ?).");
  }
  return true;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isImpersonatingNow()) {
    await impersonateAction('project_delete', { id });
    return true;
  }
  const { error } = await supabase()
    .from('association_projects')
    .delete()
    .eq('id', id);
  if (error) { console.error('deleteProject:', error); throw new Error(error.message); }
  return true;
}
