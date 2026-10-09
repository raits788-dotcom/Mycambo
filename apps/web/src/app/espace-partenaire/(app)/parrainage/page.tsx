'use client';

import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Loader2, Users, Award, TrendingUp } from 'lucide-react';
import { useCurrentTenant } from '@/lib/use-current-tenant';
import {
  getMyReferralCode, getMyReferrals, getReferralTiers, getReferralSettings,
} from '@/lib/referral';

export default function PartnerReferralPage() {
  const { tenant, loading: tenantLoading } = useCurrentTenant();
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    if (tenantLoading || !tenant) return;
    (async () => {
      const [c, r, t, s] = await Promise.all([
        getMyReferralCode(tenant.id),
        getMyReferrals(tenant.id),
        getReferralTiers(),
        getReferralSettings(),
      ]);
      setCode(c);
      setReferrals(r);
      setTiers(t);
      setSettings(s);
      setLoading(false);
    })();
  }, [tenant, tenantLoading]);

  const qualified = referrals.filter((r) => r.status === 'qualified').length;
  const pending = referrals.filter((r) => r.status === 'pending').length;

  const currentTier = [...tiers].reverse().find((t) => qualified >= t.referrals_required);
  const nextTier = tiers.find((t) => qualified < t.referrals_required);

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/inscription?ref=${code}`
    : '';

  if (tenantLoading || loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" />
      </div>
    );
  }

  if (!tenant || !settings?.enabled) {
    return (
      <div className="p-12 text-center text-gris-texte">
        Programme de parrainage non disponible.
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          🎁 Parrainez et gagnez
        </h1>
        <p className="text-sm text-gris-texte">
          Invitez d&apos;autres partenaires et débloquez des récompenses.
        </p>
      </div>

      {/* Mon code + lien */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white mb-6 shadow-cb-md">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={18} />
          <span className="text-sm font-bold uppercase tracking-wider opacity-90">
            Votre code de parrainage
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-xl px-5 py-3">
            <span className="font-mono text-2xl font-extrabold tracking-wider">
              {code || '—'}
            </span>
            <button
              onClick={() => code && copyToClipboard(code, 'code')}
              className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              title="Copier le code"
            >
              {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs opacity-80 mb-2">Lien d&apos;inscription à partager :</div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent text-sm font-mono truncate focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(referralLink, 'link')}
              className="w-8 h-8 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              {copied === 'link' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Users size={14} className="text-blue-600" /> Filleuls inscrits
          </div>
          <div className="text-3xl font-extrabold text-marine">{referrals.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <TrendingUp size={14} className="text-green-600" /> Filleuls qualifiés
          </div>
          <div className="text-3xl font-extrabold text-green-600">{qualified}</div>
          <div className="text-[11px] text-gris-doux mt-1">Après 1ère facture payée</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-5 shadow-cb-sm">
          <div className="flex items-center gap-2 text-xs text-gris-texte mb-2">
            <Award size={14} className="text-yellow-600" /> Palier actuel
          </div>
          {currentTier ? (
            <>
              <div className="text-lg font-extrabold text-marine">
                {currentTier.badge_name || `-${currentTier.reward_value}%`}
              </div>
              {currentTier.badge_name && (
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-white mt-1"
                  style={{ backgroundColor: currentTier.badge_color || '#999' }}
                >
                  {currentTier.badge_name}
                </span>
              )}
            </>
          ) : (
            <div className="text-sm text-gris-texte">Aucun palier atteint</div>
          )}
        </div>
      </div>

      {/* Progression */}
      <div className="bg-white rounded-xl border border-gris-ligne p-6 mb-6 shadow-cb-sm">
        <h2 className="font-bold text-marine mb-4">Votre progression</h2>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tiers.map((t, i) => {
            const reached = qualified >= t.referrals_required;
            return (
              <div key={t.id} className="flex items-center gap-2 flex-shrink-0">
                <div className="text-center">
                  <div
                    className={
                      'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-1 ' +
                      (reached ? 'text-white' : 'bg-gris-fond text-gris-doux')
                    }
                    style={reached ? { backgroundColor: t.badge_color || '#1B3A6B' } : {}}
                  >
                    {reached ? '✓' : t.referrals_required}
                  </div>
                  <div className="text-[10px] text-gris-texte whitespace-nowrap">
                    {t.badge_name || `-${t.reward_value}%`}
                  </div>
                </div>
                {i < tiers.length - 1 && (
                  <div className={'h-0.5 w-8 ' + (reached ? 'bg-marine' : 'bg-gris-ligne')} />
                )}
              </div>
            );
          })}
        </div>

        {nextTier && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-900 mb-2">
              <strong>Prochain palier :</strong> {nextTier.referrals_required} filleuls qualifiés
              → {nextTier.reward_type === 'discount_percent'
                ? `-${nextTier.reward_value}% sur votre prochaine facture`
                : `${nextTier.reward_value} mois offerts`}
              {nextTier.badge_name && (
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-white ml-2"
                  style={{ backgroundColor: nextTier.badge_color || '#999' }}
                >
                  {nextTier.badge_name}
                </span>
              )}
            </div>
            <div className="text-xs text-blue-700">
              Encore {nextTier.referrals_required - qualified} filleul{nextTier.referrals_required - qualified > 1 ? 's' : ''} à qualifier
              {pending > 0 && ` (${pending} en attente)`}
            </div>
          </div>
        )}
      </div>

      {/* Liste filleuls */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Mes filleuls</h2>
        </div>
        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-gris-doux mx-auto mb-3" />
            <p className="text-sm text-gris-texte">Aucun filleul pour l&apos;instant.</p>
            <p className="text-xs text-gris-doux mt-1">
              Partagez votre code pour commencer à gagner.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Filleul</th>
                <th className="text-left px-3 py-3 font-bold">Inscrit le</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-gris-fond/50">
                  <td className="px-6 py-4 font-bold text-marine">
                    {r.referred?.name || '—'}
                  </td>
                  <td className="px-3 py-4 text-xs text-gris-texte">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-4">
                    <span className={
                      'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' +
                      (r.status === 'pending' ? 'bg-orange-100 text-orange-700'
                        : r.status === 'qualified' ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700')
                    }>
                      {r.status === 'pending' ? 'En attente' : r.status === 'qualified' ? 'Qualifié ✓' : 'Annulé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}