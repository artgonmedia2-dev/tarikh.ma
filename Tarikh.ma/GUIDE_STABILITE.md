# Guide de 0 à 100 — Stabilisation Définitive Tarikh.ma

Pour éradiquer définitivement les erreurs "Failed to fetch" et les problèmes de synchronisation sur Hostinger.

## 1. La Règle d'Or : UN SEUL DOSSIER
Votre projet est désormais centralisé ici :
`c:\Users\LENOVO\Desktop\TARIKH.MA\tarikh.ma\Tarikh.ma\`

**Action Immédiate :**
- Supprimez ou archivez les dossiers `frontend` et `tarikh-ma-laravel` qui trainent à la racine parent (`tarikh.ma/`). Ils créent de la confusion.
- Ne travaillez QUE dans `Tarikh.ma/frontend` et `Tarikh.ma/tarikh-backend`.

## 2. Le Problème des PDF (Failed to fetch)
Les fichiers PDF lourds (20Mo+) satureront toujours un hébergement partagé en streaming direct.

### Solution Appliquée (Déjà en place) :
1. **Frontend** : J'ai ajouté un "timeout" de 30 secondes et une gestion d'erreur claire. Si ça coupe, l'utilisateur le saura au lieu d'avoir un écran blanc.
2. **Backend** : J'ai changé la méthode de téléchargement pour utiliser `response()->file()`, bien plus stable.
3. **Serveur** : J'ai boosté la mémoire PHP via `.htaccess`.

### Solution Ultime (Recommandée) :
Pour une fluidité parfaite type "Livre", **convertissez vos PDF en images** via le Dashboard Admin.
- Allez dans Admin > Documents.
- Cliquez sur l'icône de conversion.
- Le viewer chargera les pages instantanément (jpg) au lieu du gros fichier PDF.

## 3. Procédure de Mise à Jour (Déploiement)

À chaque modification, suivez STRICTEMENT cet ordre :

### A. Si vous modifiez le Frontend (React) :
1. Ouvrez le terminal dans `Tarikh.ma/frontend`.
2. Lancez : `npm run build`
3. Sur Hostinger (File Manager) : Videz `public_html`.
4. Uploadez le contenu du dossier `dist` local vers `public_html`.

### B. Si vous modifiez le Backend (Laravel) :
1. Repérez le fichier modifié (ex: `DocumentController.php`).
2. Uploadez-le via FTP/File Manager au même endroit sur le serveur (`app/Http/Controllers/...`).
3. **Jamais** de `composer update` sur le serveur si possible. Uploadez le dossier `vendor` si vous ajoutez des packages.

## 4. En cas de Bug "Page Blanche" ou "500"
Vérifiez toujours ces 2 fichiers sur Hostinger :
1. `.env` : `APP_URL` doit être `https://...` (avec S).
2. `public_html/.htaccess` : Doit contenir les règles de redirection React (que j'ai mises à jour).

---
*Ce guide est situé à la racine de votre projet pour référence future.*
