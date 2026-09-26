'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Flag,
  Pause,
  Star,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getActiveSuspensions,
  getContentAlerts,
} from '@/lib/suspensions';
import {
  getPartnerEstablishments,
} from '@/lib/establishment-storage';
import { timeAgo } from '@/lib/user-mock';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalEstablishments: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    alerts: 0,
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [suspensions, setSuspensions] = useState<any[]>([]);

  useEffect(() => {
    const establishments = getPartnerEstablishments();
    const activeSuspensions = getActiveSuspensions();
    const contentAlerts = getContentAlerts();

    setStats({
      totalEstablishments: establishments.length,
      pending: establishments.filter((e) => e.status === 'pending').length,
      approved: establishments.filter((e) => e.status === 'approved').length,
      suspended: activeSuspensions.length,
      alerts: contentAlerts.filter((a) => !a.reviewed).length,
    });

    setAlerts(contentAlerts.filter((a) => !a.reviewed).slice(0, 3));
    setSuspensions(activeSuspensions.slice(0, 3));
    setMounted(true);
  }, []);

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
          Vue d&apos;ensemble
        </h1>
        <p className="text-sm text-gris-texte">
          État de la plateforme myCAMBO.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <KpiCard
          icon={<Building2 size={14} />}
          label="Établissements"
          value={stats.totalEstablishments}
          color="text-marine"
        />
        <KpiCard
          icon={<AlertTriangle size={14} />}
          label="À valider"
          value={stats.pending}
          color="text-orange-600"
        />
        <KpiCard
          icon={<Check size={14} />}
          label="Publiés"
          value={stats.approved}
          color="text-green-600"
        />
        <KpiCard
          icon={<Pause size={14} />}
          label="Suspendus"
          value={stats.suspended}
          color="text-red-600"
        />
        <KpiCard
          icon={<Flag size={14} />}
          label="Signalements"
          value={stats.alerts}
          color="text-purple-600"
        />
      </div>

      {/* Signalements automatiques */}
      <div className="bg-white rounded-lg border border-gris-ligne mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-purple-600" />
            <h2 className="font-bold text-marine">Signalements automatiques</h2>
            {stats.alerts > 0 && (
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {stats.alerts}
              </span>
            )}
          </div>
          <Link
            href="/admin/etablissements"
            className="text-xs font-bold text-marine hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {alerts.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="px-5 py-4 flex items-center gap-4 flex-wrap"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    alert.severity === 'high'
                      ? 'bg-red-100 text-red-600'
                      : alert.severity === 'medium'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  <Flag size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-marine truncate">
                    {alert.establishmentName}
                  </div>
                  <div className="text-xs text-gris-texte line-clamp-1">
                    {alert.message}
                  </div>
                  <div className="text-[10px] text-gris-doux mt-0.5">
                    {timeAgo(alert.detectedAt)}
                  </div>
                </div>
                <Link
                  href="/admin/etablissements"
                  className="text-xs font-bold bg-marine text-white px-4 py-2 rounded-full hover:bg-marine-dark transition-colors"
                >
                  Examiner
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucun signalement en attente.
          </div>
        )}
      </div>

      {/* Suspendus récents */}
      <div className="bg-white rounded-lg border border-gris-ligne mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gris-ligne flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pause size={16} className="text-red-600" />
            <h2 className="font-bold text-marine">Fiches suspendues récentes</h2>
          </div>
          <Link
            href="/admin/etablissements?filter=suspended"
            className="text-xs font-bold text-marine hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {suspensions.length > 0 ? (
          <div className="divide-y divide-gris-ligne">
            {suspensions.map((susp) => (
              <div
                key={susp.id}
                className="px-5 py-4 flex items-center gap-4 flex-wrap"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <Pause size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-marine truncate">
                    {susp.establishmentName}
                  </div>
                  <div className="text-xs text-gris-texte line-clamp-1">
                    {susp.detail}
                  </div>
                  <div className="text-[10px] text-gris-doux mt-0.5">
                    Suspendu par {susp.suspendedBy} · {timeAgo(susp.suspendedAt)}
                  </div>
                </div>
                <Link
                  href={`/admin/etablissements?filter=suspended`}
                  className="text-xs font-bold border border-gris-ligne text-marine px-4 py-2 rounded-full hover:border-marine transition-colors"
                >
                  Gérer
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gris-texte">
            Aucune suspension active.
          </div>
        )}
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickLink
          icon={<Building2 size={20} />}
          title="Gérer les établissements"
          description="Validez, suspendez ou réactivez les fiches."
          href="/admin/etablissements"
        />
        <QuickLink
          icon={<Star size={20} />}
          title="Modération des avis"
          description="Examinez les avis refusés par les partenaires."
          href="/admin/avis"
        />
        <QuickLink
          icon={<TrendingUp size={20} />}
          title="Statistiques plateforme"
          description="Vue globale de l'activité."
          href="/admin/dashboard"
        />
      </div>
    </>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gris-ligne p-4">
      <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
        <span className={color}>{icon}</span>
        {label}
      </div>
      <div className="text-2xl font-extrabold text-marine">{value}</div>
    </div>
  );
}

function QuickLink({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-gris-ligne p-5 hover:border-marine hover:shadow-cb-md transition-all group"
    >
      <div className="w-11 h-11 rounded-lg bg-marine/10 text-marine flex items-center justify-center mb-4 group-hover:bg-marine group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="font-bold text-marine text-sm mb-1">{title}</div>
      <div className="text-xs text-gris-texte leading-relaxed">
        {description}
      </div>
    </Link>
  );
}