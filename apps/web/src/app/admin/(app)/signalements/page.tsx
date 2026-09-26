'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Flag,
  Check,
  Eye,
  AlertTriangle,
  ShieldAlert,
  Link2,
  Users,
  MessageSquareWarning,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/user-mock';
import {
  getContentAlerts,
  markAlertReviewed,
  type ContentAlert,
} from '@/lib/suspensions';

const TYPE_CONFIG: Record<
  ContentAlert['type'],
  { label: string; icon: typeof Flag; color: string; bg: string }
> = {
  keywords: {
    label: 'Mots-clés suspects',
    icon: MessageSquareWarning,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
  links: {
    label: 'Liens suspects',
    icon: Link2,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  reports: {
    label: 'Signalements utilisateurs',
    icon: Users,
    color: 'text-orange-700',
    bg: 'bg-orange-100',
  },
  manual: {
    label: 'Signalement manuel',
    icon: ShieldAlert,
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
};

const SEVERITY_CONFIG: Record<
  ContentAlert['severity'],
  { label: string; color: string }
> = {
  low: { label: 'Faible', color: 'bg-yellow-100 text-yellow-800' },
  medium: { label: 'Moyenne', color: 'bg-orange-100 text-orange-800' },
  high: { label: 'Élevée', color: 'bg-red-100 text-red-800' },
};

type FilterType = 'all' | 'unreviewed' | 'reviewed';

export default function AdminSignalementsPage() {
  const [alerts, setAlerts] = useState<ContentAlert[]>([]);
  const [filter, setFilter] = useState<FilterType>('unreviewed');
  const [mounted, setMounted] = useState(false);

  const reload = () => {
    setAlerts(getContentAlerts());
  };

  useEffect(() => {
    reload();
    setMounted(true);
  }, []);

  const counts = useMemo(
    () => ({
      all: alerts.length,
      unreviewed: alerts.filter((a) => !a.reviewed).length,
      reviewed: alerts.filter((a) => a.reviewed).length,
    }),
    [alerts]
  );

  const filtered = useMemo(() => {
    let list = [...alerts];
    if (filter === 'unreviewed') list = list.filter((a) => !a.reviewed);
    if (filter === 'reviewed') list = list.filter((a) => a.reviewed);
    return list.sort(
      (a, b) =>
        new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
  }, [alerts, filter]);

  const handleMarkReviewed = (id: string) => {
    markAlertReviewed(id);
    reload();
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
          Signalements
        </h1>
        <p className="text-sm text-gris-texte">
          Contenus détectés automatiquement ou signalés par les utilisateurs.
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <ShieldAlert size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          <b>Détection automatique :</b> un signalement est créé lorsqu&apos;un
          partenaire modifie sa fiche avec des mots-clés suspects (promesses
          médicales, superlatifs abusifs, liens douteux) ou reçoit plusieurs
          signalements utilisateurs.
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterBtn
          active={filter === 'unreviewed'}
          onClick={() => setFilter('unreviewed')}
          label="À traiter"
          count={counts.unreviewed}
          color="text-orange-600"
          icon={<AlertTriangle size={12} />}
        />
        <FilterBtn
          active={filter === 'reviewed'}
          onClick={() => setFilter('reviewed')}
          label="Traités"
          count={counts.reviewed}
          color="text-green-600"
          icon={<Check size={12} />}
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
          {filtered.map((a) => {
            const typeConfig = TYPE_CONFIG[a.type];
            const severityConfig = SEVERITY_CONFIG[a.severity];
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={a.id}
                className={cn(
                  'bg-white rounded-lg border p-5',
                  a.reviewed
                    ? 'border-gris-ligne opacity-75'
                    : a.severity === 'high'
                    ? 'border-2 border-red-300'
                    : a.severity === 'medium'
                    ? 'border-2 border-orange-200'
                    : 'border-2 border-yellow-200'
                )}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      typeConfig.bg,
                      typeConfig.color
                    )}
                  >
                    <TypeIcon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-extrabold text-marine text-base">
                        {a.establishmentName}
                      </h3>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                          typeConfig.bg,
                          typeConfig.color
                        )}
                      >
                        {typeConfig.label}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                          severityConfig.color
                        )}
                      >
                        Gravité : {severityConfig.label}
                      </span>
                    </div>

                    <p className="text-sm text-gris-texte leading-relaxed mb-2">
                      {a.message}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-gris-doux">
                      <span>{timeAgo(a.detectedAt)}</span>
                      {a.reviewed && (
                        <>
                          <span>·</span>
                          <span className="text-green-600 font-bold">
                            <Check size={10} className="inline" /> Traité
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                      href={`/commerce/${a.establishmentSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full hover:bg-marine-dark transition-colors inline-flex items-center gap-1.5 justify-center"
                    >
                      <Eye size={12} />
                      Voir la fiche
                    </a>
                    {!a.reviewed && (
                      <button
                        onClick={() => handleMarkReviewed(a.id)}
                        className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-green-500 hover:text-green-600 transition-colors inline-flex items-center gap-1.5 justify-center"
                      >
                        <Check size={12} />
                        Marquer traité
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Flag size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucun signalement
          </h2>
          <p className="text-sm text-gris-texte">
            Aucun signalement dans cette catégorie.
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