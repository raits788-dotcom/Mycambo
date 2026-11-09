'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

function ActivatePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [state, setState] = useState<'checking' | 'form' | 'invalid'>('checking');
  const [email, setEmail] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fnUrl = (name: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`;

  // Vérifie le token au chargement (sans le consommer).
  useEffect(() => {
    if (!token) { setState('invalid'); setErrorCode('INVALID'); return; }
    (async () => {
      try {
        const res = await fetch(fnUrl('activate-magic-link'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', token }),
        });
        const data = await res.json();
        if (data.ok) { setEmail(data.email); setState('form'); }
        else { setErrorCode(data.error || 'INVALID'); setState('invalid'); }
      } catch {
        setErrorCode('NETWORK'); setState('invalid');
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    setError('');
    if (pwd.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    if (pwd !== pwd2) { setError('Les deux mots de passe ne correspondent pas.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(fnUrl('activate-magic-link'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', token, password: pwd }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(messageFor(data.error));
        setSubmitting(false);
        return;
      }
      // Connecte directement avec le nouveau mot de passe.
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signInWithPassword({ email: data.email, password: pwd });
      router.push('/espace-partenaire/dashboard');
    } catch {
      setError('Une erreur est survenue. Réessayez.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gris-fond px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-marine">my CAMBO</h1>
          <p className="text-xs text-gris-doux uppercase tracking-widest mt-1">Espace partenaire</p>
        </div>

        <div className="bg-white rounded-2xl shadow-cb p-8">
          {state === 'checking' && (
            <div className="text-center py-8">
              <Loader2 size={26} className="text-marine animate-spin mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Vérification de votre lien…</p>
            </div>
          )}

          {state === 'form' && (
            <>
              <h2 className="text-xl font-extrabold text-marine text-center mb-1">Activez votre compte</h2>
              <p className="text-sm text-gris-texte text-center mb-6">
                Choisissez votre mot de passe pour <strong>{email}</strong>.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'} value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      placeholder="Au moins 8 caractères"
                      className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                    />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-doux">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gris-texte uppercase mb-1">Confirmer</label>
                  <input
                    type={show ? 'text' : 'password'} value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    placeholder="Confirmez le mot de passe"
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />{error}
                  </div>
                )}
                <button
                  onClick={handleSubmit} disabled={submitting}
                  className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Activer mon compte
                </button>
              </div>
            </>
          )}

          {state === 'invalid' && (
            <div className="text-center py-4">
              <AlertCircle size={28} className="text-ic-orange mx-auto mb-3" />
              <h2 className="text-lg font-extrabold text-marine mb-1">Lien invalide</h2>
              <p className="text-sm text-gris-texte mb-5">
                {messageFor(errorCode)}
              </p>
              <Link
                href="/espace-partenaire/acces"
                className="inline-block bg-marine text-white font-bold px-6 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-sm"
              >
                Recevoir un nouveau lien
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/espace-partenaire/connexion" className="text-sm text-gris-texte hover:text-marine">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

function messageFor(code: string): string {
  switch (code) {
    case 'EXPIRED': return 'Ce lien a expiré (valable 30 jours). Demandez-en un nouveau.';
    case 'USED': return 'Ce lien a déjà été utilisé. Demandez-en un nouveau si besoin.';
    case 'WEAK_PASSWORD': return 'Le mot de passe doit faire au moins 8 caractères.';
    case 'NETWORK': return 'Connexion impossible. Vérifiez votre réseau et réessayez.';
    default: return 'Ce lien n\'est pas valide. Demandez-en un nouveau.';
  }
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gris-fond"><Loader2 className="animate-spin text-marine" /></div>}>
      <ActivatePageInner />
    </Suspense>
  );
}
