'use client';

import { useState } from 'react';
import { X, Star, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moderateReviewContent } from '@/lib/review-moderation';

interface WriteReviewModalProps {
  associationName: string;
  associationSlug: string;
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    title: string;
    content: string;
  }) => void;
}

export default function WriteReviewModal({
  associationName,
  onClose,
  onSubmit,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 5) {
      setError('Le titre doit contenir au moins 5 caractères.');
      return;
    }
    if (content.trim().length < 20) {
      setError('Le contenu doit contenir au moins 20 caractères.');
      return;
    }

    // ===== Modération automatique =====
    const moderation = moderateReviewContent(title, content);
    if (!moderation.ok) {
      setError(
        `Votre avis contient des propos inappropriés : ${moderation.reason}`
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onSubmit({ rating, title, content });
      setSubmitting(false);
    }, 500);
  };

  const displayRating = hoveredStar || rating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-5">
            <Star size={26} className="text-purple-600" />
          </div>

          <h3 className="text-2xl font-extrabold text-marine mb-2">
            Écrire votre avis
          </h3>
          <p className="text-sm text-gris-texte leading-relaxed mb-6">
            Partagez votre expérience sur{' '}
            <b className="text-marine">{associationName}</b>.
          </p>

          {/* Note */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Votre note *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={32}
                    className={cn(
                      star <= displayRating
                        ? 'fill-ic-or text-ic-or'
                        : 'text-gris-ligne'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div className="mb-5">
            <label
              htmlFor="title"
              className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider"
            >
              Titre *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Super expérience"
              maxLength={80}
              required
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
          </div>

          {/* Contenu */}
          <div className="mb-5">
            <label
              htmlFor="content"
              className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider"
            >
              Votre expérience *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre expérience : ce qui vous a plu, ce qui pourrait être amélioré..."
              rows={6}
              maxLength={2000}
              required
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors resize-none"
            />
            <div className="text-[10px] text-gris-doux mt-1 text-right">
              {content.length}/2000
            </div>
          </div>

          {/* Avertissement modération */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-blue-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-blue-800 leading-relaxed">
              Votre avis sera examiné par l&apos;association avant
              publication. Les propos inappropriés seront automatiquement
              rejetés.
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-bold border border-gris-ligne text-marine rounded-full py-3 hover:border-marine transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-marine text-white font-bold rounded-full py-3 hover:bg-marine-dark transition-colors text-sm disabled:opacity-60"
            >
              {submitting ? (
                'Envoi...'
              ) : (
                <>
                  <Check size={14} />
                  Publier mon avis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}