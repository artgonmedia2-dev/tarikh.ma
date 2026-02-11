# Guide de Déploiement Hostinger (10 Février 2026)

Ce guide détaille les étapes nécessaires pour transférer les modifications d'aujourd'hui (Héritage Section + Responsivité) sur votre serveur Hostinger.

## 1. Frontend (Interface Utilisateur)
J'ai configuré le projet pour que tous les fichiers nécessaires au serveur soient automatiquement inclus dans le dossier `dist`.

1.  **Générez le build** : Lancez `npm run build` dans le dossier `frontend`.
2.  **Videz** l'intégralité du dossier `public_html` sur Hostinger.
3.  **Uploadez tout** le contenu du nouveau dossier `frontend/dist/` vers Hostinger.
    > [!IMPORTANT]
    > Le dossier `dist` contient maintenant automatiquement le fichier `.htaccess`, `index.php` et les scripts de secours (`create_link.php`, `debug.php`, etc.). Vous n'avez plus besoin de les chercher ailleurs.

## 2. Backend (Serveur Laravel)
Vous devez mettre à jour les fichiers PHP suivants dans votre dossier `tarikh-backend/` sur Hostinger.

### Fichiers à remplacer :
*   `app/Models/HeritageSection.php`
*   `app/Http/Controllers/Api/HeritageSectionController.php`
*   `app/Http/Controllers/Api/Admin/HeritageSectionController.php`
*   `app/Http/Controllers/Api/DocumentController.php`  <-- NOUVEAU (Fix PDF)
*   `routes/api.php`
*   `database/migrations/2026_02_10_172231_create_heritage_sections_table.php`
*   `database/seeders/HeritageSectionSeeder.php`

### Fichiers modifiés dans `frontend`:
*   `frontend/src/api/client.ts`
*   `frontend/src/pages/Accueil.tsx`
*   `frontend/src/pages/admin/AdminHeritage.tsx`
*   `frontend/src/pages/DocumentView.tsx`  <-- NOUVEAU (Fix Erreur PDF)
*   `frontend/src/App.tsx`
*   `frontend/src/components/AdminLayout.tsx`
*(Note: Ces fichiers sont déjà inclus dans le build `dist` ci-dessus, mais c'est utile pour votre historique Git).*

## 3. Base de Données (Mise à jour)
Une fois les fichiers téléchargés, vous devez exécuter les commandes suivantes via le terminal SSH de Hostinger (ou via votre panneau d'administration si disponible) :

```bash
# Se placer dans le dossier backend
cd tarikh-backend

# Supprimer la table actuelle car la structure a changé
php artisan migrate:rollback --step=1 --force

# Exécuter la migration avec la nouvelle structure (TEXT au lieu de STRING)
php artisan migrate --force

# Remplir la table avec les données initiales
php artisan db:seed --class=HeritageSectionSeeder --force
```

## 4. Vérification Final
*   Accédez à votre site.
*   Vérifiez que la section "Explorer l'Héritage" s'affiche correctement.
*   Connectez-vous à l'administration et vérifiez que le menu "Héritage Section" est bien présent.
