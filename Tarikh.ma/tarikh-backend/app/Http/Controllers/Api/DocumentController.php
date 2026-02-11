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
            $types = is_array($request->type) ? $request->type : explode(',', $request->type);
            $query->whereIn('type', $types);
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
        if ($request->filled('year_min')) {
            $query->where('year', '>=', $request->year_min);
        }
        if ($request->filled('year_max')) {
            $query->where('year', '<=', $request->year_max);
        }
        if ($request->has('is_rare')) {
            $query->where('is_rare', filter_var($request->is_rare, FILTER_VALIDATE_BOOLEAN));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'latest');
        switch ($sortBy) {
            case 'oldest':
                $query->oldest();
                break;
            case 'title':
                $query->orderBy('title', 'asc');
                break;
            case 'views':
                $query->orderBy('views_count', 'desc');
                break;
            case 'year_asc':
                $query->orderBy('year', 'asc');
                break;
            case 'year_desc':
                $query->orderBy('year', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $documents = $query->paginate($perPage);

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
            ->get(['id', 'title', 'type', 'year', 'views_count', 'thumbnail_path']);

        return response()->json([
            'document' => $document,
            'similar' => $similar,
        ]);
    }

    /** Stream du fichier : accès uniquement via API (CDC §6). */
    public function stream(Document $document)
    {
        $path = $document->file_path;
        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);
        
        // Utilisation de response()->file() pour une meilleure gestion du streaming
        // et ajout de headers CORS au cas où fetch() en aurait besoin.
        return response()->file($fullPath, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET',
            'Access-Control-Allow-Headers' => 'Authorization, Content-Type',
            'Cache-Control' => 'no-cache, must-revalidate'
        ]);
    }

    /** Stream du thumbnail (public). */
    public function thumbnail(Document $document)
    {
        $path = $document->thumbnail_path;
        if (! $path || ! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->file($fullPath, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET',
            'Cache-Control' => 'public, max-age=86400'
        ]);
    }
}
