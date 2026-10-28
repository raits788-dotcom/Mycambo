'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  HeartHandshake,
  Loader2,
  CheckCircle2,
  Clock,
  Mail,
  XCircle,
  Inbox,
} from 'lucide-react';
import {
  getGeranceTenants,
  getGeranceStats,
  inviteToClaim,
  getClaimInvitations,
  approveClaim,
  rejectClaim,
  type GeranceTenant,
} from '@/lib/services';

const BIZ_STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  suspended: 'bg-red-100 text-red-700',
};
const BIZ_STATUS_LABELS: Record<string, string> = {
  approved: 'Publiée',
  pending: 'En attente',
  suspended: 'Suspendue',
};

const CLAIM_STATUS: Record<string, { label: string; cls: string }> = {
  invited: { label: 'Invitée', cls: 'bg-blue-100 text-blue-700' },
  account_created: { label: 'Compte créé', cls: 'bg-indigo-100 text-indigo-700' },
  submitted: { label: 'À valider', cls: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Validée', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusée', cls: 'bg-red-100 text-red-700' },
  expired: { label: 'Expirée', cls: 'bg-gris-fond text-gris-texte' },
  revoked: { label: 'Annulée', cls: 'bg-gris-fond text-gris-texte' },
};

function getWebBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_WEB_URL) return process.env.NEXT_PUBLIC_WEB_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'admin.mycambo.net') return 'https://dev.mycambo.net';
    if (host.includes('github.dev'))
      return window.location.origin.replace('-3001.', '-3000.');
  }
  return 'http://localhost:3000';
}

