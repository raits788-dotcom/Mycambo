'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Eye,
  Heart,
  Star,
  MapPin,
  Pause,
  Play,
  Flag,
  Clock,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPartnerEstablishments,
  getStatusConfig,
  type StoredEstablishment,
  type EstablishmentStatus,
} from '@/lib/establishment-storage';
import {
  getActiveSuspensions,
  getContentAlerts,
  getSuspensionBySlug,
  type Suspension,
  type ContentAlert,
} from '@/lib/suspensions';
import SuspendModal from '@/components/admin/establishment/SuspendModal';
import ReactivateModal from '@/components/admin/establishment/ReactivateModal';

type FilterType = 'all' | 'approved' | 'pending' | 'suspended' | 'alerts';

export default function AdminEtablissementsPage() {
  const [establishments, setEstablishments] = useState<StoredEstablishment[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [alerts, setAlerts] = useState<ContentAlert[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [mounted, setMounted] = useState(false);
  const [suspendModal, setSuspendModal] = useState<StoredEstablishment | null>(
    null
  );
  const [reactivateModal, setReactivateModal] = useState<Suspension | null>(
    null
  );

  const reload = () => {
    setEstablishments(getPartnerEstablishments());
    setSuspensions(getActiveSuspensions());
    setAlerts(getContentAlerts().filter((a) => !a.reviewed));
  };

  useEffect(() => {
    reload();
    setMounted(true);
  }, []);

  const counts = useMemo(
    () => ({
      all: establishments.length,
      approved: establishments.filter((e) => e.status === 'approved').length,
      pending: establishments.filter((e) => e.status === 'pending').length,
      suspended: suspensions.length,
      alerts: alerts.length,
    }),
    [establishments, suspensions, alerts]
  );

  const filtered = useMemo(() => {
    let list = [...establishments];

    // Les suspendus doivent être visibles dans "Tous" mais aussi dans "Suspendus"
    if (filter === 'approved')
      list = list.filter((e) => e.status === 'approved');
    if (filter === 'pending') list = list.filter((e) => e.status === 'pending');

    if (filter === 'suspended') {
      const suspendedSlugs = new Set(
        suspensions.map((s) => s.establishmentSlug)
      );
      list = list.filter((e) => suspendedSlugs.has(e.slug));
    }

    if (filter === 'alerts') {
      const alertedSlugs = new Set(alerts.map((a) => a.establishmentSlug));
      list = list.filter((e) => alertedSlugs.has(e.slug));
    }

    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [establishments, suspensions, alerts, filter]);

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
          Établissements
        </h1>
        <p className="text-sm text-gris-texte">
          Gérez, validez et modérez les fiches publiées.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Tous"
          count={counts.all}
        />
        <FilterButton
          active={filter === 'approved'}
          onClick={() => setFilter('approved')}
          label="Publiés"
          count={counts.approved}
          icon={<CheckCircle2 size={12} />}
          color="text-green-600"
        />
        <FilterButton
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
          label="À valider"
          count={counts.pending}
          icon={<Clock size={12} />}
          color="text-orange-600"
        />
        <FilterButton
          active={filter === 'suspended'}
          onClick={() => setFilter('suspended')}
          label="Suspendus"
          count={counts.suspended}
          icon={<Pause size={12} />}
          color="text-red-600"
        />
        <FilterButton
          active={filter === 'alerts'}
          onClick={() => setFilter('alerts')}
          label="Signalés"
          count={counts.alerts}
          icon={<Flag size={12} />}
          color="text-purple-600"
        />
      </div>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((e) => {
            const config = getStatusConfig(e.status as EstablishmentStatus);
            const suspension = getSuspensionBySlug(e.slug);
            const hasAlert = alerts.find((a) => a.establishmentSlug === e.slug);
            const isSuspended = !!suspension;

            return (
              <div
                key={e.slug}
                className={cn(
                  'bg-white rounded-lg border p-5 transition-shadow hover:shadow-cb-md',
                  isSuspended
                    ? 'border-2 border-red-300'
                    : hasAlert
                    ? 'border-2 border-purple-300'
                    : 'border-gris-ligne'
                )}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Icône */}
                  <div className="w-14 h-14 rounded-lg bg-gris-fond flex items-center justify-center text-2xl flex-shrink-0">
                    {e.type === 'association' && '🏫'}
                    {e.type === 'hotel' && '🏨'}
                    {e.type === 'restaurant' && '🍜'}
                    {e.type === 'activite' && '🛶'}
                    {e.type === 'boutique' && '🧵'}
                    {e.type === 'transport' && '🛺'}
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
                      {isSuspended && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 inline-flex items-center gap-1">
                          <Pause size={10} />
                          Suspendu
                        </span>
                      )}
                      {hasAlert && !isSuspended && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 inline-flex items-center gap-1">
                          <Flag size={10} />
                          Signalé
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gris-texte mb-2 flex-wrap">
                      <span>{e.typeLabel}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {e.city}
                      </span>
                    </div>

                    {/* Stats */}
                    {!isSuspended && (
                      <div className="flex items-center gap-4 text-xs text-gris-texte flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          <b className="text-marine">
                            {(e.views || 0).toLocaleString('fr-FR')}
                          </b>
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-red-500" />
                          <b className="text-marine">{e.supports || 0}</b>
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} className="fill-ic-or text-ic-or" />
                          <b className="text-marine">{e.rating || 0}</b>
                        </span>
                      </div>
                    )}

                    {/* Bandeau alerte */}
                    {hasAlert && (
                      <div className="bg-purple-50 border border-purple-200 rounded p-2.5 mt-2 text-[11px] text-purple-800 flex items-start gap-2">
                        <Flag size={12} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <b>Signalement automatique :</b> {hasAlert.message}
                        </div>
                      </div>
                    )}

                    {/* Bandeau suspension */}
                    {suspension && (
                      <div className="bg-red-50 border border-red-200 rounded p-2.5 mt-2 text-[11px] text-red-800">
                        <b>Motif :</b> {suspension.detail}
                        <br />
                        <span className="text-red-700/70">
                          Suspendu par {suspension.suspendedBy} ·{' '}
                          {new Date(suspension.suspendedAt).toLocaleDateString(
                            'fr-FR'
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {isSuspended ? (
                      <button
                        onClick={() => setReactivateModal(suspension)}
                        className="text-xs font-bold bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Play size={12} />
                        Réactiver
                      </button>
                    ) : (
                      <button
                        onClick={() => setSuspendModal(e)}
                        className="text-xs font-bold border border-red-200 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Pause size={12} />
                        Suspendre
                      </button>
                    )}

                    <a
                      href={`/commerce/${e.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine transition-colors text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <Eye size={12} />
                      Voir public
                      <ExternalLink size={10} />
                    </a>
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
          <p className="text-sm text-gris-texte">
            Aucun établissement dans cette catégorie.
          </p>
        </div>
      )}

      {/* Modales */}
      {suspendModal && (
        <SuspendModal
          establishmentSlug={suspendModal.slug}
          establishmentName={suspendModal.name}
          establishmentCity={suspendModal.city}
          onClose={() => setSuspendModal(null)}
          onConfirmed={() => {
            setSuspendModal(null);
            reload();
          }}
        />
      )}

      {reactivateModal && (
        <ReactivateModal
          suspension={reactivateModal}
          onClose={() => setReactivateModal(null)}
          onConfirmed={() => {
            setReactivateModal(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
  color?: string;
}) {
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