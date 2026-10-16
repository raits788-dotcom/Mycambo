# 🔍 AUDIT — MyCAMBO

> Document de référence : état du projet, historique des corrections, plan de développement.
> Dernière mise à jour : 16 octobre 2026

---

## 📊 1. VUE D'ENSEMBLE DU PROJET

### Architecture
Monorepo Turborepo + pnpm workspaces :
Mycambo/
├── apps/
│ ├── web/ → Site public + espace partenaire + mon-compte
│ ├── admin/ → Console SuperAdmin (admin.mycambo.net)
│ └── landing/ → Landing page statique
├── packages/
│ ├── ui/ → Design system partagé (Button, Card, Badge, etc.)
│ ├── database/ → Client Supabase + types + admin client
│ ├── auth/ → Auth + impersonation
│ ├── config/ → TS, ESLint, Tailwind partagés
│ └── utils/ → Helpers (cn, formatDate, etc.)
└── supabase/
├── migrations/ → Schéma SQL (0001_init, 0002_rls, etc.)
├── functions/ → Edge Functions (send-email, impersonate-tenant, etc.)
└── seed.sql → Données de test

text

### Stack technique
- Next.js 15.1.6 + React 19 + TypeScript 5.5.3
- Tailwind CSS 3.4.6
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Turborepo + pnpm
- Déploiement : Cloudflare Pages + Workers (OpenNext)

### URLs
| Environnement | Site public | Console admin |
|---------------|-------------|---------------|
| Production | `https://dev.mycambo.net` | `https://admin.mycambo.net` |
| Local | `http://localhost:3000` | `http://localhost:3001` |

---

## 🎭 2. RÔLES & PERMISSIONS

| Rôle | Qui ? | Espace | Bandeau |
|------|-------|--------|---------|
| **Visiteur** | Grand public | `/` (site public) | Aucun |
| **Utilisateur** | Grand public inscrit | `/mon-compte` | Aucun |
| **Partenaire admin** | Chaque tenant | `/espace-partenaire` | 🟡 **Jaune** "MODE ADMIN PARTENAIRE" |
| **SuperAdmin** | raits788@gmail.com | `/admin` (console) | 🟣 **Violet** (impersonation) |

---

## 🗄️ 3. BASE DE DONNÉES (48 tables)

### Tables principales
| Table | Rôle |
|-------|------|
| `tenants` | Partenaires (commerces, associations, ONG) |
| `businesses` | Établissements (fiches publiques) |
| `categories` | Catégories (Hôtels, Restaurants, Associations, etc.) |
| `plans` | Formules d'abonnement (Découverte, Essentiel, Pro, Business, Entreprise, Association) |
| `subscriptions` | Abonnements souscrits |
| `payments` | Paiements |
| `partner_requests` | Demandes partenaires (wizard) |
| `tenant_verifications` | Dossiers de vérification |
| `reviews` | Avis |
| `label_catalog` | Catalogue des labels (Vérifié, Coup de cœur, Éco-responsable, etc.) |
| `tenant_labels` | Labels attribués aux tenants |
| `media_library` | Médiathèque |
| `notifications` | Notifications (admin + tenant + user) |
| `audit_logs` | Journal des actions admin |
| `user_mfa` | Configuration MFA |

### Tables supprimées (nettoyage)
- ❌ `messages` (vide, doublon de `contact_messages`)
- ❌ `active_sessions` (vide, doublon de `login_logs`)
- ❌ `verification_docs` (vide, doublon de `partner_documents`)
- ❌ `labels` (migré vers `label_catalog`)

---

## 📄 4. PAGES DU SITE

### 4.1 — Site public (24 pages)
| Route | Description |
|-------|-------------|
| `/` | Accueil |
| `/annuaire` | Annuaire global |
| `/rubrique/[type]` | Rubriques (hôtel, restaurant, association, etc.) |
| `/commerce/[slug]` | Fiche établissement (vue publique anonyme) |
| `/decouvrir/*` | 8 pages de découverte |
| `/annonces` | Annonces |
| `/emploi` | Emploi |
| `/influenceurs` | Influenceurs |
| `/partenaire` | Landing partenaire |
| `/partenaire/demande` | Wizard d'inscription partenaire (5 étapes) |
| `/partenaire/formules` | Formules d'abonnement |
| `/partenaire/faq` | FAQ |
| `/partenaire/temoignages` | Témoignages |
| `/connexion` | Connexion utilisateur |
| `/inscription` | Inscription utilisateur |
| `/confirmer-email` | Confirmation email |
| `/setup-mfa` | Configuration MFA |

