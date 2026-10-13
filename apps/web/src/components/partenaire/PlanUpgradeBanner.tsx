'use client';

import Link from 'next/link';
import { Sparkles, X, Lock } from 'lucide-react';
import { useState } from 'react';

interface Props {
  planName: string;
  maxPhotos: number;
  maxEstablishments: number;
  isDismissible?: boolean;
}

export function PlanUpgradeBanner({
  planName,
  maxPhotos,
  maxEstablishments,
  isDismissible = true,
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (planName !== 'Découverte' || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
      <Sparkles size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-bold text-amber-900 text-sm mb-1">
          Vous êtes sur la formule {planName} (gratuite)
        </div>
        <div className="text-xs text-amber-800 leading-relaxed space-y-0.5">
          <div>• {maxEstablishments} établissement</div>
          <div>• <Lock size={10} className="inline" /> Photos masquées du public</div>
          <div>• <Lock size={10} className="inline" /> Statistiques non disponibles</div>
        </div>
        <Link
          href="/partenaire/formules"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline mt-2"
        >
          Débloquer toutes les fonctionnalités →
        </Link>
      </div>
      {isDismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-900 flex-shrink-0"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}