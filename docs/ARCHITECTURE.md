# Architecture — Tarikh.ma

**Plateforme d’archives numériques pour la valorisation du patrimoine historique marocain.**

Document d’architecture technique aligné sur le **cahier des charges** et les maquettes Stitch.

---

## 1. Contexte et objectifs (CDC)

- **Contexte** : Plateforme web dédiée à la valorisation du patrimoine historique marocain via des archives numériques en ligne (base > 10 000 documents : textes, images, cartes, vidéos, audio).
- **Objectifs** :
  - Centraliser les archives marocaines dans une seule plateforme
  - Faciliter l’accès à l’information historique
  - Expérience utilisateur moderne
  - **Consultation en ligne uniquement (sans téléchargement)**
  - Plateforme évolutive à long terme

---

## 2. Stack technique (choix projet — CDC §7 + maquettes Stitch)

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Back-end** | **Laravel (PHP 8+)** | API REST, auth Sanctum, logique métier, **stream sécurisé** des fichiers (aucun lien direct) |
| **Base de données** | **MySQL 8** | Documents, thèmes, régions, tags, users |
| **Front-end** | **React (Vite) + TypeScript + Tailwind** | SPA **alignée sur les maquettes Stitch** : design system (couleurs, typo), pages public + admin, expérience moderne |
| **Auth** | **Laravel Sanctum** | Token API pour le front React (login/register, routes protégées) |
| **Stockage** | Serveur privé (Laravel `storage/`) | Fichiers ; accès **uniquement** via API Laravel (stream inline, pas de téléchargement) |

**Design system (Stitch)** : primary `#11d483`, background-light `#fcfaf7`, background-dark `#10221a`, parchment, gold-accent ; polices Work Sans + Playfair Display ; Material Symbols pour les icônes.

---

## 3. Périmètre fonctionnel (CDC §2–5)

### 3.1 Types de contenus

- Documents textuels (PDF, manuscrits, lettres)
- Images (photos, scans, illustrations)
- Cartes géographiques
- Vidéos
- Fichiers audio

### 3.2 Front-office (utilisateur)

- **Accueil** : présentation du projet, documents récents, accès aux catégories
- **Consultation** : visionneuse intégrée (PDF, image, vidéo) ; lecture dans le navigateur ; **aucun téléchargement** ; streaming sécurisé
- **Recherche** : simple (mot-clé) et avancée (type, année/période, thématique, région, langue)
- **Navigation** : menu par catégories, fil d’Ariane, documents similaires

### 3.3 Fiche document (CDC §4)

Chaque document contient : **titre**, **description**, **type**, **année ou période**, **thème**, **région**, **langue**, **mots-clés**, **compteur de vues**.

### 3.4 Back-office (admin)

- **Documents** : ajouter, modifier, supprimer ; associer thèmes, régions, tags
- **Utilisateurs** : Administrateurs, Éditeurs, Lecteurs
- **Statistiques** : nombre de documents, nombre de consultations, documents les plus vus

---

## 4. Contraintes de sécurité (CDC §6)

### 4.1 Protection du contenu

- **Aucun lien direct** vers les fichiers (pas d’URL publique vers `storage/` ou disque).
- **Accès uniquement via contrôleur Laravel** (ex. `GET /documents/{id}/stream`) qui vérifie les droits et envoie le flux (response `Content-Disposition: inline` sans proposer de téléchargement).
- **Blocage clic droit** (JavaScript).
- **Désactivation copier/coller** (JavaScript sur la zone visionneuse).
- **Watermark discret** sur images et vidéos (overlay ou traitement côté serveur).

### 4.2 Sécurité serveur

- Authentification sécurisée (Laravel Sanctum ou session).
- Protection contre le scraping (rate limit, éventuellement CAPTCHA sur actions sensibles).
- **Limitation de requêtes (rate limit)** Laravel sur les routes de consultation et API.

---

## 5. Modèle de données (CDC §8)

### 5.1 Table principale : `documents`

| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint PK | |
| title | string | Titre |
| description | text | Description |
| type | string/enum | PDF, image, carte, vidéo, audio |
| year | string ou int | Année ou période |
| region_id | FK nullable | Référence `regions.id` |
| theme_id | FK nullable | Référence `themes.id` |
| language | string | Langue |
| file_path | string | Chemin stockage (privé) |
| views_count | int default 0 | Compteur de vues |
| created_at, updated_at | timestamps | |

### 5.2 Tables secondaires

- **themes** : id, name, slug, created_at, updated_at
- **regions** : id, name, slug, created_at, updated_at
- **tags** : id, name, slug, created_at, updated_at
- **document_tag** : document_id, tag_id (table pivot)
- **users** : id, name, email, password, role (enum ou FK : admin, editor, reader), created_at, updated_at

