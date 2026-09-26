'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import RatingStars from './RatingStars';

interface ReviewRequestModalProps {
  associationName: string;
  onClose: () => void;
}

const VISIT_TYPES = ['Bénévolat', 'Don', 'Visite', 'Événement', 'Autre'];

export default function ReviewRequestModal({
  associationName,
  onClose,
}: ReviewRequestModalProps) {
  const [visitType, setVisitType] = useState('Visite');
  const [visitDate, setVisitDate] = useState('');
  const [motivation, setMotivation] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ Simulation — sera envoyé à Supabase plus tard
    console.log('Demande envoyée :', { visitType, visitDate, motivation });
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-marine" />
        </button>

        {sent ? (
          /* État : envoyé */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-ic-vert/15 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-ic-vert" />
            </div>
            <h3 className="text-xl font-extrabold text-marine mb-2">
              Demande envoyée !
            </h3>
            <p className="text-sm text-gris-texte leading-relaxed mb-6">
              Votre demande a été transmise à {associationName}.
              Vous recevrez une réponse par email sous 48h.
            </p>
            <button
              onClick={onClose}
              className="bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* Formulaire */
          <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-xl font-extrabold text-marine mb-2">
              Demander à laisser un avis
            </h3>
            <p className="text-sm text-gris-texte mb-6 leading-relaxed">
              Votre demande sera examinée par {associationName}. Si elle est
              acceptée, vous recevrez un lien pour écrire votre avis.
            </p>

            {/* Type de visite */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                Comment avez-vous connu cette association ?
              </label>
              <div className="flex flex-wrap gap-2">
                {VISIT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVisitType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      visitType === type
                        ? 'bg-marine text-white'
                        : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="mb-5">
              <label
                htmlFor="visitDate"
                className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider"
              >
                Date de votre visite
              </label>
              <input
                id="visitDate"
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>

            {/* Motivation */}
            <div className="mb-6">
              <label
                htmlFor="motivation"
                className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider"
              >
                Pourquoi souhaitez-vous laisser un avis ? *
              </label>
              <textarea
                id="motivation"
                required
                rows={3}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Décrivez brièvement votre expérience avec cette association..."
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-[1.5px] border-gris-ligne text-marine font-bold py-3 rounded-full hover:border-marine transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-marine text-white font-bold py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
              >
                Envoyer la demande
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}