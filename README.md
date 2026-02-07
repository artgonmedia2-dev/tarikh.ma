# Tarikh.ma

Plateforme d’archives numériques pour la valorisation du patrimoine historique marocain (cahier des charges officiel).

## Stack technique (choix projet)

- **Back-end** : **Laravel (PHP 8+)** — API REST + Sanctum (auth)
- **Base de données** : MySQL 8
- **Front-end** : **React (Vite + TypeScript + Tailwind)** — design **Stitch** (maquettes), expérience moderne
- **Stockage** : serveur privé (Laravel `storage/`) ; accès aux fichiers **uniquement via API** (stream inline, pas de téléchargement)

## Structure du projet (racine nettoyée)

| Élément | Rôle |
|--------|------|
| **`laravel/`** | Squelette backend Laravel (migrations, modèles, contrôleurs **web** + **API**, routes `web.php` et `api.php`). À intégrer dans un projet Laravel frais — voir **`laravel/README_LARAVEL.md`**. |
| **`frontend/`** | Application React (design Stitch) : accueil, à propos, exploration archives, visionneuse document, login/register, admin (dashboard). Consomme l’API Laravel. Voir **`frontend/README.md`**. |
| **`docs/`** | Architecture (ARCHITECTURE.md), tâches étape par étape (TACHES_ETAPES.md). |
| **`stitch/`** | Maquettes HTML de référence (écrans public + admin). |
| **`docker-compose.yml`** | MySQL 8 + Redis pour le développement (Laravel). |
| **`.gitignore`** | Fichiers à ne pas versionner (env, node_modules, vendor, etc.). |

## Démarrer (développement)

### 0. Base de données MySQL

- **Avec Docker** (si Docker est installé) : `docker compose up -d` → MySQL sur `localhost:3306`, Redis sur `6379`.
- **Sans Docker** : installer MySQL 8 (XAMPP, Laragon, WAMP ou MySQL seul), créer une base `tarikh_ma`, puis dans le `.env` Laravel : `DB_HOST=127.0.0.1`, `DB_DATABASE=tarikh_ma`, `DB_USERNAME=...`, `DB_PASSWORD=...`. Redis est optionnel (cache/sessions).

### 1. Backend Laravel

Le dossier **`laravel/`** est un squelette (pas de fichier `artisan`). Il faut d’abord créer un projet Laravel puis y copier ce squelette :

- **Option A** — Script (depuis la racine du dépôt) :  
  `.\scripts\setup-laravel.ps1`  
  puis `cd tarikh-ma-laravel`, configurer `.env`, `php artisan key:generate`, `php artisan migrate`, `php artisan db:seed`.
- **Option B** — Manuel : voir **`laravel/README_LARAVEL.md`** (créer le projet avec `composer create-project laravel/laravel tarikh-ma-laravel`, copier le contenu de `laravel/`).

Ensuite : configurer `.env` (MySQL), middleware `role` et CORS (voir README_LARAVEL), puis `php artisan migrate` et `php artisan db:seed`.
- Créer un utilisateur admin (tinker ou Breeze).
- Lancer : `php artisan serve` (ex. http://localhost:8000).

Détails : **`laravel/README_LARAVEL.md`**.

### 2. Frontend React

- Dans **`frontend/`** : créer `.env` avec `VITE_API_URL=http://localhost:8000/api`.
- `npm install` puis `npm run dev` (ex. http://localhost:5173).

Détails : **`frontend/README.md`**.

### 3. Utilisation

- Ouvrir http://localhost:5173 : accueil, archives, visionneuse, connexion.
- Compte **admin** ou **éditeur** : lien « Admin » vers le dashboard (stats, documents les plus vus).

## Documentation

- **Architecture** : `docs/ARCHITECTURE.md` (Laravel API + React Stitch, sécurité CDC)
- **Tâches** : `docs/TACHES_ETAPES.md` (phases Laravel + frontend)

## Livrables (CDC §13)

- Application web fonctionnelle (Laravel API + React design Stitch)
- Base de données structurée (documents, thèmes, régions, tags, users)
- Interface admin (dashboard, CRUD documents/utilisateurs via API)
- Documentation technique (README + docs/)
- Manuel utilisateur (à rédiger en phase 10)

---

Projet Tarikh.ma — Tous droits réservés.
