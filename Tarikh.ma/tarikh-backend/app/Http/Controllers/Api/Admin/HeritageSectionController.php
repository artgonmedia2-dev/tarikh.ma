<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeritageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HeritageSectionController extends Controller
{
    public function index()
    {
        return HeritageSection::orderBy('order')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string|max:255',
            'image' => 'required|image|max:2048',
            'link_url' => 'nullable|string',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('heritage', 'public');
            $validated['image_path'] = $path;
        }

        $section = HeritageSection::create($validated);

        return response()->json($section, 201);
    }

    public function show(HeritageSection $heritageSection)
    {
        return $heritageSection;
    }

    public function update(Request $request, HeritageSection $heritageSection)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'icon' => 'sometimes|required|string|max:255',
            'image' => 'sometimes|image|max:2048',
            'link_url' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer',
        ]);

        if ($request->hasFile('image')) {
            if ($heritageSection->image_path && !str_starts_with($heritageSection->image_path, 'http')) {
                Storage::disk('public')->delete($heritageSection->image_path);
            }
            $path = $request->file('image')->store('heritage', 'public');
            $validated['image_path'] = $path;
        }

        $heritageSection->update($validated);

        return response()->json($heritageSection);
    }

    public function destroy(HeritageSection $heritageSection)
    {
        if ($heritageSection->image_path && !str_starts_with($heritageSection->image_path, 'http')) {
            Storage::disk('public')->delete($heritageSection->image_path);
        }
        $heritageSection->delete();

        return response()->json(null, 204);
    }
}
