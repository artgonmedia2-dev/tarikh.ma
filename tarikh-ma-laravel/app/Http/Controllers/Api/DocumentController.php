<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Document::query()->with(['region:id,name,slug', 'theme:id,name,slug']);

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($qry) use ($q) {
                $qry->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('keywords', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%");
            });
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('theme_id')) {
            $query->where('theme_id', $request->theme_id);
        }
        if ($request->filled('region_id')) {
            $query->where('region_id', $request->region_id);
        }
        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $documents = $query->latest()->paginate($perPage);

        return response()->json($documents);
    }

    public function show(Document $document): JsonResponse
    {
        $document->increment('views_count');
        $document->load(['region:id,name,slug', 'theme:id,name,slug', 'tags:id,name,slug']);

        $similar = Document::query()
            ->where('id', '!=', $document->id)
            ->when($document->theme_id || $document->region_id, function ($q) use ($document) {
                $q->where(function ($qry) use ($document) {
                    if ($document->theme_id) {
                        $qry->orWhere('theme_id', $document->theme_id);
                    }
                    if ($document->region_id) {
                        $qry->orWhere('region_id', $document->region_id);
                    }
                });
            })
            ->latest()
            ->take(4)
            ->get(['id', 'title', 'type', 'year', 'views_count']);

        return response()->json([
            'document' => $document,
            'similar' => $similar,
        ]);
    }

    /** Stream du fichier : accès uniquement via API (CDC §6). */
    public function stream(Document $document): StreamedResponse
    {
        $path = $document->file_path;
        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);
        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
        $filename = basename($path);

        return response()->streamDownload(function () use ($path) {
            $stream = Storage::disk('local')->readStream($path);
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $filename, [
            'Content-Type' => $mime,
        ], 'inline');
    }

    /** Stream du thumbnail (public). */
    public function thumbnail(Document $document): StreamedResponse
    {
        $path = $document->thumbnail_path;
        if (! $path || ! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);
        $mime = mime_content_type($fullPath) ?: 'image/jpeg';
        $filename = basename($path);

        return response()->streamDownload(function () use ($path) {
            $stream = Storage::disk('local')->readStream($path);
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $filename, [
            'Content-Type' => $mime,
        ], 'inline');
    }
}
