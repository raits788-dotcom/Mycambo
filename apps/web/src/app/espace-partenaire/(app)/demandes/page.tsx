'use client';

import { useEffect, useState } from 'react';
import { Inbox, Loader2, Filter } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

export default function PartnerDemandesPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantLoading || !tenant) return;

    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Récupérer les établissements du tenant
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, slug')
        .eq('tenant_id', tenant.id)
        .order('name');

      setEstablishments(businesses || []);

      // 2. Récupérer les messages liés à ces établissements
      const businessIds = (businesses || []).map((b) => b.id);

      if (businessIds.length === 0) {
        setDemandes([]);
        setLoading(false);
        return;
      }

      const { data: messages } = await supabase
        .from('contact_messages')
        .select(`
          *,
          business:businesses(id, name, slug)
        `)
        .in('business_id', businessIds)
        .order('created_at', { ascending: false });

      setDemandes(messages || []);
      setLoading(false);
    })();
  }, [tenant, tenantLoading]);

  const filtered = selectedEstablishment === 'all'
    ? demandes
    : demandes.filter((d) => d.business_id === selectedEstablishment);

  if (tenantLoading || loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Demandes reçues
          </h1>
          <p className="text-sm text-gris-texte">
            {filtered.length} demande{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtre par établissement */}
        {establishments.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gris-doux" />
            <select
              value={selectedEstablishment}
              onChange={(e) => setSelectedEstablishment(e.target.value)}
              className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5"
            >
              <option value="all">Tous les établissements</option>
              {establishments.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
          <Inbox size={32} className="text-gris-doux mx-auto mb-3" />
          <p className="text-sm text-gris-texte">Aucune demande pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Établissement</th>
                <th className="text-left px-3 py-3 font-bold">Client</th>
                <th className="text-left px-3 py-3 font-bold">Email</th>
                <th className="text-left px-3 py-3 font-bold">Sujet</th>
                <th className="text-left px-3 py-3 font-bold">Date</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gris-fond/50">
                  <td className="px-6 py-4 font-bold text-marine">
                    {d.business?.name || '—'}
                  </td>
                  <td className="px-3 py-4 text-marine">{d.name}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{d.email}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{d.subject}</td>
                  <td className="px-3 py-4 text-gris-texte text-xs">
                    {new Date(d.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={
                        'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                        (d.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : d.status === 'read'
                          ? 'bg-gris-fond text-gris-texte'
                          : 'bg-green-100 text-green-700')
                      }
                    >
                      {d.status === 'new'
                        ? 'Nouveau'
                        : d.status === 'read'
                        ? 'Lu'
                        : 'Traité'}
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