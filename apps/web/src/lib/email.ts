// ═══════════════════════════════════════════════════════════
// Utilitaire d'envoi d'email via l'Edge Function Supabase
// ═══════════════════════════════════════════════════════════

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  tenant_id?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  tenant_id,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables Supabase manquantes');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ to, subject, html, tenant_id }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Erreur sendEmail:', result);
      return { success: false, error: result.error || 'Erreur d\'envoi' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur sendEmail:', error);
    return { success: false, error: String(error) };
  }
}