### 4.2 — Espace partenaire (17 pages)
| Route | Description |
|-------|-------------|
| `/espace-partenaire/dashboard` | Vue d'ensemble |
| `/espace-partenaire/notifications` | Notifications |
| `/espace-partenaire/etablissements` | Liste des établissements |
| `/espace-partenaire/etablissements/nouveau` | Créer un établissement |
| `/espace-partenaire/etablissements/[slug]` | Gérer un établissement |
| `/espace-partenaire/etablissements/[slug]/apercu` | Aperçu public |
| `/espace-partenaire/demandes` | Demandes reçues |
| `/espace-partenaire/avis` | Avis |
| `/espace-partenaire/statistiques` | Statistiques |
| `/espace-partenaire/equipe` | Mon équipe |
| `/espace-partenaire/parrainage` | Parrainage |
| `/espace-partenaire/verification` | Vérification |
| `/espace-partenaire/profil` | Mon profil |
| `/espace-partenaire/parametres` | Paramètres |
| `/espace-partenaire/connexion` | Connexion partenaire |
| `/espace-partenaire/changer-mot-de-passe` | Changer mot de passe |

### 4.3 — Mon compte (6 pages)
| Route | Description |
|-------|-------------|
| `/mon-compte` | Vue d'ensemble |
| `/mon-compte/favoris` | Mes favoris |
| `/mon-compte/avis` | Mes avis |
| `/mon-compte/demandes` | Mes demandes |
| `/mon-compte/profil` | Mon profil |
| `/mon-compte/parametres` | Paramètres |

### 4.4 — Console admin (24 pages)
| Route | Description |
|-------|-------------|
| `/dashboard` | Vue d'ensemble |
| `/notifications` | Notifications admin |
| `/demandes` | Demandes partenaires |
| `/verifications` | Vérifications (3 onglets) |
| `/modifications` | Modifications |
| `/tenants` | Liste des tenants |
| `/tenants/[id]` | Détail tenant (avec impersonation) |
| `/etablissements` | Liste des établissements |
| `/coups-de-coeur` | Coups de cœur |
| `/formules` | Formules d'abonnement |
| `/abonnements` | Abonnements souscrits |
| `/paiements` | Paiements |
| `/parrainage` | Parrainage |
| `/cms` | CMS (pages, carrousel, médias) |
| `/statistiques` | Statistiques avancées |
| `/logs` | Logs & audit |
| `/roles` | Rôles |
| `/parametres` | Paramètres |
| `/storage` | Storage |
| `/setup-mfa` | Configuration MFA |
| `/connexion` | Connexion admin |

---

## 🔧 5. HISTORIQUE DES CORRECTIONS

### Session du 16 octobre 2026 — Corrections TypeScript + UX

| # | Fichier | Correction |
|---|---------|-----------|
| 1 | `CommerceTabs.tsx` | 5 imports corrigés (`@/components/partenaire/establishment/`) |
| 2 | `NotificationsDropdown.tsx` | Supprimé (obsolète, remplacé par `NotificationBell`) |
| 3 | `associations.ts` | Type `Review` enrichi (author_name, created_at, etc.) |
| 4 | `associations.ts` | Type `AssociationTeamMember` enrichi (position) |
| 5 | `associations.ts` | `getReviewsForAssociation` retourne les bonnes propriétés |
| 6 | `apercu/page.tsx` | snake_case (`long_description`), async, `JSON.stringify` |
| 7 | `AddEstablishmentWizard.tsx` | `addEstablishment(tenantId, payload)` |
| 8 | `partner.ts` | Type `PartnerReviewToModerate` enrichi (7 statuts) |
| 9 | `@types/qrcode` | Installé |
| 10 | `AssociationPhotos.tsx` | `caption \|\| ''` (3 endroits) |
| 11 | `WizardStep2Infos.tsx` | Comparaison `data.type !== ''` retirée |
| 12 | `ServicesTab.tsx` | `categories?.name` → mapping vers services |
| 13 | `etablissements/[slug]/page.tsx` | Props `DeleteEstablishmentModal` |
| 14 | `ReviewsSection.tsx` | `(item, i)` au lieu de `(count, i)` |
| 15 | `mfa.ts` | Types `qrcode` installés |

