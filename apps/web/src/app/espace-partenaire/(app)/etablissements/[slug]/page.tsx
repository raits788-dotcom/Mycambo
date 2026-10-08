'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Eye, Heart, Star, MapPin, ExternalLink, Trash2, Loader2,
} from 'lucide-react';
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
  const slug = params?.slug as string;

  const [establishment, setEstablishment] = useState<StoredEstablishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const reload = async () => {
    if (!slug) return;
    setLoading(true);
    const data = await getEstablishmentBySlug(slug);
    setEstablishment(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="p-12 text-center">
        <p className="text-gris-texte mb-4">Établissement introuvable.</p>
        <Link
          href="/espace-partenaire/etablissements"
          className="text-marine font-bold hover:underline"
        >
          ← Retour à mes établissements
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(establishment.status as EstablishmentStatus);

  return (
    <>
      <Link
        href="/espace-partenaire/etablissements"
        className="inline-flex items-center gap-2 text-sm text-gris-texte hover:text-marine mb-4"
      >
        <ArrowLeft size={14} />
        Retour à mes établissements
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-xl border border-gris-ligne p-6 mb-6 shadow-cb-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-marine">
                {establishment.name}
              </h1>
              <span
                className={
                  'inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ' +
                  statusConfig.bgColor +
                  ' ' +
                  statusConfig.color
                }
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
              {establishment.categories?.name && (
                <span>{establishment.categories.name}</span>
              )}
              {establishment.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {establishment.city}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <a
              href={`/commerce/${establishment.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine"
            >
              <ExternalLink size={14} />
              Voir public
            </a>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-sm px-4 py-2.5 rounded-full hover:bg-red-50"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Eye size={14} className="text-blue-600" /> Vues
          </div>
          <div className="text-3xl font-extrabold text-marine">0</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Heart size={14} className="text-red-500" /> Soutiens
          </div>
          <div className="text-3xl font-extrabold text-marine">0</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Star size={14} className="text-yellow-500" /> Note
          </div>
          <div className="text-3xl font-extrabold text-marine">—</div>
        </div>
      </div>

      {/* Tabs */}
      <EstablishmentTabs establishment={establishment} onUpdate={reload} />

      {showDeleteModal && (
        <DeleteEstablishmentModal
          establishment={establishment}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            window.location.href = '/espace-partenaire/etablissements';
          }}
        />
      )}
    </>
  );
}