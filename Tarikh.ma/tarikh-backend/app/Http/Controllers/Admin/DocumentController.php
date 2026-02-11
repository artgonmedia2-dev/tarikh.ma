<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Region;
use App\Models\Tag;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = Document::with(['region', 'theme'])->latest()->paginate(20);
        return view('admin.documents.index', compact('documents'));
    }

    public function create()
    {
        $themes = Theme::orderBy('name')->get();
        $regions = Region::orderBy('name')->get();
        $tags = Tag::orderBy('name')->get();
        return view('admin.documents.create', compact('themes', 'regions', 'tags'));
    }

    public function store(Request $request)
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
            'file' => 'required|file|max:512000', // 500 Mo max
        ]);

        $file = $request->file('file');
        $path = $file->store('documents/' . $validated['type'], 'local');
        $validated['file_path'] = $path;
        unset($validated['file']);

        $document = Document::create($validated);

        if ($request->filled('tags')) {
            $document->tags()->sync($request->tags);
        }

        return redirect()->route('admin.documents.index')->with('success', 'Document créé.');
    }

    public function edit(Document $document)
    {
        $themes = Theme::orderBy('name')->get();
        $regions = Region::orderBy('name')->get();
        $tags = Tag::orderBy('name')->get();
        $document->load('tags');
        return view('admin.documents.edit', compact('document', 'themes', 'regions', 'tags'));
    }

    public function update(Request $request, Document $document)
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

        return redirect()->route('admin.documents.index')->with('success', 'Document mis à jour.');
    }

    public function destroy(Document $document)
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();
        return redirect()->route('admin.documents.index')->with('success', 'Document supprimé.');
    }
}