export default function GerancePage() {
  const [view, setView] = useState<'assos' | 'demandes'>('assos');

  // --- Associations en gérance ---
  const [items, setItems] = useState<GeranceTenant[]>([]);
  const [stats, setStats] = useState({
    total: 0, published: 0, pending: 0, claimed: 0, unclaimed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // --- Demandes de réclamation ---
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const [list, s] = await Promise.all([getGeranceTenants(), getGeranceStats()]);
    setItems(list);
    setStats(s);
    setLoading(false);
  };

  const reloadClaims = async () => {
    setClaimsLoading(true);
    setClaims(await getClaimInvitations());
    setClaimsLoading(false);
  };

  useEffect(() => { reload(); reloadClaims(); }, []);

  const filtered = items.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.city || '').toLowerCase().includes(q)
    );
  });

  const pendingClaims = claims.filter((c) => c.status === 'submitted');

  const handleInvite = async (t: GeranceTenant) => {
    if (!confirm(`Envoyer une invitation de réclamation à ${t.email || t.name} ?`)) return;
    setProcessing(t.id);
    try {
      await inviteToClaim(t.id);
      alert('Invitation envoyée par email.');
      await reloadClaims();
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (claim: any) => {
    if (!confirm(`Valider l'accès de ${claim.tenant?.name} ?`)) return;
    setProcessing(claim.id);
    try {
      await approveClaim(claim.id);
      await Promise.all([reload(), reloadClaims()]);
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (claim: any) => {
    const reason = prompt('Motif du refus (visible par le demandeur) :');
    if (reason === null) return;
    setProcessing(claim.id);
    try {
      await rejectClaim(claim.id, reason);
      await reloadClaims();
    } catch (e) {
      alert('Erreur : ' + (e as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <HeartHandshake size={20} className="text-marine" />
          <h1 className="text-xl font-extrabold text-marine">Gérance myCAMBO</h1>
        </div>
        <p className="text-sm text-gris-texte">
          Associations importées en masse. Invitez un partenaire à réclamer son
          accès&nbsp;; la demande est validée manuellement ici (jamais automatiquement).
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gris-fond rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setView('assos')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
            view === 'assos' ? 'bg-white text-marine shadow-sm' : 'text-gris-texte hover:text-marine'
          }`}
        >
          Associations en gérance
        </button>
        <button
          onClick={() => setView('demandes')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-colors inline-flex items-center gap-1.5 ${
            view === 'demandes' ? 'bg-white text-marine shadow-sm' : 'text-gris-texte hover:text-marine'
          }`}
        >
          Demandes de réclamation
          {pendingClaims.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingClaims.length}
            </span>
          )}
        </button>
      </div>

      {view === 'assos' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total gérées', value: stats.total, color: 'text-marine' },
              { label: 'Publiées', value: stats.published, color: 'text-green-600' },
              { label: 'En attente', value: stats.pending, color: 'text-orange-600' },
              { label: 'Réclamées', value: stats.claimed, color: 'text-blue-600' },
              { label: 'Non réclamées', value: stats.unclaimed, color: 'text-gris-texte' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg border border-gris-ligne p-4">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gris-texte mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une association…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gris-doux">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gris-fond rounded-lg">
              <HeartHandshake size={40} className="text-gris-ligne mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Aucune association en gérance.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gris-ligne text-left text-xs text-gris-texte">
                    <th className="px-4 py-3 font-bold">Association</th>
                    <th className="px-4 py-3 font-bold">Fiche</th>
                    <th className="px-4 py-3 font-bold">Réclamation</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-gris-ligne last:border-0 hover:bg-gris-fond/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-marine">{t.name}</div>
                        <div className="text-xs text-gris-texte">
                          {[t.city, t.email].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {t.business_status ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            BIZ_STATUS_STYLES[t.business_status] || 'bg-gris-fond text-gris-texte'
                          }`}>
                            {BIZ_STATUS_LABELS[t.business_status] || t.business_status}
                          </span>
                        ) : <span className="text-xs text-gris-doux">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {t.claimed_at ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                            <CheckCircle2 size={13} />
                            {new Date(t.claimed_at).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gris-texte">
                            <Clock size={13} /> Non réclamée
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {t.business_slug && (
                            <a
                              href={`${getWebBaseUrl()}/commerce/${t.business_slug}`}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-gris-texte hover:text-marine px-2 py-1.5 rounded-md hover:bg-gris-fond"
                            >
                              <Eye size={14} /> Voir
                            </a>
                          )}
                          {!t.claimed_at && (
                            <button
                              onClick={() => handleInvite(t)}
                              disabled={processing === t.id}
                              className="inline-flex items-center gap-1 text-xs font-bold bg-marine text-white px-3 py-1.5 rounded-md hover:bg-marine-dark transition-colors disabled:opacity-60"
                            >
                              {processing === t.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Mail size={14} />
                              )}
                              Inviter à réclamer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'demandes' && (
        <>
          {claimsLoading ? (
            <div className="flex items-center justify-center py-16 text-gris-doux">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16 bg-gris-fond rounded-lg">
              <Inbox size={40} className="text-gris-ligne mx-auto mb-3" />
              <p className="text-sm text-gris-texte">Aucune demande de réclamation.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gris-ligne text-left text-xs text-gris-texte">
                    <th className="px-4 py-3 font-bold">Association</th>
                    <th className="px-4 py-3 font-bold">Demandeur</th>
                    <th className="px-4 py-3 font-bold">Statut</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c) => {
                    const st = CLAIM_STATUS[c.status] || { label: c.status, cls: 'bg-gris-fond text-gris-texte' };
                    return (
                      <tr key={c.id} className="border-b border-gris-ligne last:border-0 hover:bg-gris-fond/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-marine">{c.tenant?.name || '—'}</div>
                          <div className="text-xs text-gris-texte">{c.invited_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{c.requester_name || '—'}</div>
                          {c.justificatif_url && (
                            <a href={c.justificatif_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-marine underline">
                              Voir le justificatif
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${st.cls}`}>
                            {st.label}
                          </span>
                          {c.status === 'rejected' && c.rejection_reason && (
                            <div className="text-[11px] text-gris-doux mt-1">{c.rejection_reason}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {c.status === 'submitted' && (
                              <>
                                <button
                                  onClick={() => handleApprove(c)}
                                  disabled={processing === c.id}
                                  className="inline-flex items-center gap-1 text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-60"
                                >
                                  {processing === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                  Valider
                                </button>
                                <button
                                  onClick={() => handleReject(c)}
                                  disabled={processing === c.id}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 disabled:opacity-60"
                                >
                                  <XCircle size={14} /> Refuser
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
