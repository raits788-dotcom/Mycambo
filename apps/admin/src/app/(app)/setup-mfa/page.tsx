'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Check, AlertCircle, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { generateMFASecret, verifyTOTP, enableMFA, getMFASecret } from '@/lib/mfa';

export default function SetupMFAPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/connexion');
        return;
      }
      setUser(user);

      // Vérifie si la MFA est déjà activée
      const existing = await getMFASecret(user.id);
      if (existing?.is_enabled && existing?.is_verified) {
        setAlreadyEnabled(true);
        setLoading(false);
        return;
      }

      // Génère un nouveau secret
      const { secret: newSecret, qrCodeDataUrl } = await generateMFASecret(
        user.email || 'user@mycambo.net'
      );
      setSecret(newSecret);
      setQrCode(qrCodeDataUrl);
      setLoading(false);
    })();
  }, [router]);

  const handleVerify = async () => {
    setError('');
    setVerifying(true);

const isValid = await verifyTOTP(token, secret);

    if (!isValid) {
      setError('Code incorrect. Vérifiez votre application.');
      setVerifying(false);
      return;
    }

    try {
      await enableMFA(user.id, secret);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Erreur lors de l\'activation. Réessayez.');
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    alert('Secret copié !');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="text-marine animate-spin" />
      </div>
    );
  }

  if (alreadyEnabled) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Check size={32} className="text-green-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-marine mb-2">
            MFA déjà activée
          </h2>
          <p className="text-sm text-gris-texte mb-4">
            Votre compte est déjà protégé par la double authentification.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm font-bold text-marine hover:underline"
          >
            Retour au tableau de bord →
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Check size={32} className="text-green-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-marine mb-2">
            MFA activée !
          </h2>
          <p className="text-sm text-gris-texte">
            Votre compte est maintenant sécurisé. Redirection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-red-600" />
          <h1 className="text-2xl font-extrabold text-marine">
            Activer la double authentification
          </h1>
        </div>
        <p className="text-sm text-gris-texte">
          Sécurisez votre compte admin avec Google Authenticator ou Authy.
        </p>
      </div>

      <div className="bg-white border border-gris-ligne rounded-xl p-6 space-y-6">
        {/* Étape 1 — Scanner le QR code */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-marine text-white flex items-center justify-center text-xs font-bold">1</span>
            <span className="font-bold text-marine">Scannez ce QR code</span>
          </div>
          <p className="text-xs text-gris-texte mb-4 ml-8">
            Ouvrez Google Authenticator (ou Authy) et scannez ce code.
          </p>
          <div className="flex justify-center bg-white border border-gris-ligne rounded-lg p-4">
            {qrCode && (
              <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
            )}
          </div>
        </div>

        {/* Étape 2 — Code manuel */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-marine text-white flex items-center justify-center text-xs font-bold">2</span>
            <span className="font-bold text-marine">Ou entrez le code manuellement</span>
          </div>
          <div className="flex items-center gap-2 ml-8">
            <code className="flex-1 bg-gris-fond px-3 py-2 rounded-lg text-xs font-mono text-marine break-all">
              {secret}
            </code>
            <button
              onClick={copySecret}
              className="w-9 h-9 rounded-lg bg-gris-fond hover:bg-gris-ligne flex items-center justify-center"
              title="Copier le secret"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Étape 3 — Vérifier */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-marine text-white flex items-center justify-center text-xs font-bold">3</span>
            <span className="font-bold text-marine">Entrez le code à 6 chiffres</span>
          </div>
          <div className="ml-8 space-y-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest focus:border-marine focus:outline-none"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-red-700">{error}</span>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || token.length !== 6}
              className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Shield size={14} />
                  Activer la MFA
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}