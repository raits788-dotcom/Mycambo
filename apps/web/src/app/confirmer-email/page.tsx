'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import { confirmEmailMock } from '@/lib/auth-mock';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setError('Aucun token fourni.');
      return;
    }
    const result = confirmEmailMock(token);
    if (result.ok) {
      setState('ok');
    } else {
      setState('error');
      setError(result.error || 'Erreur de confirmation.');
    }
  }, [token]);

  return (
    <section className="min-h-[calc(100vh-160px)] bg-gris-fond flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {state === 'loading' && (
          <>
            <div className="text-sm text-gris-texte">Vérification...</div>
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
              Votre compte est maintenant actif. Vous pouvez vous connecter.
            </p>
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm w-full"
            >
              Se connecter
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
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm w-full"
            >
              Créer un nouveau compte
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