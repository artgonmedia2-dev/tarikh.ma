# Tâches étape par étape — Tarikh.ma

Liste de tâches ordonnées pour construire le projet **conformément au cahier des charges** (Laravel, MySQL 8, frontend React design Stitch).

---

## Statut d’implémentation (appliqué)

| Phase | Statut | Détail |
|-------|--------|--------|
| 0 | ✅ | Cadrage, stack Laravel + React, docker-compose MySQL, squelette Laravel + script setup |
| 1 | ✅ | Migrations themes, regions, tags, documents, document_tag, role users ; modèles ; seed ThemeRegionSeeder |
| 2 | ✅ | Layout React, Accueil, À propos, fil d’Ariane (Breadcrumb) |
| 3 | ✅ | Liste documents paginée, recherche (q), filtres type/thème/région/année/langue, fiche document, views_count, documents similaires |
| 4 | ✅ | Stream sécurisé (route API), visionneuse PDF/image/vidéo/audio, anti-copier (clic droit, copier, glisser), watermark CSS |
| 5 | ✅ | Auth Sanctum (login/register), middleware rôle, layout admin, dashboard KPIs (documents, consultations, users, plus vus) |
| 6 | ✅ | Admin CRUD documents (liste, créer, modifier, supprimer), upload fichier, stockage storage/app/documents/ |
| 7 | ✅ | Admin CRUD utilisateurs (liste, créer, modifier, supprimer), rôles admin/editor/reader |
| 8 | ✅ | Cache thèmes/régions (1h), index documents (migration), pagination partout, lazy loading image visionneuse, SEO meta (title, description) |
| 9 | ✅ | Rate limiting API (60/min public, 10/min login/register, 120/min stream) |
| 10 | ✅ | README, ARCHITECTURE.md, TACHES_ETAPES.md ; manuel utilisateur à rédiger (phase 10.2) |

---

## Phase 0 — Cadrage et environnement

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 0.1 | Dépôts et structure | Créer repo, branches `main` / `develop` | Repo prêt |
| 0.2 | Stack | Valider stack CDC : Laravel (PHP 8+), MySQL 8, Blade + Alpine.js | Stack documentée (ARCHITECTURE.md) |
| 0.3 | Environnement dev | PHP 8.2+, Composer, MySQL 8 (Docker ou local) | `docker-compose.yml` ou README d’install |
| 0.4 | Projet Laravel | `composer create-project laravel/laravel` ou squelette fourni | Dossier Laravel prêt |

---

## Phase 1 — Base de données et modèles (CDC §8)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 1.1 | Migration `themes` | id, name, slug, timestamps | `database/migrations/xxxx_create_themes_table.php` |
| 1.2 | Migration `regions` | id, name, slug, timestamps | `database/migrations/xxxx_create_regions_table.php` |
| 1.3 | Migration `tags` | id, name, slug, timestamps | `database/migrations/xxxx_create_tags_table.php` |
| 1.4 | Migration `documents` | id, title, description, type, year, region_id, theme_id, language, file_path, views_count, timestamps | Migration + index (type, year, region_id, theme_id) |
| 1.5 | Migration `document_tag` | document_id, tag_id (pivot) | Table pivot |
| 1.6 | Migration `users` (étendre) | Ajouter role (enum ou FK : admin, editor, reader) si pas déjà présent | Migration |
| 1.7 | Modèles Eloquent | Document, Theme, Region, Tag, User avec relations (belongsTo, belongsToMany) | `app/Models/` |
| 1.8 | Seed | Thèmes et régions de base (optionnel : documents de test) | `database/seeders/` |

---

## Phase 2 — Front-office : accueil et pages statiques

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 2.1 | Layout Blade | Layout principal (header, nav, footer), Tailwind ou CSS | `resources/views/layouts/app.blade.php` |
| 2.2 | Page Accueil | Présentation du projet, mise en avant documents récents, accès catégories (CDC §3.1) | Route `/`, `HomeController@index`, vue `home` |
| 2.3 | Page À propos | Présentation, mission, genèse (aligné maquettes Stitch) | Route `/a-propos`, vue `about` |
| 2.4 | Fil d’Ariane | Composant Blade (breadcrumb) réutilisable | Inclus dans layout ou composant |

---

## Phase 3 — Consultation des documents (CDC §3.2, §4)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 3.1 | Liste des documents | Pagination, cartes (titre, type, année, région, compteur vues) | `DocumentController@index`, vue `documents/index` |
| 3.2 | Moteur de recherche simple | Recherche par mot-clé (titre, description, mots-clés) | Paramètre `q`, scope ou where LIKE |
| 3.3 | Recherche avancée (filtres) | Filtres : type, année/période, thématique, région, langue (CDC §3.3) | Formulaire + query builder, Alpine.js pour UX |
| 3.4 | Fiche document | Page détail : titre, description, type, année, thème, région, langue, mots-clés, compteur de vues (CDC §4) | `DocumentController@show`, vue `documents/show` |
| 3.5 | Incrémenter `views_count` | À chaque consultation (middleware ou dans `show`) | Compteur à jour |
| 3.6 | Documents similaires | Suggestions (même thème ou région) en bas de fiche | Requête Eloquent, section dans vue |

---

