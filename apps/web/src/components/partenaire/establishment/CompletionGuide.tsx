'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import type { PlanPermissions } from '@/lib/plan-permissions';

// Un item de la checklist de complétude.
type GuideItem = {
  id: string;
  tab: string; // onglet cible (clé TabId de EstablishmentTabs)
  title: string;
  hint?: string;
  done: boolean;
  level: 'req' | 'plan' | 'opt';
  badge?: string;
};

function isAssociation(est: StoredEstablishment): boolean {
  const name = (est as any).categories?.name?.toLowerCase() || '';
  return name.includes('association');
}

/**
 * Construit la liste des items selon la catégorie et la formule.
 * On ne compte dans la complétude que les items pertinents affichés.
 */
function buildItems(est: StoredEstablishment, perms: PlanPermissions): GuideItem[] {
  const e = est as any;
  const asso = isAssociation(est);
  const photosCount = Array.isArray(e.photos) ? e.photos.length : 0;
  const maxPhotos = perms.maxPhotos ?? 0;

  const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  const hasArr = (v: unknown) => Array.isArray(v) && v.length > 0;
  const hasContact = hasText(e.phone) || hasText(e.email) || hasText(e.website);
  const hasHours = e.hours && Object.keys(e.hours || {}).length > 0;

  const items: GuideItem[] = [];

  // Toujours : nom + catégorie (déjà renseigné à l'inscription)
  items.push({ id: 'name', tab: 'info', title: 'Nom & catégorie', done: hasText(e.name), level: 'req' });

  // Description détaillée (requis)
  items.push({
    id: 'desc', tab: 'info', title: 'Description détaillée',
    hint: asso ? 'Présentez votre association' : 'Présentez votre établissement',
    done: hasText(e.long_description) || hasText(e.description),
    level: 'req',
  });

  // Photos (limite = formule)
  items.push({
    id: 'photos', tab: 'photos', title: maxPhotos <= 1 ? 'Ajouter une photo' : 'Ajouter des photos',
    hint: maxPhotos > 0 ? `${photosCount} / ${maxPhotos} ajoutée${photosCount > 1 ? 's' : ''}` : 'Non disponible sur cette formule',
    done: photosCount > 0,
    level: 'plan',
    badge: maxPhotos > 0 ? `${maxPhotos} max · formule` : undefined,
  });

  // Coordonnées de contact
  items.push({
    id: 'contact', tab: 'info', title: 'Coordonnées de contact',
    hint: 'Téléphone, email, site web',
    done: hasContact, level: 'req',
  });

  if (asso) {
    // Façons de soutenir (déjà pré-activées en général)
    items.push({
      id: 'support', tab: 'support', title: 'Façons de nous soutenir',
      hint: 'Don, bénévolat, adhésion…',
      done: hasArr(e.support_options) && (e.support_options as any[]).some((o) => o?.enabled),
      level: 'opt', badge: 'recommandé',
    });
    // Enrichissements (projets / histoire / équipe) — un seul item groupé
    items.push({
      id: 'enrich', tab: 'history', title: 'Votre histoire, équipe, impact',
      hint: 'Enrichit la fiche et renforce la confiance',
      done: hasArr(e.history) || hasArr(e.public_team) || hasArr(e.impact),
      level: 'opt', badge: 'optionnel',
    });
  } else {
    // Commerce : horaires + services
    items.push({
      id: 'hours', tab: 'info', title: 'Horaires d’ouverture',
      hint: 'Jours et heures', done: !!hasHours, level: 'opt',
    });
    items.push({
      id: 'services', tab: 'services', title: 'Vos services',
      hint: 'Prestations proposées',
      done: hasArr(e.services), level: 'opt',
    });
  }

  return items;
}

export default function CompletionGuide({
  establishment,
  permissions,
  onGoToTab,
  onUpgrade,
}: {
  establishment: StoredEstablishment;
  permissions: PlanPermissions;
  onGoToTab: (tab: string) => void;
  onUpgrade?: () => void;
}) {
  const asso = isAssociation(establishment);
  const items = useMemo(() => buildItems(establishment, permissions), [establishment, permissions]);
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const complete = pct >= 100;

  // À 100 % : bandeau réduit, dépliable (Option A validée).
  const [collapsed, setCollapsed] = useState(complete);

  if (complete && collapsed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-green-800">
          <CheckCircle2 size={18} /> Fiche complète — bien joué&nbsp;!
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs font-bold text-green-700 flex items-center gap-1 hover:underline"
        >
          Voir le détail <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gris-ligne rounded-2xl overflow-hidden shadow-cb-sm mb-6">
      <div
        className="px-5 py-4 text-white"
        style={{
          background: complete
            ? 'linear-gradient(135deg,#15803d,#22c55e)'
            : 'linear-gradient(135deg,#1a3a6b,#24508c)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base mb-0.5">
              {complete ? 'Votre fiche est complète ✓' : `Complétez votre fiche ${asso ? '🌱' : '🏪'}`}
            </h3>
            <p className="text-xs opacity-90">
              {complete
                ? 'Tous les éléments recommandés sont renseignés.'
                : 'Plus elle est complète, plus elle inspire confiance.'}
            </p>
          </div>
          {complete && (
            <button onClick={() => setCollapsed(true)} className="text-white/80 hover:text-white">
              <ChevronUp size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-2.5 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-green-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="font-extrabold text-sm min-w-[38px] text-right">{pct}%</div>
        </div>
      </div>

      <div>
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => !it.done && onGoToTab(it.tab)}
            className={`w-full flex items-center gap-3 px-5 py-3 border-b border-gris-fond last:border-b-0 text-left transition-colors ${
              it.done ? 'cursor-default' : 'hover:bg-gris-fond cursor-pointer'
            }`}
          >
            {it.done ? (
              <CheckCircle2 size={20} className="text-vert shrink-0" />
            ) : (
              <Circle size={20} className="text-gris-ligne shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className={`font-bold text-sm ${it.done ? 'text-gris-doux line-through' : 'text-marine'}`}>
                {it.title}
                {it.badge && (
                  <span
                    className={`ml-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                      it.level === 'req'
                        ? 'bg-red-50 text-red-700'
                        : it.level === 'plan'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-gris-fond text-gris-texte'
                    }`}
                  >
                    {it.badge}
                  </span>
                )}
                {it.level === 'req' && !it.badge && (
                  <span className="ml-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase bg-red-50 text-red-700">requis</span>
                )}
              </div>
              {it.hint && <div className="text-[11px] text-gris-doux mt-0.5">{it.hint}</div>}
            </div>
            {!it.done && <ArrowRight size={16} className="text-gris-doux shrink-0" />}
          </button>
        ))}
      </div>

      {/* Incitation upgrade pour les commerces non premium */}
      {!asso && onUpgrade && (
        <div className="px-5 py-4 bg-green-50 border-t border-gris-ligne">
          <p className="text-xs text-gris-texte mb-2 leading-relaxed">
            💡 Votre formule actuelle est limitée. <strong>Passez à une formule supérieure</strong> pour
            débloquer plus de photos, les statistiques détaillées et la mise en avant.
          </p>
          <button
            onClick={onUpgrade}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold bg-vert text-white py-2.5 rounded-full hover:opacity-90"
          >
            <Sparkles size={14} /> Voir les formules
          </button>
        </div>
      )}
    </div>
  );
}
