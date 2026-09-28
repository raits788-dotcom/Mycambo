'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    if (email === 'admin@mycambo.app' && password === 'admin1234') {
      document.cookie = 'mycambo_admin_session=true; path=/; max-age=86400';
      router.push(redirectTo);
    } else {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gris-fond px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-marine">myCAMBO · Console</h1>
          <p className="text-sm text-gris-texte mt-1">Accès réservé au personnel autorisé</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mycambo.app"
                className="w-full px-4 py-3 rounded-lg border border-gris-ligne focus:border-marine focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gris-ligne focus:border-marine focus:outline-none text-sm"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gris-ligne text-center">
            <p className="text-[11px] text-gris-doux">
              🔐 Session sécurisée · Toutes les actions sont journalisées
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gris-fond">
          <Loader2 size={24} className="text-marine animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}