### Session du 16 octobre 2026 — Page publique + Bandes

| # | Fichier | Correction |
|---|---------|-----------|
| 1 | `CommerceTabsPublic.tsx` | **CRÉÉ** — Composant public anonyme (vue visiteur) |
| 2 | `commerce/[slug]/page.tsx` | Utilise `CommerceTabsPublic` au lieu de `CommerceTabs` |
| 3 | `Header.tsx` | Masque menu utilisateur sur `/commerce/[slug]` et pages auth |
| 4 | `espace-partenaire/(app)/layout.tsx` | **Bandeau jaune** pour partenaires |
| 5 | `tenants/[id]/page.tsx` (admin) | Fallback intelligent pour impersonation |

---

## 🚧 6. PROBLÈMES RESTANTS / À FAIRE

### 🔥 Priorité haute
- [ ] **Multi-établissements (Option C)** : Dashboard global + accès par établissement
- [ ] **Comptes test** : 1 hôtel + 1 restaurant pour tester les différences
- [ ] **Module paiement** : Validation manuelle SuperAdmin (virement, ABA)

### ⏳ Priorité moyenne
- [ ] **Suppression comptes inactifs** : 3/6 mois, configurable
- [ ] **Journal des connexions** : Temps réel + 30 jours
- [ ] **NotificationBell** : Vérifier sur toutes les pages

### ⏳ Priorité basse
- [ ] **Landing page** : Optimisation SEO
- [ ] **Tests E2E** : Playwright
- [ ] **Documentation** : Guide utilisateur

---

## 🔒 7. SÉCURITÉ

### Failles identifiées et corrigées
- ✅ **Page publique gardait la session** → `CommerceTabsPublic` créé
- ✅ **Header affichait menu partenaire sur pages auth** → `showAnonymousHeader`
- ✅ **Impersonation redirigeait vers localhost** → Fallback intelligent

### Bonnes pratiques
- ✅ Toutes les actions admin sont loggées dans `audit_logs`
- ✅ RLS activée sur toutes les tables
- ✅ MFA disponible pour les admins
- ✅ Tokens d'impersonation à durée limitée

---

## 🎯 8. WORKFLOW GLOBAL
┌─────────────────────────────────────────────────────────┐
│ 1. Partenaire remplit /partenaire/demande (wizard) │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 2. /demandes (admin) → Approuve │
│ → Crée tenant + user + envoie credentials │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 3. Partenaire se connecte à /espace-partenaire │
│ → Bandeau JAUNE s'affiche │
│ → Change mot de passe │
│ → Choisit une formule │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 4. Partenaire crée ses établissements │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 5. Partenaire soumet son dossier de vérification │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 6. /verifications (admin) → Valide la qualité │
│ → Approuve → Badge Bronze │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 6.5. PAIEMENT (à implémenter) │
│ → Validation manuelle SuperAdmin │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ 7. Établissement publié dans l'annuaire (Bronze) │
└─────────────────────────────────────────────────────────┘

text

---

## 📞 9. CONTACTS & RESSOURCES

- **SuperAdmin** : raits788@gmail.com
- **Supabase** : https://jxfdwjwpsqvgczywipff.supabase.co
- **Cloudflare** : Workers `mycambo-web-worker`, `mycambo-admin-worker`
- **GitHub** : https://github.com/raits788-dotcom/Mycambo

---

## 📝 10. NOTES POUR LA SUITE

### Règles de développement
1. **Toujours faire un audit** avant de modifier un fichier
2. **Tester `tsc --noEmit` + `build`** avant chaque commit
3. **Un commit par correction** pour pouvoir revenir en arrière
4. **Documenter** chaque modification dans ce fichier

### Ordre de priorité
1. 🔥 **Multi-établissements** (Option C)
2. 🔥 **Comptes test** (hôtel + restaurant)
3. 🔥 **Module paiement**
4. ⏳ Suppression comptes inactifs
5. ⏳ Journal des connexions