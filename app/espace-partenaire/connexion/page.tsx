'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { loginPartnerMock, getCurrentPartnerMock } from '@/lib/auth-mock';
import {
  checkLoginRateLimit,
  formatRetryAfter,
} from '@/lib/spam-protection';

export default function PartnerLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Déjà connecté ? → redirige
  useEffect(() => {
    const partner = getCurrentPartnerMock();
    if (partner) {
      router.push('/espace-partenaire/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
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
    const result = loginPartnerMock(form.email, form.password);

    if (!result.ok) {
      setError(result.error || 'Connexion impossible.');
      setLoading(false);
      return;
    }

    // Succès → redirection
    router.push('/espace-partenaire/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-black text-marine">my</span>
            <span className="text-2xl font-black text-marine">CAMBO</span>
          </Link>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-gris-doux font-bold mb-6">
            Espace partenaire
          </span>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-extrabold text-marine mb-2 text-center">
            Connexion
          </h1>
          <p className="text-sm text-gris-texte text-center mb-6">
            Accédez à votre espace de gestion
          </p>

          {/* Info démo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start gap-2">
            <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 leading-relaxed">
              <b>Démo :</b>
              <br />
              Email : <code className="bg-white px-1 rounded">sokha@greenumbrella-kh.org</code>
              <br />
              Mot de passe : <code className="bg-white px-1 rounded">demo1234</code>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@entreprise.com"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-ink uppercase tracking-wider"
                >
                  Mot de passe
                </label>
                <Link
                  href="/espace-partenaire/mot-de-passe-oublie"
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

          <div className="text-center text-xs text-gris-texte mt-6">
            Pas encore de compte partenaire ?{' '}
            <Link
              href="/partenaire/demande"
              className="text-marine font-bold hover:underline"
            >
              Faire une demande
            </Link>
          </div>
        </div>

        {/* Retour */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-gris-texte hover:text-marine transition-colors"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}