## Phase 4 — Visionneuse et streaming sécurisé (CDC §3.2, §6)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 4.1 | Route de stream | Accès fichier **uniquement via contrôleur** (aucun lien direct) | Route `GET /documents/{id}/stream` (ou `/documents/{id}/file`) |
| 4.2 | Contrôleur stream | Lire fichier depuis `storage/app/documents/`, renvoyer avec `Content-Disposition: inline`, pas de téléchargement | `DocumentController@stream` ou `DocumentStreamService` |
| 4.3 | Visionneuse PDF | Intégrer viewer (ex. PDF.js) dans Blade, URL = route stream | Vue visionneuse, pas de lien de téléchargement |
| 4.4 | Visionneuse Image / Vidéo | Balise `<img src="{{ route('documents.stream', $doc) }}">` ou `<video>` avec même URL | Lecture directe dans le navigateur |
| 4.5 | Blocage clic droit / copier-coller | JavaScript sur zone visionneuse (CDC §6.1) | Script Alpine ou JS vanilla |
| 4.6 | Watermark | Overlay discret sur images et vidéos (CSS ou génération côté serveur) | Appliqué dans vue ou service |

---

## Phase 5 — Back-office : auth et accès (CDC §5)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 5.1 | Auth Laravel | Login / logout (sessions ou Sanctum) | `AuthController`, routes `login`, `logout` |
| 5.2 | Middleware rôle | Vérifier admin / éditeur pour routes `admin/*` | Middleware `EnsureUserIsAdmin` ou `role:admin,editor` |
| 5.3 | Layout admin | Sidebar (Dashboard, Documents, Utilisateurs, Statistiques), header avec user | `resources/views/layouts/admin.blade.php` |
| 5.4 | Dashboard admin | KPIs : nombre de documents, nombre de consultations, documents les plus vus (CDC §5.3) | `Admin\DashboardController` ou `StatsController`, vue `admin/dashboard` |

---

## Phase 6 — Back-office : gestion des documents (CDC §5.1)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 6.1 | Liste admin des documents | Table avec titre, type, année, région, thème, vues, actions (modifier, supprimer) | `Admin\DocumentController@index` |
| 6.2 | Ajouter un document | Formulaire : upload fichier + titre, description, type, année, thème, région, langue, tags | `Admin\DocumentController@create` / `@store` |
| 6.3 | Modifier un document | Même formulaire, pré-rempli ; possibilité de changer le fichier | `Admin\DocumentController@edit` / `@update` |
| 6.4 | Supprimer un document | Soft delete ou suppression réelle + suppression fichier disque | `Admin\DocumentController@destroy` |
| 6.5 | Stockage des fichiers | Enregistrer dans `storage/app/documents/` (ou sous-dossiers par type), enregistrer `file_path` en BDD | Validation (type MIME, taille), Store facade |

---

## Phase 7 — Back-office : utilisateurs et rôles (CDC §5.2)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 7.1 | Liste des utilisateurs | Table : nom, email, rôle, dernière connexion (optionnel) | `Admin\UserController@index` |
| 7.2 | Créer / éditer utilisateur | Formulaire avec rôle (Administrateur, Éditeur, Lecteur) | `Admin\UserController@create`, `@store`, `@edit`, `@update` |
| 7.3 | Policy ou middleware | Restreindre accès admin (seuls admin peuvent gérer users) | Policy `UserPolicy` ou middleware |

---

## Phase 8 — Performance, SEO, accessibilité (CDC §9–11)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 8.1 | Cache Laravel | Cache listes thèmes/régions, page accueil, stats dashboard | `Cache::remember()` |
| 8.2 | Index MySQL | Vérifier index sur documents (type, year, region_id, theme_id, created_at) | Migrations ou migration dédiée |
| 8.3 | Pagination | Toutes les listes (documents public + admin) paginées | `->paginate(20)` |
| 8.4 | Lazy loading médias | `loading="lazy"` sur images dans grilles | Attribut dans Blade |
| 8.5 | SEO | URLs propres (slug document), meta title/description, sitemap (package ou manuel) | Routes avec slug, balises dans layout |
| 8.6 | Accessibilité | Responsive, contraste, police lisible (CDC §11) | CSS et structure HTML |

---

## Phase 9 — Sécurité et rate limit (CDC §6.2)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 9.1 | Rate limiting | Limiter requêtes sur routes de consultation et API | `throttle` dans `routes/web.php` / `api.php` |
| 9.2 | Protection scraping | Headers, éventuellement CAPTCHA sur formulaire contact ou inscription (si ajouté) | Middleware ou config |

---

## Phase 10 — Documentation et livrables (CDC §13)

| # | Tâche | Détail | Livrable |
|---|--------|--------|----------|
| 10.1 | Documentation technique | README (install, config .env), ARCHITECTURE.md à jour | Dossier `docs/` |
| 10.2 | Manuel utilisateur | Guide court : consultation, recherche, (admin : ajout document) | PDF ou page dédiée |

---

## Récapitulatif

| Phase | Résumé |
|-------|--------|
| 0 | Cadrage, stack CDC, projet Laravel |
| 1 | Migrations MySQL (documents, themes, regions, tags, users), modèles, seed |
| 2 | Layout Blade, accueil, à propos |
| 3 | Liste documents, recherche simple et avancée, fiche document, similaires |
| 4 | Stream sécurisé, visionneuse PDF/image/vidéo, anti-copier, watermark |
| 5 | Auth, middleware admin, layout admin, dashboard stats |
| 6 | Admin CRUD documents (upload, métadonnées) |
| 7 | Admin gestion utilisateurs et rôles |
| 8 | Cache, index, pagination, lazy load, SEO, accessibilité |
| 9 | Rate limit, protection scraping |
| 10 | Documentation et manuel utilisateur |

Suivre cette liste tâche par tâche en cochant au fur et à mesure (fichier `TACHES_PROGRESS.md` ou GitHub Projects).
