'use client';

import { useState, useEffect } from 'react';
import { Star, Eye, ArrowUp, ArrowDown, Info, Loader2, X } from 'lucide-react';
import {
  getFeaturedBusinesses, getBusinesses,
  addFeatured, removeFeatured, setFeaturedPosition,
} from '@/lib/services';

export default function FeaturedPage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [f, b] = await Promise.all([getFeaturedBusinesses(), getBusinesses()]);
    setFeatured(f);
    setAllBusinesses(b);
  };

  useEffect(() => {
    (async () => {
      await reload();
      setLoading(false);
    })();
  }, []);

  const available = allBusinesses.filter((b) => !b.is_featured && b.status === 'approved');

  // Ajoute en base (is_featured = true), puis recharge.
  const add = async (id: string) => {
    setBusy(true);
    try { await addFeatured(id); await reload(); }
    catch (e) { alert('Erreur : ' + (e as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Retirer cet établissement des coups de cœur ?')) return;
    setBusy(true);
    try { await removeFeatured(id); await reload(); }
    catch (e) { alert('Erreur : ' + (e as Error).message); }
    finally { setBusy(false); }
  };

  // Échange les positions en base puis recharge.
  const swap = async (idx: number, other: number) => {
    if (other < 0 || other >= featured.length) return;
    setBusy(true);
    try {
      const a = featured[idx], b = featured[other];
      await setFeaturedPosition(a.id, b.featured_position ?? other + 1);
      await setFeaturedPosition(b.id, a.featured_position ?? idx + 1);
      await reload();
    } catch (e) { alert('Erreur : ' + (e as Error).message); }
    finally { setBusy(false); }
  };

  const moveUp = (id: string) => {
    const idx = featured.findIndex((f) => f.id === id);
    swap(idx, idx - 1);
  };

  const moveDown = (id: string) => {
    const idx = featured.findIndex((f) => f.id === id);
    swap(idx, idx + 1);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Coups de cœur</h1>
        <p className="text-sm text-gris-texte">
          {loading ? 'Chargement...' : featured.length + ' établissements mis en avant'}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <strong className="block mb-1">Comment ça marche ?</strong>
          Les coups de cœur apparaissent sur la page d&apos;accueil du site public, dans un carrousel.
          L&apos;ordre définit l&apos;affichage. Renouvellement conseillé chaque mois.
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm mb-8">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine flex items-center gap-2">
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            Coups de cœur actifs
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center"><Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" /></div>
        ) : (
          <ul className="divide-y divide-gris-ligne">
            {featured.length === 0 ? (
              <li className="px-6 py-12 text-center text-gris-texte text-sm">Aucun coup de cœur actif.</li>
            ) : featured.map((f, i) => (
              <li key={f.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => moveUp(f.id)} disabled={i === 0} className="text-gris-doux hover:text-marine disabled:opacity-30"><ArrowUp size={14} /></button>
                  <div className="w-9 h-9 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center font-extrabold text-sm">{i + 1}</div>
                  <button onClick={() => moveDown(f.id)} disabled={i === featured.length - 1} className="text-gris-doux hover:text-marine disabled:opacity-30"><ArrowDown size={14} /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-marine truncate">{f.name}</div>
                  <div className="text-xs text-gris-texte">
                    {f.categories?.name || '—'} · {f.city || '—'} · {f.tenants?.name || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10"><Eye size={14} /></button>
                  <button onClick={() => remove(f.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100"><X size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <div className="px-6 py-4 border-b border-gris-ligne">
          <h2 className="font-bold text-marine">Ajouter un établissement</h2>
          <p className="text-xs text-gris-texte mt-1">Établissements publiés pouvant être mis en avant.</p>
        </div>
        <ul className="divide-y divide-gris-ligne">
          {available.length === 0 ? (
            <li className="px-6 py-8 text-center text-gris-texte text-sm">Tous les établissements publiés sont déjà en coup de cœur.</li>
          ) : available.map((a) => (
            <li key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-marine truncate">{a.name}</div>
                <div className="text-xs text-gris-texte">
                  {a.categories?.name || '—'} · {a.city || '—'} · {a.tenants?.name || '—'}
                </div>
              </div>
              <button
                onClick={() => add(a.id)}
                disabled={busy}
                className="flex items-center gap-1.5 text-xs font-bold bg-yellow-500 text-white px-3 py-1.5 rounded-full hover:bg-yellow-600 disabled:opacity-50"
              >
                <Star size={12} fill="currentColor" />
                Ajouter
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}