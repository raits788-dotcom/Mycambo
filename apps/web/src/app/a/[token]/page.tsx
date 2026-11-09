import { redirect } from 'next/navigation';

// Route COURTE /a/<token> : évite une URL longue dans les emails (les URLs
// longues sont coupées par l'encodage quoted-printable et cassent le lien).
// Redirige simplement vers la vraie page d'activation avec le token.
export default async function ShortMagicLink({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/espace-partenaire/activer?token=${encodeURIComponent(token)}`);
}
