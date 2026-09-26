'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Heart,
  Star,
  MapPin,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getEstablishmentBySlug,
  getStatusConfig,
  type StoredEstablishment,
  type EstablishmentStatus,
} from '@/lib/establishment-storage';
import EstablishmentTabs from '@/components/partenaire/establishment/EstablishmentTabs';
import DeleteEstablishmentModal from '@/components/partenaire/establishment/DeleteEstablishmentModal';

export default function GererEtablissementPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [establishment, setEstablishment] = useState<StoredEstablishment | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const reload = () => {
    if (slug) setEstablishment(getEstablishmentBySlug(slug));
  };

  useEffect(() => {
    if (slug) {
      setEstablishment(getEstablishmentBySlug(slug));
      setMounted(true);
    }
  }, [slug]);

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <h2 className="text-lg font-bold text-marine mb-2">
          Établissement introuvable
        </h2>
        <p className="text-sm text-gris-texte mb-6">
          Cet établissement n&apos;existe pas ou ne vous appartient pas.
        </p>
        <Link
          href="/espace-partenaire/etablissements"
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
        >
          <ArrowLeft size={14} />
          Retour à mes établissements
        </Link>
      </div>
    );
  }

  const config = getStatusConfig(establishment.status as EstablishmentStatus);
  const isApproved = establishment.status === 'approved';
  const isPending = establishment.status === 'pending';
  const isRejected = establishment.status === 'rejected';

  return (
    <>
      <Link
        href="/espace-partenaire/etablissements"
        className="inline-flex items-center gap-2 text-xs font-bold text-marine hover:underline mb-3"
      >
        <ArrowLeft size={12} />
        Retour à mes établissements
      </Link>

      {/* En-tête fiche */}
      <div className="bg-white rounded-lg border border-gris-ligne p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-lg bg-gris-fond flex items-center justify-center text-3xl flex-shrink-0">
            {establishment.type === 'association' && '🏫'}
            {establishment.type === 'hotel' && '🏨'}
            {establishment.type === 'restaurant' && '🍜'}
            {establishment.type === 'activite' && '🛶'}
            {establishment.type === 'boutique' && '🧵'}
            {establishment.type === 'transport' && '🛺'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-marine">
                {establishment.name}
              </h1>
              <span
                className={cn(
                  'text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5',
                  config.bg,
                  config.text
                )}
              >
                <i className={`fas ${config.icon}`} />
                {config.label}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                {establishment.typeLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gris-texte mb-3 flex-wrap">
              <span>{establishment.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {establishment.city}
              </span>
            </div>

            {isApproved && (
              <div className="flex items-center gap-4 text-xs text-gris-texte flex-wrap">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  <b className="text-marine">
                    {(establishment.views || 0).toLocaleString('fr-FR')}
                  </b>{' '}
                  vues
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} className="text-red-500" />
                  <b className="text-marine">{establishment.supports || 0}</b>{' '}
                  soutiens
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-ic-or text-ic-or" />
                  <b className="text-marine">{establishment.rating || 0}</b> (
                  {establishment.reviewsCount || 0} avis)
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {isApproved && (
              <a
                href={`/commerce/${establishment.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <Eye size={12} />
                Aperçu public
                <ExternalLink size={11} />
              </a>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-xs font-bold border border-red-200 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              {isApproved || isPending
                ? 'Demander la suppression'
                : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>

      {/* Bandeau statut */}
      {isPending && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <i className="fas fa-clock text-orange-600 mt-0.5" />
          <div className="text-xs text-orange-800 leading-relaxed">
            <b>En cours de validation par myCAMBO</b>
            <br />
            Votre demande est en cours d&apos;examen. Notre équipe vérifie vos
            informations sous 48h ouvrées.
          </div>
        </div>
      )}

      {isRejected && establishment.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <i className="fas fa-exclamation-triangle text-red-500 mt-0.5" />
          <div className="text-xs text-red-800 leading-relaxed">
            <b>Refusé par myCAMBO</b>
            <br />
            <b>Motif :</b> {establishment.rejectionReason}
          </div>
        </div>
      )}

      {/* Onglets */}
      <EstablishmentTabs establishment={establishment} onUpdate={reload} />

      {/* Modale de suppression */}
      {showDeleteModal && (
        <DeleteEstablishmentModal
          establishmentSlug={establishment.slug}
          establishmentName={establishment.name}
          establishmentStatus={establishment.status}
          isPublished={establishment.status === 'approved'}
          onClose={() => setShowDeleteModal(false)}
          onConfirmed={() => {
            setShowDeleteModal(false);
            router.push('/espace-partenaire/etablissements');
          }}
        />
      )}
    </>
  );
}