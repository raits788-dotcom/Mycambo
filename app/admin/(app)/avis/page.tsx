'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Star,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  Shield,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/user-mock';

type RefusedReview = {
  id: string;
  associationSlug: string;
  associationName: string;
  author_name: string;
  author_initial: string;
  rating: number;
  title: string;
  content: string;
  visit_type: string;
  refusedAt: string;
  refusedBy: string;
  refusalCategory: string;
  refusalReason: string;
  status: 'pending_admin' | 'validated' | 'forced';
};

const MOCK_REFUSED_REVIEWS: RefusedReview[] = [
  {
    id: 'rr1',
    associationSlug: 'pse-pour-un-sourire',
    associationName: 'PSE Pour un Sourire',
    author_name: 'Marie Dupont',
    author_initial: 'M',
    rating: 2,
    title: 'Un peu déçu',
    content:
      "Le programme de bénévolat manque de structure. Les horaires changent sans prévenir et la communication est difficile.",
    visit_type: 'Bénévolat',
    refusedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    refusedBy: 'PSE Pour un Sourire',
    refusalCategory: 'Informations erronées',
    refusalReason:
      'Cette personne n\'a jamais été bénévole chez nous. Avis non fondé.',
    status: 'pending_admin',
  },
  {
    id: 'rr2',
    associationSlug: 'green-umbrella',
    associationName: 'Green Umbrella',
    author_name: 'Paul Dubois',
    author_initial: 'P',
    rating: 3,
    title: 'Correct sans plus',
    content:
      "L'école est bien mais l'organisation laisse à désirer par moments.",
    visit_type: 'Visite',
    refusedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    refusedBy: 'Green Umbrella',
    refusalCategory: 'Autre motif',
    refusalReason: 'Le ton général est négatif sans fondement factuel.',
    status: 'pending_admin',
  },
];

type FilterType = 'all' | 'pending_admin' | 'validated' | 'forced';

export default function AdminAvisPage() {
  const [reviews, setReviews] = useState(MOCK_REFUSED_REVIEWS);
  const [filter, setFilter] = useState<FilterType>('pending_admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending_admin: reviews.filter((r) => r.status === 'pending_admin').length,
      validated: reviews.filter((r) => r.status === 'validated').length,
      forced: reviews.filter((r) => r.status === 'forced').length,
    }),
    [reviews]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  const handleValidate = (id: string) => {
    if (
      !confirm(
        'Valider le refus du partenaire ? L\'avis ne sera pas publié.'
      )
    )
      return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'validated' } : r))
    );
  };

  const handleForce = (id: string) => {
    if (
      !confirm(
        'Forcer la publication de cet avis ? Il sera visible publiquement.'
      )
    )
      return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'forced' } : r))
    );
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Modération des avis
        </h1>
        <p className="text-sm text-gris-texte">
          Arbitrez les refus de publication contestés par les partenaires.
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          <b>Rappel :</b> conformément à la charte éditoriale, tous les avis
          constructifs et respectueux doivent être publiés, positifs ou
          négatifs. Si le motif du refus n&apos;est pas suffisant, forcez la
          publication.
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterBtn
          active={filter === 'pending_admin'}
          onClick={() => setFilter('pending_admin')}
          label="À arbitrer"
          count={counts.pending_admin}
          color="text-orange-600"
          icon={<Clock size={12} />}
        />
        <FilterBtn
          active={filter === 'validated'}
          onClick={() => setFilter('validated')}
          label="Refus validés"
          count={counts.validated}
          color="text-green-600"
          icon={<Check size={12} />}
        />
        <FilterBtn
          active={filter === 'forced'}
          onClick={() => setFilter('forced')}
          label="Publiés de force"
          count={counts.forced}
          color="text-purple-600"
          icon={<AlertTriangle size={12} />}
        />
        <FilterBtn
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Tous"
          count={counts.all}
        />
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={cn(
                'bg-white rounded-lg border p-5',
                r.status === 'pending_admin'
                  ? 'border-2 border-orange-200'
                  : r.status === 'forced'
                  ? 'border-2 border-purple-200'
                  : 'border-gris-ligne'
              )}
            >
              {/* En-tête */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-marine text-white flex items-center justify-center font-bold flex-shrink-0">
                  {r.author_initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-bold text-marine text-sm">
                        {r.author_name}
                      </div>
                      <div className="text-xs text-gris-doux">
                        {timeAgo(r.refusedAt)} · {r.visit_type}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={13}
                          className={
                            n <= r.rating
                              ? 'fill-ic-or text-ic-or'
                              : 'text-gris-ligne'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu avis */}
              <div className="bg-gris-fond rounded-lg p-4 mb-4">
                <div className="text-xs text-gris-doux mb-1">
                  Avis de {r.author_name} sur <b>{r.associationName}</b>
                </div>
                <h3 className="font-bold text-marine text-sm mb-1">
                  {r.title}
                </h3>
                <p className="text-sm text-gris-texte leading-relaxed">
                  {r.content}
                </p>
              </div>

              {/* Motif du refus */}
              <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                  Motif du refus par {r.refusedBy}
                </div>
                <div className="text-xs text-orange-800 leading-relaxed">
                  <b>Catégorie :</b> {r.refusalCategory}
                  <br />
                  <b>Détail :</b> {r.refusalReason}
                </div>
              </div>

              {/* Actions */}
              {r.status === 'pending_admin' && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gris-ligne">
                  <button
                    onClick={() => handleValidate(r.id)}
                    className="text-xs font-bold bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Check size={12} />
                    Valider le refus
                  </button>
                  <button
                    onClick={() => handleForce(r.id)}
                    className="text-xs font-bold bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    <AlertTriangle size={12} />
                    Forcer la publication
                  </button>
                  <button
                    onClick={() =>
                      alert('Envoi d\'un message au partenaire pour préciser le motif.')
                    }
                    className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine transition-colors inline-flex items-center gap-1.5"
                  >
                    <MessageSquare size={12} />
                    Demander précisions
                  </button>
                </div>
              )}

              {r.status !== 'pending_admin' && (
                <div className="pt-4 border-t border-gris-ligne">
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5',
                      r.status === 'validated'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    )}
                  >
                    {r.status === 'validated' ? (
                      <>
                        <Check size={11} /> Refus validé
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={11} /> Publié par myCAMBO
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Star size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun avis à arbitrer
          </h2>
          <p className="text-sm text-gris-texte">
            Tous les refus ont été traités.
          </p>
        </div>
      )}
    </>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
  count,
  icon,
  color,
}: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs font-bold rounded-full px-4 py-2 transition-colors flex items-center gap-2 border',
        active
          ? 'bg-ink text-white border-ink'
          : 'bg-white border-gris-ligne text-gris-texte hover:border-marine'
      )}
    >
      {icon && <span className={active ? 'text-white' : color}>{icon}</span>}
      {label}
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
          active ? 'bg-white/20' : 'bg-gris-fond'
        )}
      >
        {count}
      </span>
    </button>
  );
}