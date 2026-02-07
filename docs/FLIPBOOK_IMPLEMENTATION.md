# Flipbook — Page Flip Effect (Real Book Feel)

## Stack recommandée

| Rôle | Choix | Raison |
|------|--------|--------|
| **Rendu PDF** | **pdfjs-dist** (Mozilla) | npm, pas de CDN, stream blob Laravel, chargement page par page |
| **Effet flip** | **react-pageflip** (StPageFlip) | Drag, touch, ombre, pas de dépendance CDN pour les documents |

Contraintes respectées : **aucun CDN exposant l’URL du fichier**, **stream sécurisé Laravel uniquement**, **pas de bouton téléchargement**.

---

## Installation

```bash
cd frontend
npm install pdfjs-dist react-pageflip
```

Si le worker PDF.js ne se charge pas (erreur dans la console), dans `src/main.tsx` avant le render :

```ts
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc = pdfjsWorker;
```

(Vite résout `?url` vers l’URL du worker au build.)

---

## Backend (Laravel)

### Route stream (déjà en place)

- **GET** `/api/documents/{id}/stream`  
- Réponse : corps = fichier binaire, en-têtes :
  - `Content-Type: application/pdf` (ou type réel)
  - `Content-Disposition: inline` (affichage navigateur, pas de téléchargement forcé)

Exemple dans `app/Http/Controllers/Api/DocumentController.php` :

```php
return response()->streamDownload(
    function () use ($path) {
        $stream = Storage::disk('local')->readStream($path);
        fpassthru($stream);
        if (is_resource($stream)) fclose($stream);
    },
    $filename,
    ['Content-Type' => $mime],
    'inline'  // 4e paramètre : affichage inline
);
```

### Sécurité

- Stream uniquement via cette route (pas d’URL directe vers `storage/`).
- CORS : autoriser l’origine du front (ex. `http://localhost:5173`) dans `config/cors.php`.
- Throttle déjà appliqué sur la route (ex. `throttle:120,1`).

---

## Frontend (React)

### Flux

1. **Récupération du PDF** : `fetch(streamUrl)` avec token si besoin → `response.blob()` → `URL.createObjectURL(blob)`.
2. **Ouverture du document** : `getDocument(blobUrl).promise` (PDF.js).
3. **Flipbook** : `PdfFlipbook` utilise `react-pageflip` (HTMLFlipBook) avec des enfants = une page PDF par numéro.
4. **Chaque page** : rendu à la demande avec `pdfDoc.getPage(pageNum)` puis `page.render({ canvasContext, viewport })` (pas de chargement de tout le document en mémoire pour le décodage de toutes les pages).

### Composant principal

- **`PdfFlipbook`** (`src/components/PdfFlipbook.tsx`) :
  - Reçoit : `blobUrl`, `width`, `height`, `currentPage`, `onPageChange`, `zoom`, `readOnly`.
  - Charge le PDF avec PDF.js, affiche le livre avec StPageFlip, rend les pages en canvas à la demande.
  - Pas de bouton téléchargement, pas d’URL directe du fichier.

### Intégration dans la page document

- Sur `/documents/:id`, quand le type est PDF et qu’on a le `blobUrl` :
  - Afficher `PdfFlipbook` avec `blobUrl`, `currentPage={pdfPage}`, `onPageChange={setPdfPage}`, `zoom`, `readOnly`.
  - Conserver la barre « Document | Page N », zoom, plein écran, flèches clavier (optionnel).
- Couche sécurité déjà en place : pas de clic droit, pas de copier-coller, pas de lien de téléchargement.

### Zoom et plein écran

- **Zoom** : prop `zoom` (ex. 100) appliquée en `transform: scale(zoom/100)` sur le conteneur du flipbook.
- **Plein écran** : `containerRef.current?.requestFullscreen?.()` sur le conteneur (déjà utilisé).

---

## Sécurité (résumé)

| Risque | Mesure |
|--------|--------|
| Téléchargement | Pas de bouton download ; `Content-Disposition: inline` côté API. |
| URL directe | Pas d’exposition de chemin `storage/` ; accès uniquement via `/api/documents/{id}/stream`. |
| Clic droit / copie | `onContextMenu={preventDownload}`, listeners `copy`/`cut`/`paste` + blocage Ctrl+C/X/V. |
| Scraping | Stream + token optionnel + throttle ; pas de liste d’URLs de pages exposée. |

---

## Bonus possibles

- **Préchargement des 2 pages suivantes** : dans `PdfPage`, précharger `pageNum+1` et `pageNum+2` en arrière-plan (même `getPage` + petit canvas ou cache).
- **Numérotation** : déjà « Page N » ; on peut ajouter le total (ex. « Page N / M ») si `numPages` est remonté par `PdfFlipbook`.
- **Texture papier** : overlay CSS (image ou gradient) sur chaque page dans `PdfPage`.
- **Son au tour de page** : `new Audio('/sounds/page-flip.mp3').play()` dans `onFlip` (optionnel).

---

## Intégration rapide dans DocumentView

Une fois `npm install` fait, dans `frontend/src/pages/DocumentView.tsx` :

1. Ajouter l’import :
   ```ts
   import { PdfFlipbook } from '@/components/PdfFlipbook';
   ```

2. Là où vous affichez le PDF (après `pdfBlobUrl` disponible), remplacer ou compléter avec :
   ```tsx
   <div className="w-full flex-1 flex items-center justify-center min-h-[50vh] max-h-[80vh]">
     <PdfFlipbook
       blobUrl={pdfBlobUrl}
       title={document.title}
       width={560}
       height={720}
       currentPage={pdfPage}
       onPageChange={setPdfPage}
       zoom={zoom}
       readOnly
     />
   </div>
   ```
   En gardant les boutons Précédent/Suivant et l’indicateur « Document | Page N » comme aujourd’hui.

3. Si le worker PDF.js ne se charge pas, dans `main.tsx` avant `ReactDOM.createRoot` :
   ```ts
   import { GlobalWorkerOptions } from 'pdfjs-dist';
   import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
   GlobalWorkerOptions.workerSrc = pdfjsWorker;
   ```

## Fichiers concernés

- **Backend** : `tarikh-ma-laravel/app/Http/Controllers/Api/DocumentController.php` (stream), `routes/api.php`.
- **Frontend** : `frontend/src/components/PdfFlipbook.tsx`, `frontend/src/pages/DocumentView.tsx`, `frontend/src/api/client.ts` (`documentStreamUrl`).