### 5.3 Optionnel (évolutivité CDC §12)

- **document_views** : document_id, user_id (nullable), ip, viewed_at — pour statistiques détaillées
- **favorites** : user_id, document_id — pour “Favoris” (v2)

---

## 6. Architecture logicielle : Laravel API + Frontend React (Stitch)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    NAVIGATEUR (Desktop / Mobile)          │
                    └───────────────────────────┬───────────────────────────────┘
                                                │ HTTPS
                    ┌───────────────────────────▼───────────────────────────────┐
                    │  FRONTEND React (Vite) — Design Stitch                    │
                    │  • Accueil, À propos, Exploration, Visionneuse            │
                    │  • Admin : Dashboard, Documents, Utilisateurs, Stats      │
                    │  • Tailwind (primary, parchment, Work Sans, Playfair)     │
                    └───────────────────────────┬───────────────────────────────┘
                                                │ REST API + Sanctum (Bearer)
                    ┌───────────────────────────▼───────────────────────────────┐
                    │  LARAVEL — API Backend                                    │
                    │  • routes/api.php : auth, documents, themes, regions       │
                    │  • GET /documents/{id}/stream (fichier inline, sécurisé)   │
                    │  • Sanctum : login, register, user, logout                 │
                    └───┬─────────────────────────────────────────────┬────────┘
                        │                                               │
            ┌───────────▼──────┐                          ┌─────────────▼─────────┐
            │     MySQL 8      │                          │  storage/app/documents │
            │  documents,      │                          │  Accès via contrôleur │
            │  themes, regions,│                          │  uniquement (stream)  │
            │  tags, users     │                          └───────────────────────┘
            └──────────────────┘
```

### 6.1 Backend Laravel (dossier `laravel/` ou projet Laravel déployé)

```
laravel/
├── app/Http/Controllers/
│   ├── Api/                    # API pour le front React
│   │   ├── AuthController.php  # login, register, user, logout (Sanctum)
│   │   ├── DocumentController.php
│   │   └── Admin/              # CRUD documents, users, stats (auth:sanctum + role)
│   ├── DocumentController.php  # web : stream sécurisé (optionnel si stream via API)
│   └── ...
├── routes/
│   ├── web.php                 # Blade (optionnel) ou redirect SPA
│   └── api.php                 # API consommée par React
└── ...
```

### 6.2 Frontend React — design Stitch (dossier `frontend/`)

```
frontend/
├── src/
│   ├── components/   # Layout, Header, Footer, CardDocument, SidebarFilters
│   ├── pages/       # Accueil, APropos, Archives, DocumentView, Login, Admin/*
│   ├── api/         # client axios (baseURL Laravel), auth (token)
│   ├── styles/      # tailwind.config (couleurs Stitch, fonts)
│   └── ...
├── tailwind.config.js   # primary #11d483, background-light, parchment, gold-accent
└── ...
```

---

## 7. Performance (CDC §9)

- **Temps de chargement < 2 secondes** : optimisation requêtes, cache, assets.
- **Pagination** : sur la liste des documents (Laravel `->paginate()`).
- **Cache Laravel** : Cache::remember() sur listes (thèmes, régions), pages d’accueil, agrégations stats.
- **Index MySQL** : index sur `documents.type`, `documents.year`, `documents.region_id`, `documents.theme_id`, `documents.created_at`.
- **Lazy loading** : médias (images, iframe vidéo) en lazy load dans les vues.

---

## 8. SEO et accessibilité (CDC §10–11)

- **SEO** : URLs propres (slug document), métadonnées (title, description), sitemap, balises structurées.
- **Accessibilité** : design responsive, compatible mobile/tablette, police lisible, contraste élevé.

---

## 9. Synthèse écrans Stitch → implémentation

| Écran Stitch | Backend Laravel | Frontend React |
|--------------|------------------|----------------|
| Accueil, À propos | — | Pages `Accueil`, `APropos` (hero, mission cards, timeline) |
| Exploration des archives | `GET /api/documents` (filtres, pagination) | Page `Archives` (sidebar filtres, grille cartes) |
| Visionneuse / Liseuse | `GET /api/documents/{id}`, `GET /documents/{id}/stream` | Page `DocumentView` (reader, métadonnées, similaires, anti-copier) |
| Admin – Documents | `GET/POST/PUT/DELETE /api/admin/documents` | Pages admin `Documents` (liste, formulaire ajout/édition) |
| Admin – Utilisateurs | `GET/POST/PUT/DELETE /api/admin/users` | Page admin `Utilisateurs` |
| Admin – Statistiques | `GET /api/admin/stats` | Page admin `Dashboard` (KPIs, documents les plus vus) |

L’architecture **Laravel (API) + React (design Stitch)** respecte le CDC et les maquettes pour une expérience moderne et maintenable.
