'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, Check, AlertCircle, Mail } from 'lucide-react';
import Honeypot from '@/components/auth/Honeypot';
import { checkRecaptcha } from '@/components/auth/RecaptchaV3';
import { isEmailSafe } from '@/lib/disposable-emails';
import {
  checkHoneypot,
  isFormFilledTooFast,
  checkSignupRateLimit,
  formatRetryAfter,
  HONEYPOT_FIELD_NAME,
} from '@/lib/spam-protection';
import { signupMock } from '@/lib/auth-mock';

export default function InscriptionPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    acceptCgu: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  // ===== Validation du mot de passe =====
  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    digit: /[0-9]/.test(form.password),
  };
  const passwordValid =
    passwordChecks.length && passwordChecks.upper && passwordChecks.digit;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // ===== 1. Honeypot =====
    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get(HONEYPOT_FIELD_NAME) as string;
    if (!checkHoneypot(honeypot)) {
      setError('Erreur de validation.');
      return;
    }

    // ===== 2. Validation temporelle =====
    if (isFormFilledTooFast(startTime.current)) {
      setError('Formulaire rempli trop rapidement. Merci de réessayer.');
      return;
    }

    // ===== 3. Validation email =====
    const emailCheck = isEmailSafe(form.email);
    if (!emailCheck.ok) {
      setError(emailCheck.error || 'Email invalide.');
      return;
    }

    // ===== 4. Validation mot de passe =====
    if (!passwordValid) {
      setError('Le mot de passe ne respecte pas les règles.');
      return;
    }

    // ===== 5. CGU =====
    if (!form.acceptCgu) {
      setError('Vous devez accepter les CGU et la politique de confidentialité.');
      return;
    }

    // ===== 6. Rate limiting =====
    const rateLimit = checkSignupRateLimit();
    if (!rateLimit.allowed) {
      setError(
        `Trop de tentatives. Réessayez dans ${formatRetryAfter(
          rateLimit.retryAfterMs || 0
        )}.`
      );
      return;
    }

    // ===== 7. reCAPTCHA =====
    const captcha = await checkRecaptcha('signup');
    if (!captcha.ok) {
      setError('Vérification anti-robot échouée.');
      return;
    }

    // ===== 8. Création du compte =====
    setLoading(true);
    const result = signupMock({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (!result.ok) {
      setError(result.error || 'Erreur lors de la création du compte.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // ===== Écran de confirmation email =====
  if (success) {
    return (
      <section className="min-h-[calc(100vh-160px)] bg-gris-fond flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-marine/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-marine" />
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-3">
            Vérifiez votre email
          </h1>
          <p className="text-sm text-gris-texte leading-relaxed mb-6">
            Un email de confirmation a été envoyé à{' '}
            <b className="text-marine">{form.email}</b>.
            <br />
            Cliquez sur le lien pour activer votre compte.
          </p>

          <div className="bg-gris-fond rounded-lg p-4 mb-6 text-left">
            <div className="text-xs font-bold text-marine mb-2">
              Vous ne trouvez pas l&apos;email ?
            </div>
            <ul className="text-xs text-gris-texte space-y-1">
              <li>• Vérifiez vos spams / courriers indésirables</li>
              <li>• Vérifiez l&apos;adresse saisie</li>
              <li>• Patientez quelques minutes</li>
            </ul>
          </div>

          <Link
            href="/connexion"
            className="inline-flex items-center justify-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm w-full"
          >
            Aller à la connexion
          </Link>

          <div className="mt-4 text-xs text-gris-doux">
            <b>Démo</b> : le lien de confirmation est dans la console du navigateur.
          </div>
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
            Créer un compte
          </h1>
          <p className="text-sm text-gris-texte">
            Gratuit et sécurisé. Votre email sera vérifié.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Honeypot />

          <div>
            <label htmlFor="name" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Prénom Nom"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>

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
            <label htmlFor="password" className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="8 caractères minimum"
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

            <div className="mt-2 space-y-1">
              <PasswordRule ok={passwordChecks.length} label="8 caractères minimum" />
              <PasswordRule ok={passwordChecks.upper} label="1 majuscule" />
              <PasswordRule ok={passwordChecks.digit} label="1 chiffre" />
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-gris-texte cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptCgu}
              onChange={(e) => setForm({ ...form, acceptCgu: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-marine"
            />
            <span>
              J&apos;accepte les{' '}
              <Link href="/legal/cgu" className="text-marine underline">
                CGU
              </Link>{' '}
              et la{' '}
              <Link href="/legal/confidentialite" className="text-marine underline">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-xs text-gris-texte mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-marine font-bold hover:underline">
            Se connecter
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-gris-ligne text-center">
          <p className="text-xs text-gris-texte mb-2">
            Vous êtes un commerce ?
          </p>
          <Link
            href="/partenaire"
            className="text-xs text-marine font-bold hover:underline"
          >
            Devenir partenaire →
          </Link>
        </div>
      </div>
    </section>
  );
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-green-600' : 'text-gris-doux'}`}>
      {ok ? <Check size={11} /> : <span className="w-[11px] h-[11px] inline-block">•</span>}
      <span>{label}</span>
    </div>
  );
}