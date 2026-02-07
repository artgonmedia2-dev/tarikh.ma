# Tarikh.ma — Frontend React (design Stitch)

Interface **React (Vite + TypeScript + Tailwind)** alignée sur les **maquettes Stitch** et le cahier des charges. Consomme l’**API Laravel** (Sanctum).

## Design system (Stitch)

- **Couleurs** : `primary` #11d483, `background-light` #fcfaf7, `background-dark` #10221a, `parchment`, `gold-accent`
- **Typo** : Work Sans (display), Playfair Display (serif titres)
- **Icônes** : Material Symbols Outlined

## Prérequis

- Node.js 18+
- Backend Laravel démarré (ex. `http://localhost:8000`)

## Installation

```bash
npm install
```

## Variables d’environnement

Créer un fichier `.env` à la racine de `frontend/` :

```env
VITE_API_URL=http://localhost:8000/api
```

En dev, le front tourne sur un autre domaine (ex. 5173) ; l’API Laravel doit autoriser cette origine dans **CORS** (`config/cors.php`).

## Lancer l’app

**Depuis le dossier `frontend/`** (obligatoire pour la visionneuse document avec effet flip) :

```bash
cd frontend
npm run dev
```

Ouvre http://localhost:5173. Les appels partent vers `VITE_API_URL` (login, documents, admin, etc.). Si vous lancez un autre projet (ex. Laravel Vite) sur le port 5173, vous ne verrez pas l’interface React ni l’effet cahier sur `/documents/:id`.

## Build

```bash
npm run build
```

Les fichiers sont générés dans `dist/`. Pour la prod, servir ce dossier (Nginx, Vercel, etc.) et pointer `VITE_API_URL` vers l’URL réelle de l’API Laravel.

## Structure

- `src/pages/` — Accueil, À propos, Archives, Visionneuse document, Login, Register
- `src/pages/admin/` — Dashboard admin (stats, documents les plus vus)
- `src/api/client.ts` — Client API (auth, documents, admin), token Sanctum
- `src/stores/authStore.ts` — État auth (Zustand)
- `tailwind.config.js` — Thème Stitch (couleurs, fonts)

## Auth

- **Login** : `POST /api/login` → stockage du `token` et des infos `user` (dont `role`).
- Les requêtes protégées envoient `Authorization: Bearer {token}`.
- **Admin** : les pages `/admin` sont accessibles si `user.role` est `admin` ou `editor` (vérification côté front ; l’API renvoie 403 si rôle insuffisant).

## Conformité CDC

- Consultation des documents **en ligne uniquement** (stream via API, pas de lien de téléchargement).
- **Blocage clic droit** et **pas de copier-coller** sur la zone visionneuse (DocumentView).
- Design **responsive** et **moderne** (Stitch).
