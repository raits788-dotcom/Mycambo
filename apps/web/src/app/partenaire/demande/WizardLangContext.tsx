'use client';

// ============================================================================
// Contexte de langue du wizard partenaire
// ----------------------------------------------------------------------------
// - Langue par défaut = langue du navigateur (si FR/EN/KH dispo, sinon FR).
// - Le choix de l'utilisateur est mémorisé entre visites (localStorage).
// - Fournit `t` (dictionnaire de la langue active) + `lang` + `setLang`.
// ============================================================================

import { createContext, useContext, useEffect, useState } from 'react';
import {
  WIZARD_DICTS,
  DEFAULT_LANG,
  type WizardLang,
  type WizardDict,
} from './i18n';

const STORAGE_KEY = 'mycambo_wizard_lang';

interface Ctx {
  lang: WizardLang;
  setLang: (l: WizardLang) => void;
  t: WizardDict;
}

const WizardLangContext = createContext<Ctx | null>(null);

// Détecte la langue préférée : localStorage > navigateur > défaut.
function detectLang(): WizardLang {
  if (typeof window === 'undefined') return DEFAULT_LANG;

  // 1. Choix mémorisé entre visites
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en' || saved === 'kh') return saved;
  } catch {
    /* localStorage indispo (navigation privée) → on continue */
  }

  // 2. Langue du navigateur
  try {
    const nav = (navigator.languages || [navigator.language || ''])
      .map((l) => l.toLowerCase());
    for (const l of nav) {
      if (l.startsWith('fr')) return 'fr';
      if (l.startsWith('en')) return 'en';
      if (l.startsWith('km') || l.startsWith('kh')) return 'kh'; // km = code ISO du khmer
    }
  } catch {
    /* ignore */
  }

  // 3. Défaut
  return DEFAULT_LANG;
}

export function WizardLangProvider({ children }: { children: React.ReactNode }) {
  // Rendu serveur + 1er rendu client : DEFAULT_LANG (évite un mismatch
  // d'hydratation). La vraie langue est appliquée juste après le montage.
  const [lang, setLangState] = useState<WizardLang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (l: WizardLang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return (
    <WizardLangContext.Provider value={{ lang, setLang, t: WIZARD_DICTS[lang] }}>
      {children}
    </WizardLangContext.Provider>
  );
}

// Hook d'accès. `t` = dictionnaire de la langue active.
export function useWizardLang(): Ctx {
  const ctx = useContext(WizardLangContext);
  if (!ctx) {
    // Fallback défensif si un composant est monté hors provider.
    return { lang: DEFAULT_LANG, setLang: () => {}, t: WIZARD_DICTS[DEFAULT_LANG] };
  }
  return ctx;
}
