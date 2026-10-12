'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Supabase gère automatiquement la confirmation via les magic links
      // On vérifie simplement que la session est active
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

      if (sessionErr || !session) {
        // Pas de session → probablement un vieux lien ou un token invalide
        // On regarde s'il y a un code d'erreur dans l'URL (Supabase le met souvent)
        const errCode = searchParams.get('error');
        const errDesc = searchParams.get('error_description');

        if (errCode || errDesc) {
          setState('error');
          setError(errDesc || 'Lien invalide ou expiré.');
          return;
        }

        // Sinon on considère que l'utilisateur n'a pas encore confirmé
        // → on l'invite à se connecter
        setState('error');
        setError(
          'Votre email n\'a pas encore été confirmé ou le lien a expiré. ' +
          'Vérifiez votre boîte mail ou reconnectez-vous.'
        );
        return;
      }

      // Session active → email confirmé
      setState('ok');
    })();
  }, [searchParams]);

  return (
    <section className="min-h-[calc(100vh-160px)] bg-gris-fond flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {state === 'loading' && (
          <>
            <Loader2 size={32} className="text-marine animate-spin mx-auto mb-4" />
            <div className="text-sm text-gris-texte">Vérification en cours...</div>
          </>
        )}

        {state === 'ok' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-marine mb-3">
              Email confirmé !
            </h1>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Votre compte est maintenant actif. Vous pouvez accéder à votre espace.
            </p>
            <Link
              href="/mon-compte"
              className="inline-flex items-center justify-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm w-full"
            >
              Accéder à mon compte
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-marine mb-3">
              Confirmation impossible
            </h1>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              {error}
            </p>
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm w-full"
            >
              Se connecter
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <ConfirmEmailContent />
    </Suspense>
  );
}