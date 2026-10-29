'use client';

import { Heart, Users, Baby, Ticket, Building2, ShoppingBag, ExternalLink } from 'lucide-react';

type Option = { type: string; enabled: boolean; description?: string; url?: string };

interface Props {
  options: Option[];
  onDonate?: () => void;
  onVolunteer?: () => void;
}

const META: Record<string, { label: string; icon: any; color: string }> = {
  don: { label: 'Faire un don', icon: Heart, color: 'text-red-500 bg-red-100' },
  parrainage: { label: 'Parrainer un enfant', icon: Baby, color: 'text-purple-600 bg-purple-100' },
  benevolat: { label: 'Devenir bénévole', icon: Users, color: 'text-green-600 bg-green-100' },
  adhesion: { label: 'Adhérer', icon: Ticket, color: 'text-orange-600 bg-orange-100' },
  mecenat: { label: 'Mécénat entreprise', icon: Building2, color: 'text-marine bg-blue-100' },
  boutique: { label: 'Boutique solidaire', icon: ShoppingBag, color: 'text-amber-700 bg-amber-100' },
};

export default function SupportSection({ options, onDonate, onVolunteer }: Props) {
  const active = (options || []).filter((o) => o.enabled);
  if (active.length === 0) return null;

  return (
    <div>
      <h3 className="font-extrabold text-marine text-base mb-1">Nous soutenir</h3>
      <p className="text-xs text-gris-doux mb-5">
        Plusieurs façons d&apos;aider notre association.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {active.map((o) => {
          const m = META[o.type] || { label: o.type, icon: Heart, color: 'text-marine bg-blue-100' };
          const Icon = m.icon;

          // Action : don et bénévolat ouvrent les modals existants ;
          // les autres suivent leur lien si fourni.
          const clickable = o.type === 'don' || o.type === 'benevolat' || !!o.url;
          const onClick = () => {
            if (o.type === 'don' && onDonate) onDonate();
            else if (o.type === 'benevolat' && onVolunteer) onVolunteer();
            else if (o.url) window.open(o.url, '_blank', 'noopener,noreferrer');
          };

          return (
            <div
              key={o.type}
              className={`border border-gris-ligne rounded-xl p-4 flex flex-col ${
                clickable ? 'hover:border-marine/50 cursor-pointer' : ''
              }`}
              onClick={clickable ? onClick : undefined}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
                <Icon size={18} />
              </div>
              <div className="font-bold text-marine text-sm flex items-center gap-1.5">
                {m.label}
                {o.url && <ExternalLink size={12} className="text-gris-doux" />}
              </div>
              {o.description && (
                <p className="text-xs text-gris-texte mt-1">{o.description}</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gris-doux mt-5 text-center">
        Aucun paiement sur myCAMBO — mise en relation uniquement.
      </p>
    </div>
  );
}
