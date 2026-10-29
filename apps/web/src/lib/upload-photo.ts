// ============================================================================
// Upload d'une photo dans le bucket business-photos, réutilisable (équipe,
// projets, etc.). Retourne l'URL publique, ou lève une erreur.
// Note : en impersonation, le storage peut être restreint par les policies du
// bucket. Si l'upload échoue dans ce contexte, on remonte l'erreur pour que
// l'appelant affiche un message clair.
// ============================================================================
import { createBrowserClient } from '@supabase/ssr';

export async function uploadPhoto(
  businessId: string,
  file: File,
  folder = 'misc'
): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La photo ne doit pas dépasser 5 Mo.');
  }
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${businessId}/${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('business-photos')
    .upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) {
    console.error('uploadPhoto:', error);
    throw new Error("Échec de l'envoi de la photo. " + (error.message || ''));
  }

  const { data: { publicUrl } } = supabase.storage
    .from('business-photos')
    .getPublicUrl(filename);
  return publicUrl;
}
