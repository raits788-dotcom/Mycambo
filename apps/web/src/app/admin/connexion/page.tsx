'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Shield, Info } from 'lucide-react';
import { loginAdminMock, getCurrentAdmin } from '@/lib/admin-mock';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const admin = getCurrentAdmin();
    if (admin) router.push('/admin/dashboard');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = loginAdminMock(form.email, form.password);
    if (!result.ok) {
      setError(result.error || 'Connexion impossible.');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Console d&apos;administration
          </h1>
          <p className="text-sm text-white/60">
            Accès réservé à l&apos;équipe myCAMBO
          </p>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Info démo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start gap-2">
            <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 leading-relaxed">
              <b>Démo :</b>
              <br />
              Email :{' '}
              <code className="bg-white px-1 rounded">admin@mycambo.app</code>
              <br />
              Mot de passe :{' '}
              <code className="bg-white px-1 rounded">admin1234</code>
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
                placeholder="admin@mycambo.app"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
              className="w-full bg-ink text-white font-bold py-3 rounded-full hover:bg-marine transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}