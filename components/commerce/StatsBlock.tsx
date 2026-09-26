'use client';

import { useEffect, useState, useCallback } from 'react';
import { Eye, Heart } from 'lucide-react';
import {
  incrementViews,
  getViews,
  getSupports,
  initStatsIfEmpty,
} from '@/lib/stats-tracker';

interface StatsBlockProps {
  slug: string;
  initialViews: number;
  initialSupports: number;
}

export default function StatsBlock({
  slug,
  initialViews,
  initialSupports,
}: StatsBlockProps) {
  const [views, setViews] = useState(initialViews);
  const [supports, setSupports] = useState(initialSupports);
  const [mounted, setMounted] = useState(false);

  // ===== Fonction de lecture des stats =====
  const refreshStats = useCallback(() => {
    setViews(getViews(slug));
    setSupports(getSupports(slug));
  }, [slug]);

  useEffect(() => {
    // 1. Initialise les compteurs
    initStatsIfEmpty(slug, initialViews, initialSupports);

    // 2. Incrémente les vues (une fois par session)
    incrementViews(slug);

    // 3. Lit les valeurs actuelles
    refreshStats();
    setMounted(true);

    // ===== Écoute les mises à jour =====
    const handleUpdate = () => refreshStats();
    window.addEventListener('stats-updated', handleUpdate);

    // ===== Polling léger (toutes les 2s) pour rattraper les changements =====
    const interval = setInterval(refreshStats, 2000);

    return () => {
      window.removeEventListener('stats-updated', handleUpdate);
      clearInterval(interval);
    };
  }, [slug, initialViews, initialSupports, refreshStats]);

  if (!mounted) {
    return (
      <div className="pt-4 mt-4 border-t border-gris-ligne">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gris-doux font-bold mb-3">
          Statistiques
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gris-texte">
              <Eye size={14} /> Vues
            </span>
            <b className="text-marine">—</b>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gris-texte">
              <Heart size={14} /> Soutiens
            </span>
            <b className="text-marine">—</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 mt-4 border-t border-gris-ligne">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gris-doux font-bold mb-3">
        Statistiques
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gris-texte">
            <Eye size={14} /> Vues
          </span>
          <b className="text-marine">{views.toLocaleString('fr-FR')}</b>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gris-texte">
            <Heart size={14} /> Soutiens
          </span>
          <b className="text-marine">{supports.toLocaleString('fr-FR')}</b>
        </div>
      </div>
    </div>
  );
}