'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Check, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Extraire le token de l'URL et créer la session
  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const hash = window.location.hash;

      // Si on a un token de récupération dans l'URL
      if (hash.includes('access_token=') && hash.includes('type=recovery')) {
        setIsRecovery(true);

        // Extraire le token
        const params = new URLSearchParams(hash.substring(1)); // enlève le #
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // Créer la session avec les tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError('Session expirée. Veuillez refaire la demande.');
            setLoading(false);
            return;
          }
        }
      }

      // Vérifier la session (normale ou créée par le token)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !isRecovery) {
        router.push('/espace-partenaire/connexion');
        return;
      }

      setLoading(false);
    })();
  }, [router, isRecovery]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (!/[A-Z]/.test(pwd)) return 'Le mot de passe doit contenir au moins une majuscule.';
    if (!/[a-z]/.test(pwd)) return 'Le mot de passe doit contenir au moins une minuscule.';
    if (!/[0-9]/.test(pwd)) return 'Le mot de passe doit contenir au moins un chiffre.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false },
      });

      if (updateErr) throw updateErr;

      setSuccess(true);

      setTimeout(() => {
        router.push('/espace-partenaire/dashboard');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gris-fond">
        <Loader2 size={24} className="text-marine animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gris-fond px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-3">
            Mot de passe modifié !
          </h1>
          <p className="text-sm text-gris-texte leading-relaxed mb-4">
            Votre mot de passe a bien été mis à jour. Redirection vers votre espace...
          </p>
          <Loader2 size={20} className="text-marine animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gris-fond flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-marine text-white mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-2">
            {isRecovery ? 'Réinitialisez votre mot de passe' : 'Changez votre mot de passe'}
          </h1>
          <p className="text-sm text-gris-texte">
            {isRecovery
              ? 'Définissez un nouveau mot de passe pour sécuriser votre compte.'
              : 'Pour des raisons de sécurité, vous devez changer le mot de passe temporaire avant d\'accéder à votre espace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Nouveau mot de passe *
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-doux hover:text-marine"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-gris-doux mt-1">
              Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.
            </p>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-xs font-bold text-gris-texte uppercase mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-doux hover:text-marine"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark disabled:opacity-50 transition-colors text-sm"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Modification...</>
            ) : (
              <><Check size={14} /> Enregistrer le nouveau mot de passe</>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-gris-doux mt-6">
          🔒 Votre mot de passe doit être unique et sécurisé.
        </p>
      </div>
    </div>
  );
}