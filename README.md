# 🇰🇭 My Cambo

Plateforme numérique dédiée au Cambodge : annuaire commercial, culture,
vie locale, annonces et emploi.

## 🏗️ Architecture

Monorepo Turborepo + pnpm workspaces :

\`\`\`
my-cambo/
├── apps/
│   ├── web/       Site public + espace partenaire
│   └── admin/     Console SuperAdmin
├── packages/
│   ├── ui/        Design system partagé
│   ├── database/  Client Supabase + types
│   ├── auth/      Auth + impersonation
│   ├── config/    TS, ESLint, Tailwind partagés
│   └── utils/     Helpers (cn, formatDate, etc.)
└── supabase/
    └── migrations/  Schéma SQL
\`\`\`

## 🚀 Démarrage

\`\`\`bash
# Installer les dépendances
pnpm install

# Lancer toutes les apps en mode dev
pnpm dev

# Lancer seulement le site web
pnpm --filter web dev

# Lancer seulement la console admin
pnpm --filter admin dev

# Build pour production
pnpm build
\`\`\`

## 🎨 Charte graphique

- **Marine** : `#1B3A6B`
- **Rouge khmer** : `#E63329`
- **Typo** : Inter

## 📦 Stack technique

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)
- Turborepo + pnpm
- Déploiement : Cloudflare Pages

## 📄 Licence

Propriétaire — Tous droits réservés.
