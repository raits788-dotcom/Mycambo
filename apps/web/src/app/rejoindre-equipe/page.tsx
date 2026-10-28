'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';

const FN_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ROLE_LABELS: Record<string, string> = {
  editor: 'Éditeur',
  viewer: 'Lecteur',
  owner: 'Propriétaire',
};

function supa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function JoinInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params?.get('token') || '';

  const [phase, setPhase] = useState<'loading' | 'invalid' | 'form' | 'done'>('loading');
  const [tenant, setTenant] = useState<{ name: string } | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [errorMsg, setErrorMsg] = useState('');

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setPhase('invalid');
      setErrorMsg('Lien manquant.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${FN_URL}/team-accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: ANON },
          body: JSON.stringify({ token, action: 'check' }),
        });
        const out = await res.json();
        if (!res.ok || !out?.ok) {
          setPhase('invalid');
          setErrorMsg(
            out?.error === 'LIEN_EXPIRE'
              ? 'Cette invitation a expiré.'
              : out?.error === 'LIEN_CLOS'
                ? 'Cette invitation a déjà été utilisée.'
                : 'Invitation invalide.'
          );
          return;
        }
        setTenant(out.tenant);
        setEmail(out.email);
        setRole(out.role);
        setPhase('form');
      } catch {
        setPhase('invalid');
        setErrorMsg('Impossible de vérifier le lien.');
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== password2) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${FN_URL}/team-accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON },
        body: JSON.stringify({ token, action: 'accept', password }),
      });
      const out = await res.json();
      if (!res.ok || !out?.ok) {
        setErrorMsg(out?.error || "L'acceptation a échoué.");
        setSubmitting(false);
        return;
      }
      await supa().auth.signInWithPassword({ email, password });
      setPhase('done');
      setTimeout(() => router.push('/espace-partenaire/dashboard'), 2500);
    } catch {
      setErrorMsg('Une erreur est survenue.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gris-fond flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gris-ligne shadow-cb-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-marine" size={22} />
          <h1 className="text-xl font-extrabold text-marine">Rejoindre une équipe</h1>
        </div>

        {phase === 'loading' && (
          <div className="py-12 text-center text-gris-doux">
            <Loader2 className="animate-spin mx-auto mb-3" size={26} />
            Vérification…
          </div>
        )}

        {phase === 'invalid' && (
          <div className="py-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-3" size={32} />
            <p className="text-sm text-gris-texte">{errorMsg}</p>
          </div>
        )}

        {phase === 'form' && tenant && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              Vous rejoignez <strong>{tenant.name}</strong> en tant que{' '}
              <strong>{ROLE_LABELS[role] || role}</strong>.<br />
              Compte : <strong>{email}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1.5">
                Mot de passe (8 caractères min.)
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-doux"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold bg-marine text-white px-5 py-3 rounded-full hover:bg-marine-dark disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Création…
                </>
              ) : (
                'Rejoindre l’équipe'
              )}
            </button>
          </form>
        )}

        {phase === 'done' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="text-green-500 mx-auto mb-3" size={36} />
            <p className="text-sm text-gris-texte mb-1">Bienvenue dans l’équipe !</p>
            <p className="text-xs text-gris-doux">Redirection vers votre espace…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gris-doux">
          <Loader2 className="animate-spin" size={26} />
        </div>
      }
    >
      <JoinInner />
    </Suspense>
  );
}
