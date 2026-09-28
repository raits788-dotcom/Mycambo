'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Store, CreditCard, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { getDashboardStats } from '@/lib/services';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Vue d&apos;ensemble</h1>
        <p className="text-sm text-gris-texte">État global de la plateforme myCAMBO.</p>
      </div>

      {loading || !stats ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
          <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
          <p className="text-sm text-gris-texte">Chargement...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-3"><Building2 size={14} className="text-blue-600" />Partenaires actifs</div>
              <div className="text-3xl font-extrabold text-marine">{stats.tenantsActive}</div>
              <div className="text-xs text-gris-texte mt-1">sur {stats.tenantsTotal} au total</div>
            </div>
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-3"><Store size={14} className="text-green-600" />Établissements</div>
              <div className="text-3xl font-extrabold text-marine">{stats.businessesTotal}</div>
            </div>
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-3"><CreditCard size={14} className="text-purple-600" />Abonnements actifs</div>
              <div className="text-3xl font-extrabold text-marine">{stats.subscriptionsActive}</div>
            </div>
            <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
              <div className="flex items-center gap-2 text-xs text-gris-texte mb-3"><TrendingUp size={14} className="text-orange-600" />CA du mois</div>
              <div className="text-3xl font-extrabold text-marine">{stats.monthlyRevenue} $</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tenants" className="bg-white rounded-xl border border-gris-ligne p-5 hover:border-marine hover:shadow-cb-md transition-all group">
              <div className="w-11 h-11 rounded-lg bg-marine/10 text-marine flex items-center justify-center mb-4 group-hover:bg-marine group-hover:text-white transition-colors"><Building2 size={20} /></div>
              <div className="font-bold text-marine text-sm mb-1">Gérer les tenants</div>
              <div className="text-xs text-gris-texte">Voir, activer, impersonate</div>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-marine font-bold">Ouvrir <ArrowRight size={11} /></div>
            </Link>
            <Link href="/abonnements" className="bg-white rounded-xl border border-gris-ligne p-5 hover:border-marine hover:shadow-cb-md transition-all group">
              <div className="w-11 h-11 rounded-lg bg-marine/10 text-marine flex items-center justify-center mb-4 group-hover:bg-marine group-hover:text-white transition-colors"><CreditCard size={20} /></div>
              <div className="font-bold text-marine text-sm mb-1">Suivre les abonnements</div>
              <div className="text-xs text-gris-texte">MRR, ARR, relances</div>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-marine font-bold">Ouvrir <ArrowRight size={11} /></div>
            </Link>
            <Link href="/etablissements" className="bg-white rounded-xl border border-gris-ligne p-5 hover:border-marine hover:shadow-cb-md transition-all group">
              <div className="w-11 h-11 rounded-lg bg-marine/10 text-marine flex items-center justify-center mb-4 group-hover:bg-marine group-hover:text-white transition-colors"><Store size={20} /></div>
              <div className="font-bold text-marine text-sm mb-1">Modérer les établissements</div>
              <div className="text-xs text-gris-texte">Valider, mettre en avant</div>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-marine font-bold">Ouvrir <ArrowRight size={11} /></div>
            </Link>
          </div>
        </>
      )}
    </>
  );
}