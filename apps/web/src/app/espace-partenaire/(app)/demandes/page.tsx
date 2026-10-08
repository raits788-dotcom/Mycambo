'use client';

import { useEffect, useState } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerDemandesPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantLoading || !tenant) return;
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('partner_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setDemandes(data || []);
      setLoading(false);
    })();
  }, [tenant, tenantLoading]);

  if (tenantLoading || loading) {
    return <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto" /></div>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Demandes reçues</h1>
        <p className="text-sm text-gris-texte">{demandes.length} demande{demandes.length > 1 ? 's' : ''}</p>
      </div>

      {demandes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
          <Inbox size={32} className="text-gris-doux mx-auto mb-3" />
          <p className="text-sm text-gris-texte">Aucune demande pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Entreprise</th>
                <th className="text-left px-3 py-3 font-bold">Email</th>
                <th className="text-left px-3 py-3 font-bold">Date</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {demandes.map((d) => (
                <tr key={d.id} className="hover:bg-gris-fond/50">
                  <td className="px-6 py-4 font-bold text-marine">{d.company_name}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{d.email}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (d.status === 'pending' ? 'bg-orange-100 text-orange-700' : d.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {d.status === 'pending' ? 'En attente' : d.status === 'approved' ? 'Approuvée' : 'Refusée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}