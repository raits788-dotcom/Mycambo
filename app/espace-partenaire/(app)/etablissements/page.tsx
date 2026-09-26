'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Heart,
  Star,
  Building2,
  Info,
  MapPin,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPartnerEstablishments,
  getStatusConfig,
  type StoredEstablishment,
  type EstablishmentStatus,
} from '@/lib/establishment-storage';

export default function EtablissementsPage() {
  const [establishments, setEstablishments] = useState<StoredEstablishment[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEstablishments(getPartnerEstablishments());
    setMounted(true);
  }, []);

  const pendingCount = establishments.filter(
    (e) => e.status === 'pending'
  ).length;

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Mes établissements
          </h1>
          <p className="text-sm text-gris-texte">
            {establishments.length} établissement
            {establishments.length > 1 ? 's' : ''} sous votre compte
            {pendingCount > 0 && (
              <>
                {' · '}
                <span className="text-orange-600 font-bold">
                  {pendingCount} en attente de validation
                </span>
              </>
            )}
          </p>
        </div>

        <Link
          href="/espace-partenaire/etablissements/nouveau"
          className="inline-flex items-center gap-2 bg-marine text-white font-bold px-4 py-2.5 rounded-full hover:bg-marine-dark transition-colors text-sm"
        >
          <Plus size={14} />
          Ajouter un établissement
        </Link>
      </div>

      {/* Liste */}
      {establishments.length > 0 ? (
        <div className="space-y-3">
          {establishments.map((e) => {
            const config = getStatusConfig(e.status as EstablishmentStatus);
            const isPending = e.status === 'pending';
            const isRejected = e.status === 'rejected';

            return (
              <div
                key={e.slug}
                className={cn(
                  'bg-white rounded-lg border p-5 transition-shadow hover:shadow-cb-md',
                  isPending && 'border-2 border-orange-200',
                  isRejected && 'border-2 border-red-200',
                  !isPending && !isRejected && 'border-gris-ligne'
                )}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Icône */}
                  <div className="w-16 h-16 rounded-lg bg-gris-fond flex items-center justify-center text-2xl flex-shrink-0">
                    {e.type === 'association' && '🏫'}
                    {e.type === 'hotel' && '🏨'}
                    {e.type === 'restaurant' && '🍜'}
                    {e.type === 'activite' && '🛶'}
                    {e.type === 'boutique' && '🧵'}
                    {e.type === 'transport' && '🛺'}
                    {!['association', 'hotel', 'restaurant', 'activite', 'boutique', 'transport'].includes(e.type) && '🏢'}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-extrabold text-marine text-base">
                        {e.name}
                      </h3>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5',
                          config.bg,
                          config.text
                        )}
                      >
                        <i className={`fas ${config.icon}`} />
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gris-texte mb-2 flex-wrap">
                      <span>{e.typeLabel}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {e.city}
                      </span>
                    </div>

                    {/* Stats (cachées si en attente) */}
                    {!isPending && !isRejected && (
                      <div className="flex items-center gap-4 text-xs text-gris-texte flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          <b className="text-marine">
                            {(e.views || 0).toLocaleString('fr-FR')}
                          </b>{' '}
                          vues
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-red-500" />
                          <b className="text-marine">{e.supports || 0}</b>{' '}
                          soutiens
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} className="fill-ic-or text-ic-or" />
                          <b className="text-marine">{e.rating || 0}</b> (
                          {e.reviewsCount || 0} avis)
                        </span>
                      </div>
                    )}

                    {/* Bandeau "En attente" */}
                    {isPending && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                        <div className="text-xs text-orange-800 flex items-start gap-2">
                          <Clock size={13} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <b>En cours de validation par myCAMBO</b>
                            <br />
                            Votre demande a été reçue. Notre équipe vérifie vos
                            informations sous 48h ouvrées.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bandeau "Refusé" */}
                    {isRejected && e.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <div className="text-xs text-red-800 flex items-start gap-2">
                          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <b>Motif du refus :</b>
                            <br />
                            {e.rejectionReason}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {isPending ? (
                      <Link
                        href={`/espace-partenaire/etablissements/${e.slug}`}
                        className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine transition-colors text-center whitespace-nowrap"
                      >
                        Voir ma demande
                      </Link>
                    ) : isRejected ? (
                      <Link
                        href={`/espace-partenaire/etablissements/${e.slug}`}
                        className="text-xs font-bold bg-khmer text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors text-center whitespace-nowrap"
                      >
                        Corriger et renvoyer
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={`/espace-partenaire/etablissements/${e.slug}`}
                          className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full hover:bg-marine-dark transition-colors text-center whitespace-nowrap"
                        >
                          Gérer
                        </Link>
                        <a
  href={`/commerce/${e.slug}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine transition-colors text-center whitespace-nowrap inline-flex items-center justify-center gap-1"
>
  Voir public
  <ExternalLink size={10} />
</a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Building2 size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun établissement
          </h2>
          <p className="text-sm text-gris-texte mb-6">
            Créez votre premier établissement pour commencer.
          </p>
          <Link
            href="/espace-partenaire/etablissements/nouveau"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            <Plus size={14} />
            Créer mon premier établissement
          </Link>
        </div>
      )}

      {/* Info multi-établissements */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          <b>Plusieurs établissements ?</b> Vous pouvez gérer plusieurs commerces
          avec un seul compte (selon votre formule).
          <Link
            href="/partenaire/formules"
            className="underline ml-1 font-bold"
          >
            Voir les formules →
          </Link>
        </div>
      </div>
    </>
  );
}