# Tarikh.ma — Backend Laravel (API)

Backend **Laravel** aligné sur le cahier des charges : **API REST** pour le **frontend React** (design Stitch), **Sanctum** pour l’auth, MySQL 8, stream sécurisé des fichiers.

**⚠️ Ce dossier `laravel/` est un squelette : il n’y a pas de fichier `artisan`.** Pour lancer `php artisan migrate`, il faut d’abord créer un projet Laravel (voir section « Intégration » ci-dessous).

## Architecture projet

- **Backend** : ce dossier Laravel — API consommée par le frontend.
- **Frontend** : dossier **`frontend/`** à la racine du dépôt — React (Vite) avec **design Stitch** (Tailwind, couleurs, typo, maquettes).

Le frontend appelle l’API Laravel (base URL configurable, ex. `http://localhost:8000/api`) et envoie le token Sanctum en header `Authorization: Bearer {token}`.

## Support IDE (Intelephense)

Dans le dossier `laravel/` :

```bash
composer install
```

Pour que l’IDE résolve les types Laravel et Sanctum.

## Intégration dans un projet Laravel frais

**Depuis la racine du dépôt** (parent de `laravel/`) :

### 1. Créer le projet Laravel

```powershell
cd C:\Users\LENOVO\Desktop\TARIKH.MA\tarikh.ma
composer create-project laravel/laravel tarikh-ma-laravel
cd tarikh-ma-laravel
composer require laravel/sanctum
php artisan install:api
```

(ou exécuter **`scripts/setup-laravel.ps1`** pour automatiser création + copie du squelette.)

### 2. Copier les fichiers du squelette

Depuis la racine du dépôt (`tarikh.ma/`) :

- `laravel/database/migrations/*` → `tarikh-ma-laravel/database/migrations/`
- `laravel/database/seeders/*` → `tarikh-ma-laravel/database/seeders/`
- `laravel/app/Models/*` → `tarikh-ma-laravel/app/Models/`
- `laravel/app/Http/Controllers/*` (et sous-dossiers Api, Admin) → `tarikh-ma-laravel/app/Http/Controllers/`
- `laravel/app/Http/Middleware/EnsureUserHasRole.php` → `tarikh-ma-laravel/app/Http/Middleware/`
- `laravel/routes/web.php` → `tarikh-ma-laravel/routes/web.php` (remplacer)
- `laravel/routes/api.php` → `tarikh-ma-laravel/routes/api.php` (remplacer)
- `laravel/resources/views/**` → `tarikh-ma-laravel/resources/views/`
- Copier `laravel/.env.example` → `tarikh-ma-laravel/.env` (puis adapter et `php artisan key:generate`)

Ensuite : **`cd tarikh-ma-laravel`** puis `php artisan migrate` et `php artisan db:seed`.

### 3. Middleware rôle

Dans `bootstrap/app.php` (Laravel 11) :

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['role' => \App\Http\Middleware\EnsureUserHasRole::class]);
})
```

### 4. CORS (pour le frontend React)

Dans `config/cors.php`, autoriser l’origine du front (ex. `http://localhost:5173`) et `Authorization` dans les headers exposés.

### 5. Auth et colonne `role`

- Installer Breeze (Blade) si vous gardez des pages Blade pour l’admin, ou uniquement utiliser l’API.
- Migration `add_role_to_users_table` : exécuter après la table `users`.
- **User** doit utiliser le trait `Laravel\Sanctum\HasApiTokens` (déjà dans le modèle fourni).

### 6. Seed et premier admin

Dans `DatabaseSeeder` : `$this->call(ThemeRegionSeeder::class);`  
Puis créer un utilisateur `role = admin` (tinker ou Breeze + update en BDD).

---

## Routes API (frontend React)

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/api/themes` | Liste thèmes |
| GET | `/api/regions` | Liste régions |
| GET | `/api/documents` | Liste documents (query: q, type, theme_id, region_id, year, page, per_page) |
| GET | `/api/documents/{id}` | Détail document + similaires |
| GET | `/api/documents/{id}/stream` | Stream du fichier (inline, pas de téléchargement) |
| POST | `/api/login` | body: email, password → token + user |
| POST | `/api/register` | body: name, email, password, password_confirmation → token + user |
| GET | `/api/user` | Utilisateur connecté (header Authorization: Bearer {token}) |
| POST | `/api/logout` | Invalider le token |
| GET | `/api/admin/stats` | Stats dashboard (auth + role admin|editor) |
| GET/POST | `/api/admin/documents` | Liste / création (auth + admin|editor) |
| GET/PUT/DELETE | `/api/admin/documents/{id}` | Détail / mise à jour / suppression |
| GET/POST | `/api/admin/users` | Liste / création (auth + role admin) |
| PUT/DELETE | `/api/admin/users/{id}` | Mise à jour / suppression |

## Conformité CDC

- **Back-end** : Laravel (PHP 8+), MySQL 8
- **API** : consommée par le frontend React (design Stitch)
- **Streaming** : accès aux fichiers **uniquement** via `GET /api/documents/{id}/stream` (Content-Disposition: inline)
- **Rôles** : admin, editor, reader
