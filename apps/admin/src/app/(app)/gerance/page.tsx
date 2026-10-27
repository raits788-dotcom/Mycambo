'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  HeartHandshake,
  Loader2,
  CheckCircle2,
  Clock,
  Link2,
  ExternalLink,
} from 'lucide-react';
import {
  getGeranceTenants,
  getGeranceStats,
  claimGeranceAccess,
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
  const [items, setItems] = useState<GeranceTenant[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    claimed: 0,
    unclaimed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unclaimed' | 'claimed'>('all');

  // Réclamation
  const [claimFor, setClaimFor] = useState<GeranceTenant | null>(null);
  const [claimUserId, setClaimUserId] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const [list, s] = await Promise.all([getGeranceTenants(), getGeranceStats()]);
    setItems(list);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = items.filter((t) => {
    if (filter === 'unclaimed' && t.claimed_at != null) return false;
    if (filter === 'claimed' && t.claimed_at == null) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.city || '').toLowerCase().includes(q)
    );
  });

  const openClaim = (t: GeranceTenant) => {
    setClaimFor(t);
    setClaimUserId('');
    setClaimError(null);
  };

  const confirmClaim = async () => {
    if (!claimFor) return;
    const uid = claimUserId.trim();
    if (!uid) {
      setClaimError("L'identifiant du compte (user_id) est requis.");
      return;
    }
    setClaiming(true);
    setClaimError(null);
    const res = await claimGeranceAccess(claimFor.id, uid);
    setClaiming(false);
    if (!res.ok) {
      setClaimError(res.error);
      return;
    }
    setClaimFor(null);
    await reload();
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
          Associations importées en masse et gérées par myCAMBO. Chaque partenaire
          pourra réclamer son accès&nbsp;; la liaison du compte est validée
          manuellement ici (jamais automatiquement).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total gérées', value: stats.total, color: 'text-marine' },
          { label: 'Publiées', value: stats.published, color: 'text-green-600' },
          { label: 'En attente', value: stats.pending, color: 'text-orange-600' },
          { label: 'Réclamées', value: stats.claimed, color: 'text-blue-600' },
          { label: 'Non réclamées', value: stats.unclaimed, color: 'text-gris-texte' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg border border-gris-ligne p-4"
          >
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gris-texte mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une association…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none"
          />
        </div>
        <div className="flex gap-1 bg-gris-fond rounded-lg p-1">
          {[
            { k: 'all', l: 'Toutes' },
            { k: 'unclaimed', l: 'Non réclamées' },
            { k: 'claimed', l: 'Réclamées' },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k as typeof filter)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filter === f.k
                  ? 'bg-white text-marine shadow-sm'
                  : 'text-gris-texte hover:text-marine'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gris-doux">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gris-fond rounded-lg">
          <HeartHandshake size={40} className="text-gris-ligne mx-auto mb-3" />
          <p className="text-sm text-gris-texte">
            Aucune association en gérance pour ce filtre.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gris-ligne text-left text-xs text-gris-texte">
                <th className="px-4 py-3 font-bold">Association</th>
                <th className="px-4 py-3 font-bold">Formule</th>
                <th className="px-4 py-3 font-bold">Fiche</th>
                <th className="px-4 py-3 font-bold">Réclamation</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gris-ligne last:border-0 hover:bg-gris-fond/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-marine">{t.name}</div>
                    <div className="text-xs text-gris-texte">
                      {[t.city, t.email].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {t.plan_name || 'Aucune'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.business_status ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          BIZ_STATUS_STYLES[t.business_status] ||
                          'bg-gris-fond text-gris-texte'
                        }`}
                      >
                        {BIZ_STATUS_LABELS[t.business_status] || t.business_status}
                      </span>
                    ) : (
                      <span className="text-xs text-gris-doux">—</span>
                    )}
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
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-gris-texte hover:text-marine px-2 py-1.5 rounded-md hover:bg-gris-fond"
                          title="Voir la fiche publique"
                        >
                          <Eye size={14} /> Voir
                        </a>
                      )}
                      {!t.claimed_at && (
                        <button
                          onClick={() => openClaim(t)}
                          className="inline-flex items-center gap-1 text-xs font-bold bg-marine text-white px-3 py-1.5 rounded-md hover:bg-marine-dark transition-colors"
                        >
                          <Link2 size={14} /> Valider la réclamation
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

      {/* Modale de réclamation */}
      {claimFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="font-extrabold text-marine text-base mb-1">
              Valider la réclamation d&apos;accès
            </h2>
            <p className="text-xs text-gris-texte mb-4">
              Lie le compte du partenaire à l&apos;association{' '}
              <strong>{claimFor.name}</strong>, puis la sort de la gérance
              myCAMBO. Vérifiez l&apos;identité du demandeur avant de valider —
              cette action donne l&apos;accès de gestion.
            </p>

            <label className="block text-xs font-bold text-marine mb-1">
              Identifiant du compte partenaire (user_id)
            </label>
            <input
              value={claimUserId}
              onChange={(e) => setClaimUserId(e.target.value)}
              placeholder="UUID du compte auth à lier"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine outline-none mb-2 font-mono"
            />
            <p className="text-[11px] text-gris-doux mb-4">
              Le partenaire doit d&apos;abord créer son compte&nbsp;; son user_id
              se trouve dans la file des demandes de réclamation.
            </p>

            {claimError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5 mb-4">
                {claimError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setClaimFor(null)}
                disabled={claiming}
                className="text-xs font-bold text-gris-texte px-4 py-2.5 rounded-full hover:bg-gris-fond disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                onClick={confirmClaim}
                disabled={claiming}
                className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
              >
                {claiming ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Liaison…
                  </>
                ) : (
                  <>
                    <Link2 size={14} /> Valider et lier le compte
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
