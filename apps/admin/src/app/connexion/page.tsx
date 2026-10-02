'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { signInAdmin } from '@/lib/auth';
import { getMFASecret, verifyTOTP } from '@/lib/mfa';

type LoginStep = 'credentials' | 'mfa';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ═══════════════════════════════════════════════════════════
  // ÉTAPE 1 — Email + Mot de passe
  // ═══════════════════════════════════════════════════════════
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signInAdmin(email, password);

    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
      setLoading(false);
      return;
    }

    // ✅ Credentials OK → Vérifie si MFA activée
    const mfaData = await getMFASecret(result.user!.id);

    if (mfaData?.is_enabled && mfaData?.is_verified) {
      // MFA activée → passer à l'étape 2
      setMfaSecret(mfaData.totp_secret);
      setUserId(result.user!.id);
      setStep('mfa');
      setLoading(false);
      return;
    }

    // Pas de MFA → connexion directe
// ✅ MFA validée → accès autorisé
document.cookie = 'mycambo_admin_session=true; path=/; max-age=86400';
document.cookie = 'mycambo_mfa_verified=true; path=/; max-age=86400';
router.push(redirectTo);
  };

  // ═══════════════════════════════════════════════════════════
  // ÉTAPE 2 — Code MFA (6 chiffres)
  // ═══════════════════════════════════════════════════════════
  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mfaCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres.');
      setLoading(false);
      return;
    }

    const isValid = await verifyTOTP(mfaCode, mfaSecret);

    if (!isValid) {
      setError('Code incorrect. Vérifiez votre application d\'authentification.');
      setMfaCode('');
      setLoading(false);
      return;
    }

    // ✅ MFA validée → accès autorisé
    document.cookie = 'mycambo_admin_session=true; path=/; max-age=86400';
    document.cookie = 'mycambo_mfa_verified=true; path=/; max-age=86400';
    router.push(redirectTo);
  };

  // ═══════════════════════════════════════════════════════════
  // RETOUR à l'étape 1
  // ═══════════════════════════════════════════════════════════
  const goBack = () => {
    setStep('credentials');
    setMfaCode('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gris-fond px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-marine">myCAMBO · Console</h1>
          <p className="text-sm text-gris-texte mt-1">
            Accès réservé au personnel autorisé
          </p>
        </div>

        {/* ═══ ÉTAPE 1 — Credentials ═══ */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentials} className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
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
                  autoComplete="email"
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
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
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
        )}

        {/* ═══ ÉTAPE 2 — MFA ═══ */}
        {step === 'mfa' && (
          <form onSubmit={handleMFA} className="bg-white rounded-xl border border-gris-ligne p-6 shadow-cb-sm">
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={goBack}
                className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center text-gris-texte"
                title="Retour"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-red-600" />
                <h2 className="font-bold text-marine">Vérification MFA</h2>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                📱 Ouvrez votre application d&apos;authentification (Google Authenticator, Microsoft Authenticator, Authy...) et entrez le code à 6 chiffres.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                  Code à 6 chiffres
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-4 rounded-lg border border-gris-ligne focus:border-marine focus:outline-none text-center text-2xl font-mono tracking-widest"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Vérifier le code
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gris-ligne text-center">
              <p className="text-[11px] text-gris-doux">
                🔐 Le code change toutes les 30 secondes
              </p>
            </div>
          </form>
        )}
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