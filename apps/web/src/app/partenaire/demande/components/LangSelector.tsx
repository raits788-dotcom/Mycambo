'use client';

// Sélecteur de langue du wizard (🇫🇷 FR · 🇬🇧 EN · 🇰🇭 ខ្មែរ).
// Présent dès l'étape 1, persistant sur toutes les étapes.

import { WIZARD_LANGS } from '../i18n';
import { useWizardLang } from '../WizardLangContext';

export default function LangSelector() {
  const { lang, setLang, t } = useWizardLang();

  return (
    <div
      className="inline-flex items-center bg-gris-fond border border-gris-ligne rounded-full p-0.5 gap-0.5"
      role="group"
      aria-label={t.lang_aria}
    >
      {WIZARD_LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            className={
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ' +
              (active
                ? 'bg-marine text-white'
                : 'text-gris-texte hover:text-marine')
            }
          >
            <span aria-hidden>{l.flag}</span>
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
