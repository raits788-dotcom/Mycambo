'use client';

import { useState } from 'react';
import { Shield, Check, Loader2, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import type { WizardData } from '../page';

interface Props {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export default function Step5Verification({ data, updateData }: Props) {
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = async () => {
    if (!data.email) {
      setError('Veuillez renseigner votre email à l\'étape 1.');
      return;
    }

    setSending(true);
    setError('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-verification-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email }),
        }
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Erreur d\'envoi');
      }

      setCodeSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-email-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, code }),
        }
      );

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Code invalide');
      }

      updateData({ email_verified: true });
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-marine flex items-center gap-2 mb-1">
          <Shield size={18} /> Vérification
        </h2>
        <p className="text-xs text-gris-texte">
          Vérifiez votre email et acceptez les conditions pour finaliser votre demande.
        </p>
      </div>

      {/* Bloc vérification email */}
      <div className="bg-gris-fond rounded-lg p-4 border border-gris-ligne">
        <h3 className="font-bold text-marine text-sm mb-3 flex items-center gap-2">
          <Mail size={14} /> Vérification de votre email
        </h3>

        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="text-gris-texte">Email :</span>
          <b className="text-marine">{data.email || '(non renseigné)'}</b>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <span className="text-xs text-green-800 font-bold">
              Email vérifié avec succès !
            </span>
          </div>
        ) : !codeSent ? (
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending || !data.email}
            className="w-full flex items-center justify-center gap-2 bg-marine text-white font-bold py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-50 text-xs"
          >
            {sending ? (
              <><Loader2 size={14} className="animate-spin" /> Envoi en cours...</>
            ) : (
              <><Mail size={14} /> Envoyer le code de vérification</>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gris-texte">
              Code envoyé à <b className="text-marine">{data.email}</b>. Il expire dans 15 minutes.
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="flex-1 px-4 py-3 text-center text-xl font-mono tracking-widest rounded-lg border border-gris-ligne focus:border-marine focus:outline-none bg-white"
                autoFocus
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifying || code.length !== 6}
                className="flex items-center gap-2 bg-marine text-white font-bold px-5 rounded-lg hover:bg-marine-dark transition-colors disabled:opacity-50"
              >
                {verifying ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending}
              className="flex items-center gap-1 text-xs text-marine hover:underline"
            >
              <RefreshCw size={11} /> Renvoyer le code
            </button>
          </div>
        )}
      </div>

      {/* Bloc acceptation CGU */}
      <div className="bg-gris-fond rounded-lg p-4 border border-gris-ligne">
        <h3 className="font-bold text-marine text-sm mb-3">📋 Conditions générales</h3>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.accepts_terms}
            onChange={(e) => updateData({ accepts_terms: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-marine"
          />
          <span className="text-xs text-gris-texte leading-relaxed">
            J&apos;accepte les{' '}
            <a href="/legal/cgu" target="_blank" className="text-marine font-bold hover:underline">
              conditions générales d&apos;utilisation
            </a>{' '}
            et la{' '}
            <a href="/legal/confidentialite" target="_blank" className="text-marine font-bold hover:underline">
              politique de confidentialité
            </a>{' '}
            de MyCambo. Je certifie que les informations fournies sont exactes.
          </span>
        </label>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}

      {/* Récap */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 text-sm mb-3">📋 Récapitulatif</h3>
        <ul className="space-y-1.5 text-xs text-blue-800">
          <li className="flex items-center gap-2">
            {data.legal_name ? <Check size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-red-500" />}
            Entreprise : {data.legal_name || 'non renseigné'}
          </li>
          <li className="flex items-center gap-2">
            {data.establishments.length > 0 && data.establishments.every((e) => e.name) ? <Check size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-red-500" />}
            Établissements : {data.establishments.length} déclaré(s)
          </li>
          <li className="flex items-center gap-2">
            {data.photo_exterior_url && data.photo_interior_url ? <Check size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-red-500" />}
            Photos obligatoires : {data.photo_exterior_url && data.photo_interior_url ? 'fournies' : 'manquantes'}
          </li>
          <li className="flex items-center gap-2">
            {data.motivation.length >= 50 ? <Check size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-red-500" />}
            Motivation : {data.motivation.length} caractères
          </li>
          <li className="flex items-center gap-2">
            {data.email_verified ? <Check size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-red-500" />}
            Email : {data.email_verified ? 'vérifié' : 'non vérifié'}
          </li>
          <li className="flex items-center gap-2">
            {data.accepts_terms ? <Check size={12} className="text-green-600" /> : <AlertCircle size={12} className="text-red-500" />}
            CGU : {data.accepts_terms ? 'acceptées' : 'non acceptées'}
          </li>
        </ul>
      </div>
    </div>
  );
}