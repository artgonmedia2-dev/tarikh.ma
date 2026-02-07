# PDF → Pages Flipbook — Implementation Summary

## Overview

Tarikh.ma converts uploaded PDFs into one image per page in the background. The frontend displays these pages with a page-flip UX via **signed URLs** (no direct file or PDF URLs). All media are streamed by Laravel with watermark and rate limiting.

## Backend (Laravel)

### Migration

- **File:** `database/migrations/2026_02_06_000001_add_pages_conversion_to_documents_table.php`
- **Columns on `documents`:** `pages_count`, `pages_status` (`pending`|`processing`|`completed`|`failed`), `pages_converted_at`, index on `(type, pages_status)`.

Run:

```bash
cd tarikh-ma-laravel && php artisan migrate
```

### Job: `ConvertPdfToImagesJob`

- **File:** `app/Jobs/ConvertPdfToImagesJob.php`
- **Queue:** `pdf-conversion` (configure in `config/queue.php` or use default).
- **Behaviour:** Reads PDF from `Storage::disk('local')` (path from `document.file_path`), converts each page to JPG (Imagick or Ghostscript), saves under `documents/{id}/pages/{n}.jpg`, updates `documents.pages_*`, writes progress to Redis key `doc_conversion_{id}`.
- **Requirements:** PHP Imagick **or** Ghostscript (`gs`) on PATH.

### Storage

- **Disk:** `local` (root: `storage/app/private`).
- **Page images:** `documents/{document_id}/pages/{page}.jpg` (1-based). No public URLs.

### API

| Method | Route | Description |
|--------|--------|-------------|
| GET | `documents/{document}/pages/urls?pages=1,2,3` | Returns signed URLs for given page numbers (throttle 120/min). |
| GET | `documents/{document}/pages/{page}` | **Signed.** Streams page image with watermark (throttle 120/min). |
| GET | `admin/documents/{id}/conversion-progress` | Admin: current/total progress from Redis. |
| POST | `admin/documents/{id}/regenerate-pages` | Admin: deletes page images, sets status to `pending`, dispatches job. |

Document `show` response includes `pages_count`, `pages_status`, `pages_converted_at` so the frontend can choose image flipbook vs PDF fallback.

### Admin flow

- **Store:** On PDF upload, set `pages_status = 'pending'` and dispatch `ConvertPdfToImagesJob`.
- **Update:** If file is replaced and type is PDF, delete existing page images, set `pages_status = 'pending'`, dispatch job.
- **Regenerate:** Admin document edit page shows status and a “Regénérer les pages” button that calls the regenerate endpoint.

### Security

- Page **stream** route is **signed** (temporary URLs, 15 min).
- **Watermark:** “Tarikh.ma” applied when streaming (GD) if JPEG load succeeds; otherwise raw file is streamed.
- **Rate limits:** 120/min on page URLs and stream.
- No direct storage URLs; all via controllers.

## Frontend

### Image flipbook

- **Component:** `frontend/src/components/ImageFlipbook.tsx`
- **Usage:** When `document.pages_status === 'completed'` and `document.pages_count > 0`, `DocumentView` renders `ImageFlipbook` instead of the PDF object/iframe.
- **Behaviour:** Fetches signed URLs for current page and next 2 (and previous 1); lazy loads the rest. Same flip animation and keyboard (arrows) as the PDF viewer. Zoom and fullscreen remain on the parent.

### API client

- `documentPageSignedUrls(documentId, pages)` — returns `Record<string, string>` (page number → signed URL).
- `adminApi.documents.conversionProgress(id)` and `adminApi.documents.regeneratePages(id)` for admin.

### Admin

- Edit document (PDF): block “Conversion PDF → pages” with status, optional progress (when processing), and “Regénérer les pages” button. Progress is polled every 2s while status is `processing`.

## Deployment checklist

1. Run migration: `php artisan migrate`.
2. Use **Redis** for queue and cache (e.g. `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`).
3. Run queue worker: `php artisan queue:work --queue=pdf-conversion` (or include `pdf-conversion` in default queue).
4. Ensure **Imagick** (preferred) or **Ghostscript** is available for PDF→image conversion.
5. Ensure `storage/app/private` exists and is writable.

## Optional (bonus)

- **OCR / search inside pages:** Add a job or pipeline that runs OCR on each page image and stores text in DB for search.
- **Flip sound / paper texture / book cover:** Frontend-only enhancements in `ImageFlipbook` or `DocumentView` (e.g. CSS texture, sound on flip, optional cover image).
