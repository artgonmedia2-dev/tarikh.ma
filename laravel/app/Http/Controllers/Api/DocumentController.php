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
                    ->orWhere('keywords', 'like', "%{$q}%");
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
            ->where(function ($q) use ($document) {
                if ($document->theme_id) {
                    $q->orWhere('theme_id', $document->theme_id);
                }
                if ($document->region_id) {
                    $q->orWhere('region_id', $document->region_id);
                }
            })
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
        $disk = Storage::disk('local');
        if (! $disk->exists($path)) {
            abort(404);
        }

        $fullPath = $disk->path($path);
        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
        $filename = basename($path);

        return response()->streamDownload(function () use ($disk, $path) {
            $stream = $disk->readStream($path);
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $filename, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }
}
