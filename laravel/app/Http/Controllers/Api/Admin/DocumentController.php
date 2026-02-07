<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Region;
use App\Models\Tag;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documents = Document::with(['region:id,name', 'theme:id,name'])
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,image,carte,video,audio',
            'year' => 'nullable|string|max:50',
            'region_id' => 'nullable|exists:regions,id',
            'theme_id' => 'nullable|exists:themes,id',
            'language' => 'nullable|string|max:50',
            'keywords' => 'nullable|string',
            'file' => 'required|file|max:512000',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents/' . $validated['type'], 'local');
        $validated['file_path'] = $path;
        unset($validated['file']);

        $document = Document::create($validated);
        if ($request->filled('tags')) {
            $document->tags()->sync((array) $request->tags);
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,image,carte,video,audio',
            'year' => 'nullable|string|max:50',
            'region_id' => 'nullable|exists:regions,id',
            'theme_id' => 'nullable|exists:themes,id',
            'language' => 'nullable|string|max:50',
            'keywords' => 'nullable|string',
            'file' => 'nullable|file|max:512000',
        ]);

        if ($request->hasFile('file')) {
            Storage::disk('local')->delete($document->file_path);
            $validated['file_path'] = $request->file('file')->store('documents/' . $validated['type'], 'local');
        }

        $document->update($validated);
        $document->tags()->sync($request->tags ?? []);

        return response()->json($document->load(['region', 'theme', 'tags']));
    }

    public function destroy(Document $document): JsonResponse
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();
        return response()->json(null, 204);
    }
}
