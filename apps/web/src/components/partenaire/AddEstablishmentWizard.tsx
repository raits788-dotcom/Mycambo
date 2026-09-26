'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Send, AlertCircle, Check } from 'lucide-react';
import WizardStep1Type from './wizard/WizardStep1Type';
import WizardStep2Infos from './wizard/WizardStep2Infos';
import WizardStep3Location from './wizard/WizardStep3Location';
import WizardStep4Legal from './wizard/WizardStep4Legal';
import {
  WIZARD_INITIAL_DATA,
  validateStep,
  type WizardData,
  type EstablishmentType,
} from '@/lib/establishment-wizard';

const STEP_LABELS = [
  'Type',
  'Informations',
  'Localisation',
  'Légal & Photos',
];
import {
  addEstablishment,
  generateSlug,
} from '@/lib/establishment-storage';
import { ESTABLISHMENT_TYPES } from '@/lib/establishment-wizard';

export default function AddEstablishmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(WIZARD_INITIAL_DATA);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors([]);
  };

  const handleNext = () => {
    const result = validateStep(step, data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    setErrors([]);
  };

  const handleSubmit = () => {
    const result = validateStep(4, data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);

    // ===== Enregistrement dans localStorage =====
    try {
      const slug = generateSlug(data.name);
      const typeInfo = ESTABLISHMENT_TYPES[data.type as EstablishmentType];

      // Récupère les URLs des photos
      const photos: string[] = [];
      Object.values(data.photos).forEach((p) => {
        if (p) photos.push(p.url);
      });

      addEstablishment({
        slug,
        name: data.name,
        type: data.type,
        typeLabel: typeInfo.label,
        category: data.category,
        city: data.city,
        address: data.address,
        phone: '',
        email: '',
        website: data.website,
        hours: '',
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        status: 'pending',
        rating: 0,
        reviewsCount: 0,
        views: 0,
        supports: 0,
        photosCount: photos.length,
        photosLimit: 5,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        photos,
        documents: data.documents.map((d) => ({
          name: d.name,
          url: d.url,
          size: d.size,
        })),
      });

      console.log('📤 Établissement enregistré :', data);
    } catch (err) {
      console.error('Erreur enregistrement :', err);
      setErrors(['Une erreur est survenue lors de l\'enregistrement.']);
      setSubmitting(false);
      return;
    }

    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 600);
  };

  // ===== Écran de succès =====
  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-marine mb-3">
          Demande envoyée !
        </h2>
        <p className="text-sm text-gris-texte leading-relaxed mb-6">
          Votre demande de référencement a bien été transmise à l&apos;équipe
          myCAMBO.
          <br />
          Vous recevrez une réponse par email sous <b>48h ouvrées</b>.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <div className="text-xs text-blue-800 leading-relaxed">
            <b>Que se passe-t-il ensuite ?</b>
            <ol className="mt-2 space-y-1 list-decimal pl-4">
              <li>Notre équipe vérifie vos informations et documents.</li>
              <li>
                Si tout est validé, vous pourrez souscrire à une formule
                d&apos;abonnement.
              </li>
              <li>Après paiement, votre établissement sera publié.</li>
            </ol>
          </div>
        </div>

        <button
          onClick={() => router.push('/espace-partenaire/etablissements')}
          className="bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
        >
          Retour à mes établissements
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Étapes */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < step;
          const isCurrent = stepNum === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-marine text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isDone ? <Check size={14} /> : stepNum}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isDone || isCurrent ? 'text-marine' : 'text-gris-doux'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`w-8 h-px ${
                    isDone ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        {step === 1 && (
          <WizardStep1Type
            value={data.type}
            onChange={(type) => updateData({ type, category: '' })}
          />
        )}
        {step === 2 && (
          <WizardStep2Infos data={data} onChange={updateData} />
        )}
        {step === 3 && (
          <WizardStep3Location data={data} onChange={updateData} />
        )}
        {step === 4 && (
          <WizardStep4Legal data={data} onChange={updateData} />
        )}
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="font-bold text-red-700 text-sm">
              Merci de corriger :
            </div>
          </div>
          <ul className="text-xs text-red-700 space-y-1 list-disc pl-8">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 1}
          className="inline-flex items-center gap-2 text-sm font-bold border border-gris-ligne text-marine px-5 py-3 rounded-full hover:border-marine transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} />
          Précédent
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 text-sm font-bold bg-marine text-white px-6 py-3 rounded-full hover:bg-marine-dark transition-colors"
          >
            Continuer
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm font-bold bg-marine text-white px-6 py-3 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
          >
            {submitting ? (
              'Envoi...'
            ) : (
              <>
                <Send size={14} />
                Envoyer ma demande
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}