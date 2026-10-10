'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Loader2, Eye, Award, Mail, MapPin, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import {
  getPendingVerifications, changeVerificationLevel,
} from '@/lib/services';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  active: 'Actif',
  suspended: 'Suspendu',
};

export default function VerificationsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const data = await getPendingVerifications();
    setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const handleApprove = async (tenant: any) => {
    if (!confirm(`Approuver "${tenant.name}" au niveau Vérifié (Bronze) ?`)) return;
    setProcessing(tenant.id);
    try {
      await changeVerificationLevel(tenant.id, 'verifie', 'Approbation initiale');
      await reload();
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (tenant: any) => {
    const reason = prompt(`Raison du refus pour "${tenant.name}" ?`);
    if (!reason) return;
    setProcessing(tenant.id);
    try {
      // On garde "inscrit" mais on pourrait ajouter un flag rejected
      alert(`Refus enregistré : ${reason}`);
      // À implémenter plus tard : status rejected dans tenant_verifications
    } catch (err) {
      alert('Erreur : ' + (err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Vérifications
        </h1>
        <p className="text-sm text-gris-texte">
          {loading
            ? 'Chargement...'
            : `${tenants.length} tenant${tenants.length > 1 ? 's' : ''} en attente de validation`}
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <strong className="block mb-1">Comment ça marche ?</strong>
          Les tenants <strong>Inscrit</strong> ne sont pas visibles publiquement.
          Examinez leur dossier, puis <strong>approuvez</strong> ou <strong>refusez</strong>.
          Une fois approuvés, ils passent au niveau <strong>Vérifié (Bronze)</strong> et deviennent visibles.
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne">
          <Loader2 size={24} className="text-marine animate-spin mx-auto" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center">
          <ShieldCheck size={32} className="text-green-500 mx-auto mb-3" />
          <p className="text-sm text-gris-texte">
            🎉 Aucun dossier en attente. Tout est à jour !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm hover:shadow-cb-md transition-all"
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-marine">{tenant.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      <Award size={10} /> Inscrit
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-gris-texte">
                    <span className="flex items-center gap-1">
                      <Mail size={11} />
                      {tenant.email}
                    </span>
                    {tenant.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {tenant.city}
                      </span>
                    )}
                    <span className="text-gris-doux">
                      Inscrit le {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Checklist rapide */}
                  <div className="mt-3 flex items-center gap-3 flex-wrap text-[11px]">
                    <span className="flex items-center gap-1 text-gris-doux">
                      <Clock size={10} /> En attente d'examen
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/tenants/${tenant.id}`}
                    className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-xs px-3 py-2 rounded-full hover:border-marine"
                  >
                    <Eye size={12} /> Examiner
                  </Link>
                  <button
                    onClick={() => handleApprove(tenant)}
                    disabled={processing === tenant.id}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold text-xs px-3 py-2 rounded-full hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === tenant.id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <CheckCircle2 size={12} />}
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(tenant)}
                    disabled={processing === tenant.id}
                    className="flex items-center gap-2 border border-red-200 text-red-600 font-bold text-xs px-3 py-2 rounded-full hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={12} /> Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}