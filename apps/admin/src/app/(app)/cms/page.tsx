'use client';

import { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Upload,
  Save,
  X,
} from 'lucide-react';

type Tab = 'pages' | 'carousel' | 'medias';

interface Page {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'draft';
  updatedAt: string;
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  position: number;
  isActive: boolean;
}

interface Media {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  url: string;
}

const MOCK_PAGES: Page[] = [
  { id: 'pg1', slug: 'accueil', title: 'Accueil', status: 'published', updatedAt: '2025-02-10' },
  { id: 'pg2', slug: 'a-propos', title: 'À propos', status: 'published', updatedAt: '2025-01-22' },
  { id: 'pg3', slug: 'contact', title: 'Contact', status: 'published', updatedAt: '2025-01-15' },
  { id: 'pg4', slug: 'cgu', title: 'Conditions générales', status: 'published', updatedAt: '2024-12-01' },
  { id: 'pg5', slug: 'confidentialite', title: 'Politique de confidentialité', status: 'published', updatedAt: '2024-12-01' },
];

const MOCK_SLIDES: Slide[] = [
  { id: 's1', title: 'Le Cambodge se dévoile', subtitle: 'Temples, rizières, saveurs', position: 1, isActive: true },
  { id: 's2', title: 'Découvrez Angkor', subtitle: 'La cité perdue des Khmers', position: 2, isActive: true },
  { id: 's3', title: 'Bienvenue au Cambodge', subtitle: 'Terre d\'hospitalité', position: 3, isActive: true },
];

const MOCK_MEDIAS: Media[] = [
  { id: 'm1', name: 'angkor-sunrise.jpg', size: '2.4 MB', uploadedAt: '2025-02-10', url: '#' },
  { id: 'm2', name: 'bistro-khmer.jpg', size: '1.8 MB', uploadedAt: '2025-02-09', url: '#' },
  { id: 'm3', name: 'sokha-spa.jpg', size: '2.1 MB', uploadedAt: '2025-02-08', url: '#' },
  { id: 'm4', name: 'kampot-pepper.jpg', size: '1.5 MB', uploadedAt: '2025-02-07', url: '#' },
  { id: 'm5', name: 'tonle-sap.jpg', size: '3.2 MB', uploadedAt: '2025-02-06', url: '#' },
  { id: 'm6', name: 'logo-cambo.png', size: '48 KB', uploadedAt: '2025-01-15', url: '#' },
];

export default function CMSPage() {
  const [tab, setTab] = useState<Tab>('pages');

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Gestion de contenu (CMS)
          </h1>
          <p className="text-sm text-gris-texte">
            Modifiez les pages, le carrousel et la bibliothèque d&apos;images du site.
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gris-ligne mb-6">
        <button
          onClick={() => setTab('pages')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'pages' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <FileText size={14} />
          Pages
        </button>
        <button
          onClick={() => setTab('carousel')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'carousel' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <ImageIcon size={14} />
          Carrousel
        </button>
        <button
          onClick={() => setTab('medias')}
          className={'flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ' + (tab === 'medias' ? 'border-marine text-marine' : 'border-transparent text-gris-texte hover:text-marine')}
        >
          <Upload size={14} />
          Médias
        </button>
      </div>

      {/* Onglet Pages */}
      {tab === 'pages' && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne flex items-center justify-between">
            <h2 className="font-bold text-marine">Pages du site</h2>
            <button className="flex items-center gap-2 bg-marine text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-marine-dark">
              <Plus size={12} />
              Nouvelle page
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Titre</th>
                <th className="text-left px-3 py-3 font-bold">Slug</th>
                <th className="text-left px-3 py-3 font-bold">Statut</th>
                <th className="text-left px-3 py-3 font-bold">Modifié le</th>
                <th className="text-right px-6 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-ligne">
              {MOCK_PAGES.map((p) => (
                <tr key={p.id} className="hover:bg-gris-fond/50">
                  <td className="px-6 py-4 font-bold text-marine">{p.title}</td>
                  <td className="px-3 py-4 text-xs font-mono text-gris-texte">/{p.slug}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                      {p.status === 'published' ? 'Publiée' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-xs text-gris-texte">{p.updatedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine">
                        <Edit3 size={14} />
                      </button>
                      <a href={'https://mycambo.com/' + p.slug} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine">
                        <Eye size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Onglet Carrousel */}
      {tab === 'carousel' && (
        <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne flex items-center justify-between">
            <div>
              <h2 className="font-bold text-marine">Slides du carrousel d&apos;accueil</h2>
              <p className="text-xs text-gris-texte mt-1">Ces slides apparaissent dans le hero de la page d&apos;accueil.</p>
            </div>
            <button className="flex items-center gap-2 bg-marine text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-marine-dark">
              <Plus size={12} />
              Nouveau slide
            </button>
          </div>
          <ul className="divide-y divide-gris-ligne">
            {MOCK_SLIDES.map((s) => (
              <li key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gris-fond/50">
                <div className="w-10 h-10 rounded-lg bg-marine/10 text-marine flex items-center justify-center font-extrabold text-sm">
                  {s.position}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-marine truncate">{s.title}</div>
                  <div className="text-xs text-gris-texte truncate">{s.subtitle}</div>
                </div>
                <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + (s.isActive ? 'bg-green-100 text-green-700' : 'bg-gris-fond text-gris-texte')}>
                  {s.isActive ? 'Actif' : 'Inactif'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine">
                    <Edit3 size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Onglet Médias */}
      {tab === 'medias' && (
        <div className="bg-white rounded-xl border border-gris-ligne shadow-cb-sm">
          <div className="px-6 py-4 border-b border-gris-ligne flex items-center justify-between">
            <h2 className="font-bold text-marine">Bibliothèque de médias</h2>
            <button className="flex items-center gap-2 bg-marine text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-marine-dark">
              <Upload size={12} />
              Uploader
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {MOCK_MEDIAS.map((m) => (
              <div key={m.id} className="group rounded-lg overflow-hidden border border-gris-ligne hover:border-marine transition-colors">
                <div className="aspect-square bg-gradient-to-br from-marine/10 to-gris-fond flex items-center justify-center">
                  <ImageIcon size={32} className="text-gris-doux" />
                </div>
                <div className="p-2">
                  <div className="text-[11px] font-bold text-marine truncate">{m.name}</div>
                  <div className="text-[10px] text-gris-doux">{m.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}