'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, Star, Inbox, ArrowRight, Loader2, Bell } from 'lucide-react';
import { getImpersonatedTenant } from '@/lib/impersonation';

export default function PartnerDashboardPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

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

      setTenant(tenantUser?.tenants || null);
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

      {/* KPIs (données mockées pour l'instant) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Eye size={14} className="text-blue-600" /> Vues ce mois
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
            <Star size={14} className="text-yellow-500" /> Note moyenne
          </div>
          <div className="text-3xl font-extrabold text-marine">—</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-3">
            <Inbox size={14} className="text-orange-500" /> Demandes
          </div>
          <div className="text-3xl font-extrabold text-marine">0</div>
        </div>
      </div>

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