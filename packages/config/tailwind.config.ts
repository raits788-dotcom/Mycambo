import type { Config } from 'tailwindcss';

const config: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        marine: { DEFAULT: '#1B3A6B', dark: '#12294D', light: '#2C5599' },
        khmer: '#E63329',
        'acc-hotel': '#2C5599',
        'acc-restaurant': '#F07C29',
        'acc-activite': '#35A85B',
        'acc-evenement': '#E5407A',
        'acc-transport': '#2C82D6',
        'acc-association': '#E5407A',
        'acc-emploi': '#2C5599',
        'acc-influenceur': '#1B3A6B',
        'acc-annonceur': '#D9A441',
        'acc-installer': '#35A85B',
        'acc-voyage': '#2C82D6',
        'acc-explorer': '#7B3FE4',
        'ic-bleu': '#2C82D6',
        'ic-vert': '#35A85B',
        'ic-orange': '#F07C29',
        'ic-violet': '#7B3FE4',
        'ic-rose': '#E5407A',
        'ic-or': '#D9A441',
        'ic-cyan': '#14A5A0',
        ink: '#16233A',
        'gris-texte': '#5A6B85',
        'gris-doux': '#8A99B0',
        'gris-ligne': '#E4E9F2',
        'gris-fond': '#F4F7FB',
      },
      fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '22px' },
      boxShadow: {
        'cb-sm': '0 1px 3px rgba(22, 35, 58, .07)',
        'cb-md': '0 4px 16px rgba(22, 35, 58, .09)',
        'cb-lg': '0 10px 34px rgba(22, 35, 58, .14)',
      },
      maxWidth: { wrap: '1500px' },
      transitionTimingFunction: { cb: 'cubic-bezier(.2, .7, .2, 1)' },
    },
  },
  plugins: [],
};

export default config;
