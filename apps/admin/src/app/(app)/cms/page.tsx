'use client';

import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Upload, Eye, Edit3, Loader2 } from 'lucide-react';
import { getCmsPages, getCarouselSlides } from '@/lib/services';

type Tab = 'pages' | 'carousel' | 'medias';

export default function CMSPage() {
  const [tab, setTab] = useState<Tab>('pages');
  const [pages, setPages] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([getCmsPages(), getCarouselSlides()]);
      setPages(p);
      setSlides(s);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">Gestion de contenu (CMS)</h1>
        <p className="text-sm text-gris-texte">Modifiez les pages, le carrousel et la bibliothèque d&apos;images.</p>
      </div>

      <div className="flex gap-2 border-b border-gris-ligne mb-6">
        <button onClick={() => setTab('pages')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'pages' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <FileText size={14} /> Pages
        </button>
        <button onClick={() => setTab('carousel')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'carousel' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <ImageIcon size={14} /> Carrousel
        </button>
        <button onClick={() => setTab('medias')} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 ' + (tab === 'medias' ? 'border-marine text-marine' : 'border-transparent text-gris-texte')}>
          <Upload size={14} /> Médias
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gris-ligne"><Loader2 size={24} className="text-marine animate-spin mx-auto mb-3" /><p className="text-sm text-gris-texte">Chargement...</p></div>
      ) : tab === 'pages' ? (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne">
            <h2 className="font-bold text-marine">Pages du site</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Titre</th>
                <th className="text-left px-3 py-3 font-bold">Slug</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-right px-6 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gris-fond/50">
                  <td className="px-6 py-4 font-bold text-marine">{p.title}</td>
                  <td className="px-3 py-4 text-xs font-mono text-gris-texte">/{p.slug}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                      {p.status === 'published' ? 'Publiée' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10"><Edit3 size={14} /></button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10"><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'carousel' ? (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne">
            <h2 className="font-bold text-marine">Slides du carrousel d&apos;accueil</h2>
          </div>
          <ul className="divide-y divide-gris-ligne">
            {slides.map((s, i) => (
              <li key={s.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-marine/10 text-marine flex items-center justify-center font-extrabold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-marine truncate">{s.title}</div>
                  <div className="text-xs text-gris-texte truncate">{s.subtitle}</div>
                </div>
                <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (s.is_active ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')}>
                  {s.is_active ? 'Actif' : 'Inactif'}
                </span>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10"><Edit3 size={14} /></button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gris-ligne p-12 text-center shadow-cb-sm">
          <Upload size={32} className="text-gris-doux mx-auto mb-3" />
          <p className="text-sm text-gris-texte">Bibliothèque de médias</p>
          <p className="text-xs text-gris-doux mt-1">À brancher sur Supabase Storage plus tard.</p>
        </div>
      )}
    </>
  );
}