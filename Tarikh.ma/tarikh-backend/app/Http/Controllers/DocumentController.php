<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Region;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::query()
            ->with(['region', 'theme', 'tags']);

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
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }
        if ($request->filled('region_id')) {
            $query->where('region_id', $request->region_id);
        }
        if ($request->filled('theme_id')) {
            $query->where('theme_id', $request->theme_id);
        }
        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        $documents = $query->latest()->paginate(20)->withQueryString();
        $themes = Theme::orderBy('name')->get();
        $regions = Region::orderBy('name')->get();

        return view('documents.index', compact('documents', 'themes', 'regions'));
    }

    public function show(Document $document)
    {
        $document->incrementViews();
        $document->load(['region', 'theme', 'tags']);

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
            ->get();

        return view('documents.show', compact('document', 'similar'));
    }

    /**
     * Stream du fichier : accès uniquement via contrôleur (CDC §6.1).
     * Aucun lien direct vers le fichier.
     */
    public function stream(Document $document): StreamedResponse
    {
        $path = $document->file_path;
        if (!Storage::disk('local')->exists($path)) {
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
            'Content-Disposition' => 'inline; filename="' . $filename . '"', // lecture seule, pas de téléchargement
        ]);
    }
}
