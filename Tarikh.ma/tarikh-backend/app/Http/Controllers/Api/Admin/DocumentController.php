<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ConvertPdfToImagesJob;
use App\Models\Document;
use App\Models\Region;
use App\Models\Tag;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Document::with(['region:id,name', 'theme:id,name'])
            ->latest();

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->paginate($request->get('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->merge([
            'region_id' => $request->filled('region_id') ? $request->region_id : null,
            'theme_id' => $request->filled('theme_id') ? $request->theme_id : null,
        ]);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,image,carte,video,audio',
            'year' => 'nullable|string|max:50',
            'region_id' => 'nullable|exists:regions,id',
            'theme_id' => 'nullable|exists:themes,id',
            'language' => 'nullable|string|max:50',
            'keywords' => 'nullable|string',
            'file' => 'required|file|max:512000',
            'thumbnail' => 'nullable|image|max:5120',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents/' . $validated['type'], 'local');
        $validated['file_path'] = $path;
        unset($validated['file']);

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('thumbnails', 'local');
        }
        unset($validated['thumbnail']);
        $validated['region_id'] = $request->filled('region_id') ? (int) $request->region_id : null;
        $validated['theme_id'] = $request->filled('theme_id') ? (int) $request->theme_id : null;

        // Auto-assign user and status
        $validated['user_id'] = $user->id;
        $validated['status'] = $user->role === 'admin' ? 'approved' : 'pending';

        $document = Document::create($validated);
        if ($request->filled('tags')) {
            $document->tags()->sync((array) $request->tags);
        }
        if ($document->type === 'pdf') {
            $document->update(['pages_status' => 'pending']);
            ConvertPdfToImagesJob::dispatch($document);
        }

        return response()->json($document->load(['region', 'theme', 'tags']), 201);
    }

    public function show(Document $document): JsonResponse
    {
        $document->load(['region', 'theme', 'tags']);
        return response()->json($document);
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $document->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->merge([
            'region_id' => $request->filled('region_id') ? $request->region_id : null,
            'theme_id' => $request->filled('theme_id') ? $request->theme_id : null,
        ]);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,image,carte,video,audio',
            'year' => 'nullable|string|max:50',
            'region_id' => 'nullable|exists:regions,id',
            'theme_id' => 'nullable|exists:themes,id',
            'language' => 'nullable|string|max:50',
            'keywords' => 'nullable|string',
            'file' => 'nullable|file|max:512000',
            'thumbnail' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('file')) {
            Storage::disk('local')->delete($document->file_path);
            $this->deleteDocumentPages($document);
            $validated['file_path'] = $request->file('file')->store('documents/' . $validated['type'], 'local');
            if ($document->type === 'pdf') {
                $validated['pages_count'] = null;
                $validated['pages_status'] = 'pending';
                $validated['pages_converted_at'] = null;
            }
        }
        unset($validated['file']);

        if ($request->hasFile('thumbnail')) {
            if ($document->thumbnail_path) {
                Storage::disk('local')->delete($document->thumbnail_path);
            }
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('thumbnails', 'local');
        }
        unset($validated['thumbnail']);

        $validated['region_id'] = $request->filled('region_id') ? (int) $request->region_id : null;
        $validated['theme_id'] = $request->filled('theme_id') ? (int) $request->theme_id : null;
        
        // If editor updates, reset status to pending? Optional. For now keep as is.
        
        $document->update($validated);
        $document->tags()->sync($request->tags ?? []);
        if ($request->hasFile('file') && $document->type === 'pdf') {
            ConvertPdfToImagesJob::dispatch($document->fresh());
        }

        return response()->json($document->load(['region', 'theme', 'tags']));
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $document->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        Storage::disk('local')->delete($document->file_path);
        $this->deleteDocumentPages($document);
        $document->delete();
        return response()->json(null, 204);
    }

    public function conversionProgress(Document $document): JsonResponse
    {
        $data = Cache::get("doc_conversion_{$document->id}");
        return response()->json([
            'document_id' => $document->id,
            'pages_status' => $document->pages_status,
            'pages_count' => $document->pages_count,
            'progress' => $data ? ['current' => $data['current'], 'total' => $data['total']] : null,
        ]);
    }

    public function regeneratePages(Document $document): JsonResponse
    {
        if ($document->type !== 'pdf') {
            return response()->json(['message' => 'Only PDF documents can have pages regenerated'], 422);
        }
        $this->deleteDocumentPages($document);
        $document->update([
            'pages_count' => null,
            'pages_status' => 'pending',
            'pages_converted_at' => null,
        ]);
        ConvertPdfToImagesJob::dispatch($document);
        return response()->json(['message' => 'Regeneration started', 'document' => $document->fresh()]);
    }

    private function deleteDocumentPages(Document $document): void
    {
        $dir = "documents/{$document->id}/pages";
        if (! Storage::disk('local')->exists($dir)) {
            return;
        }
        foreach (Storage::disk('local')->files($dir) as $file) {
            Storage::disk('local')->delete($file);
        }
        Storage::disk('local')->deleteDirectory($dir);
    }
}
