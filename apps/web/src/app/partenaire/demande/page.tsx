'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import WizardProgress from './components/WizardProgress';
import Step1Company from './components/Step1Company';
import Step2Establishments from './components/Step2Establishments';
import Step3Photos from './components/Step3Photos';
import Step4Motivation from './components/Step4Motivation';
import Step5Verification from './components/Step5Verification';

export interface WizardData {
  // Étape 1
  structure_type: string;
  registration_authority: string;
  legal_name: string;
  registration_number: string;
  legal_representative_name: string;
  legal_representative_phone: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  website_url: string;
  facebook_url: string;
  google_maps_url: string;

  // Étape 2
  establishments: { name: string; address: string; city: string }[];

  // Étape 3
  photo_exterior_url: string;
  photo_interior_url: string;
  photo_representative_id_url: string;

  // Étape 4
  motivation: string;
  how_found_us: string;

  // Étape 5
  accepts_terms: boolean;
  email_verified: boolean;
}

const INITIAL_DATA: WizardData = {
  structure_type: '',
  registration_authority: '',
  legal_name: '',
  registration_number: '',
  legal_representative_name: '',
  legal_representative_phone: '',
  email: '',
  phone: '',
  category: '',
  city: '',
  website_url: '',
  facebook_url: '',
  google_maps_url: '',
  establishments: [{ name: '', address: '', city: '' }],
  photo_exterior_url: '',
  photo_interior_url: '',
  photo_representative_id_url: '',
  motivation: '',
  how_found_us: '',
  accepts_terms: false,
  email_verified: false,
};

export default function PartnerRequestWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const TOTAL_STEPS = 5;

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canGoNext = (): boolean => {
    if (step === 1) {
      // N° d'enregistrement requis uniquement pour company + ngo
      const requiresReg = data.structure_type === 'company' || data.structure_type === 'ngo';
      return !!(
        data.structure_type &&
        data.legal_name &&
        (!requiresReg || data.registration_number) &&
        data.legal_representative_name &&
        data.legal_representative_phone &&
        data.email &&
        data.category &&
        data.city
      );
    }
    if (step === 2) {
      return data.establishments.every((e) => e.name && e.city);
    }
    if (step === 3) {
      return !!(data.photo_exterior_url && data.photo_interior_url);
    }
    if (step === 4) {
      return data.motivation.length >= 50;
    }
    if (step === 5) {
      return data.accepts_terms && data.email_verified;
    }
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS && canGoNext()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!canGoNext()) return;
    setSubmitting(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: requestId, error } = await supabase.rpc('submit_partner_request', {
        p_company_name: data.legal_name,
        p_email: data.email,
        p_phone: data.phone || data.legal_representative_phone,
        p_city: data.city,
        p_category: data.category,
        p_structure_type: data.structure_type,
        p_registration_authority: data.registration_authority || null,
        p_legal_name: data.legal_name,
        p_registration_number: data.registration_number || null,
        p_legal_representative_name: data.legal_representative_name,
        p_legal_representative_phone: data.legal_representative_phone,
        p_establishment_type: data.category,
        p_establishment_count: data.establishments.length,
        p_establishments: data.establishments,
        p_website_url: data.website_url || null,
        p_facebook_url: data.facebook_url || null,
        p_google_maps_url: data.google_maps_url || null,
        p_photo_exterior_url: data.photo_exterior_url,
        p_photo_interior_url: data.photo_interior_url,
        p_photo_representative_id_url: data.photo_representative_id_url || null,
        p_motivation: data.motivation,
        p_how_found_us: data.how_found_us || null,
        p_accepts_terms: data.accepts_terms,
      });

      if (error) throw error;

      // Notifie l'admin
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-admin-new-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: requestId }),
        }
      );

      setSubmitted(true);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-[calc(100vh-160px)] bg-gris-fond flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-marine mb-3">
            Demande envoyée !
          </h1>
          <p className="text-sm text-gris-texte leading-relaxed mb-6">
            Merci pour votre intérêt. Notre équipe va examiner votre dossier
            sous <b>48h ouvrées</b>. Vous recevrez un email dès qu'une décision
            sera prise.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-xs text-blue-800">
              <b>Prochaines étapes :</b>
              <br />
              1. Vérification de votre dossier par l&apos;équipe MyCambo
              <br />
              2. Email d&apos;approbation avec lien pour créer votre compte
              <br />
              3. Choix d&apos;une formule d&apos;abonnement
              <br />
              4. Création de vos établissements
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm w-full"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gris-fond min-h-[calc(100vh-160px)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-2">
            Devenir partenaire MyCambo
          </h1>
          <p className="text-sm text-gris-texte">
            Remplissez ce formulaire pour rejoindre l&apos;annuaire. Cela prend
            environ 5 minutes.
          </p>
        </div>

        {/* Barre de progression */}
        <WizardProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {step === 1 && <Step1Company data={data} updateData={updateData} />}
          {step === 2 && <Step2Establishments data={data} updateData={updateData} />}
          {step === 3 && <Step3Photos data={data} updateData={updateData} />}
          {step === 4 && <Step4Motivation data={data} updateData={updateData} />}
          {step === 5 && <Step5Verification data={data} updateData={updateData} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm font-bold border border-gris-ligne text-marine px-5 py-3 rounded-full hover:border-marine transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} />
            Précédent
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 text-sm font-bold bg-marine text-white px-6 py-3 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Étape suivante
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canGoNext() || submitting}
              className="flex items-center gap-2 text-sm font-bold bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Envoyer ma demande
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}