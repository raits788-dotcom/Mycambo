'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2, CheckCircle2, Mail } from 'lucide-react';

export default function AccesPage() {
  const [stepName, setStepName] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fnUrl = (name: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`;

  const sendCode = async () => {
    setError('');
    if (!email.includes('@')) { setError('Entrez une adresse email valide.'); return; }
    setLoading(true);
    try {
      await fetch(fnUrl('request-magic-resend'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_code', email }),
      });
      // Réponse volontairement neutre : on passe à l'étape code dans tous les cas.
      setStepName('code');
    } catch {
      setError('Connexion impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    if (code.length !== 6) { setError('Le code contient 6 chiffres.'); return; }
    setLoading(true);
    try {
      const res = await fetch(fnUrl('request-magic-resend'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', email, code }),
      });
      const data = await res.json();
      if (data.ok) setStepName('done');
      else setError(messageFor(data.error));
    } catch {
      setError('Connexion impossible. Réessayez.');
    } finally {
      setLoading(false);
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
          {stepName === 'email' && (
            <>
              <h2 className="text-xl font-extrabold text-marine text-center mb-1">Recevoir un nouveau lien</h2>
              <p className="text-sm text-gris-texte text-center mb-6">
                Entrez l&apos;email de votre demande. Nous vous enverrons un code de vérification.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                  />
                </div>
                {error && <ErrorMsg msg={error} />}
                <button onClick={sendCode} disabled={loading}
                  className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />} Envoyer le code
                </button>
              </div>
            </>
          )}

          {stepName === 'code' && (
            <>
              <h2 className="text-xl font-extrabold text-marine text-center mb-1">Entrez le code</h2>
              <p className="text-sm text-gris-texte text-center mb-6">
                Si un compte existe pour <strong>{email}</strong>, un code à 6 chiffres vient d&apos;être envoyé.
              </p>
              <div className="space-y-4">
                <input
                  type="text" inputMode="numeric" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="______"
                  className="w-full text-center tracking-[0.5em] text-lg font-bold px-4 py-3 rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                />
                {error && <ErrorMsg msg={error} />}
                <button onClick={verifyCode} disabled={loading}
                  className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />} Vérifier
                </button>
                <button onClick={() => { setStepName('email'); setCode(''); setError(''); }}
                  className="w-full text-xs text-gris-texte hover:text-marine">
                  Modifier l&apos;email
                </button>
              </div>
            </>
          )}

          {stepName === 'done' && (
            <div className="text-center py-4">
              <CheckCircle2 size={30} className="text-ic-vert mx-auto mb-3" />
              <h2 className="text-lg font-extrabold text-marine mb-1">C&apos;est envoyé !</h2>
              <p className="text-sm text-gris-texte mb-5">
                Un nouveau lien d&apos;accès (valable 30 jours, usage unique) vient d&apos;être
                envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail.
              </p>
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

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />{msg}
    </div>
  );
}

function messageFor(code: string): string {
  switch (code) {
    case 'WRONG_CODE': return 'Code incorrect. Réessayez.';
    case 'EXPIRED': return 'Le code a expiré. Demandez-en un nouveau.';
    case 'NO_CODE': return 'Aucun code en attente. Renvoyez un code.';
    case 'TOO_MANY': return 'Trop de tentatives. Demandez un nouveau code.';
    case 'NOT_ELIGIBLE': return 'Ce compte est déjà activé — connectez-vous normalement.';
    default: return 'Une erreur est survenue. Réessayez.';
  }
}
