'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Star, Inbox, ArrowRight, Loader2, Bell } from 'lucide-react';
import { getImpersonatedTenant } from '@/lib/impersonation';
import { PlanUpgradeBanner } from '@/components/partenaire/PlanUpgradeBanner';

export default function PartnerDashboardPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [planName, setPlanName] = useState('');
  const [maxPhotos, setMaxPhotos] = useState(0);
  const [maxEstablishments, setMaxEstablishments] = useState(1);
  const [roi, setRoi] = useState<any>(null);

  useEffect(() => {
    (async () => {
      // 1. Vérifie impersonation en priorité
      const impersonated = await getImpersonatedTenant();
      if (impersonated) {
        setTenant(impersonated);
        setIsImpersonating(true);
        setLoading(false);
        return;
      }

      // 2. Sinon, charge le tenant de l'utilisateur connecté
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Cherche le tenant du user
      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('tenants(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      const t = tenantUser?.tenants as any;
      setTenant(t);

      // Charge les vraies statistiques ROI du tenant
      if (t?.id) {
        const { data: stats } = await supabase.rpc('tenant_roi_stats', { p_tenant: t.id });
        if (stats && !stats.empty) setRoi(stats);
      }

      // Charge la formule du tenant
      if (t?.plan_id) {
        const { data: plan } = await supabase
          .from('plans')
          .select('name, max_businesses, slug')
          .eq('id', t.plan_id)
          .single();
        
        if (plan) {
          setPlanName(plan.name);
          setMaxEstablishments(plan.max_businesses);
          // Photos max selon formule
          if (plan.slug === 'decouverte') setMaxPhotos(0);
          else if (plan.slug === 'essentiel') setMaxPhotos(20);
          else setMaxPhotos(999);
        }
      }
      
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
        <p className="text-sm text-gris-texte">Chargement...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-12 text-center text-gris-texte">
        Aucun tenant associé.
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Bonjour {tenant.name} 👋
        </h1>
        <p className="text-sm text-gris-texte">
          Voici l&apos;activité de vos établissements.
        </p>
      </div>

      <PlanUpgradeBanner
        planName={planName}
        maxPhotos={maxPhotos}
        maxEstablishments={maxEstablishments}
      />

      {/* KPIs — vraies données (tenant_roi_stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Eye size={14} className="text-blue-600" /> Vues (30 jours)
          </div>
          <div className="text-3xl font-extrabold text-marine">
            {roi ? Number(roi.views_30d || 0).toLocaleString('fr-FR') : '—'}
          </div>
          {roi?.views_delta_pct != null && (
            <div className={`text-xs mt-1 ${roi.views_delta_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {roi.views_delta_pct >= 0 ? '▲' : '▼'} {Math.abs(roi.views_delta_pct)}% vs mois précédent
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Inbox size={14} className="text-orange-500" /> Clics contact (30 jours)
          </div>
          <div className="text-3xl font-extrabold text-marine">
            {roi ? Number(roi.clicks_30d || 0).toLocaleString('fr-FR') : '—'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Inbox size={14} className="text-green-600" /> Réservations reçues
          </div>
          <div className="text-3xl font-extrabold text-marine">
            {roi ? Number(roi.reservations_total || 0).toLocaleString('fr-FR') : '—'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Star size={14} className="text-yellow-500" /> Note moyenne
          </div>
          <div className="text-3xl font-extrabold text-marine">
            {roi && Number(roi.avg_rating) > 0 ? Number(roi.avg_rating).toFixed(1) : '—'}
          </div>
          {roi && roi.reviews_count > 0 && (
            <div className="text-xs text-gris-doux mt-1">{roi.reviews_count} avis</div>
          )}
        </div>
      </div>

      {/* Graphique d'évolution des vues (6 mois) */}
      {roi?.monthly && roi.monthly.length > 0 && (
        <div className="bg-white rounded-xl border border-gris-ligne p-6 mb-8 shadow-cb-sm">
          <h3 className="text-sm font-bold text-marine mb-4">Évolution des vues (6 mois)</h3>
          <div className="flex items-end gap-2 h-32">
            {(() => {
              const max = Math.max(1, ...roi.monthly.map((m: any) => m.views));
              return roi.monthly.map((m: any) => (
                <div key={m.mois} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-marine/80 rounded-t"
                    style={{ height: `${Math.round((m.views / max) * 100)}%` }}
                    title={`${m.views} vues`}
                  />
                  <span className="text-[10px] text-gris-doux">{m.mois.slice(5)}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gris-ligne p-8 text-center shadow-cb-sm">
        <Bell size={32} className="text-gris-doux mx-auto mb-3" />
        <p className="text-sm text-gris-texte">
          {isImpersonating
            ? `Vous consultez le dashboard de "${tenant.name}" en mode SuperAdmin.`
            : `Le dashboard de "${tenant.name}" est en cours de finalisation.`}
        </p>
      </div>
    </>
  );
}