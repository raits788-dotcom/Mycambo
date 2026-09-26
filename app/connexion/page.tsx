'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { loginMock } from '@/lib/auth-mock';
import {
  checkLoginRateLimit,
  formatRetryAfter,
} from '@/lib/spam-protection';

export default function ConnexionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ===== Rate limiting =====
    const rateLimit = checkLoginRateLimit();
    if (!rateLimit.allowed) {
      setError(
        `Trop de tentatives. Réessayez dans ${formatRetryAfter(
          rateLimit.retryAfterMs || 0
        )}.`
      );
      return;
    }

    setLoading(true);
    const result = loginMock(form.email, form.password);

    if (!result.ok) {
      setError(result.error || 'Connexion impossible.');
      setLoading(false);
      return;
    }

    setSuccess(true);

    // ===== Redirection selon le rôle =====
    setTimeout(() => {
      if (result.user?.role === 'partner') {
        router.push('/espace-partenaire/dashboard');
      } else if (result.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/mon-compte');
      }
    }, 800);
  };

  if (success) {
    return (
      <section className="min-h-[calc(100vh-160px)] bg-gris-fond flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-2">
            Connexion réussie
          </h1>
          <p className="text-sm text-gris-texte">
            Redirection en cours...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-160px)] bg-gris-fond flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-black text-marine">my</span>
            <span className="text-2xl font-black text-marine">CAMBO</span>
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-2">
            Connexion
          </h1>
          <p className="text-sm text-gris-texte">
            Accédez à votre espace personnel.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.com"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-bold text-ink uppercase tracking-wider">
                Mot de passe
              </label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs text-marine hover:underline"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-doux hover:text-marine"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-xs text-gris-texte mt-6">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-marine font-bold hover:underline">
            Créer un compte
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-gris-ligne space-y-2">
          <p className="text-xs text-gris-texte text-center mb-2">
            Vous êtes un commerce ou une association ?
          </p>
          <Link
            href="/espace-partenaire/connexion"
            className="block text-center text-xs font-bold text-marine border border-gris-ligne rounded-full py-2.5 hover:border-marine transition-colors"
          >
            Espace partenaire →
          </Link>
        </div>
      </div>
    </section>
  );
}