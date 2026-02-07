@extends('layouts.admin')

@section('title', 'Modifier le document')

@section('content')
<h1 class="text-2xl font-bold mb-8">Modifier : {{ $document->title }}</h1>

<form action="{{ route('admin.documents.update', $document) }}" method="POST" enctype="multipart/form-data" class="max-w-2xl space-y-6">
    @csrf
    @method('PUT')
    <div>
        <label class="block text-sm font-semibold mb-1">Titre *</label>
        <input type="text" name="title" value="{{ old('title', $document->title) }}" required class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
        @error('title')<p class="text-red-500 text-sm mt-1">{{ $message }}</p>@enderror
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Description</label>
        <textarea name="description" rows="4" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">{{ old('description', $document->description) }}</textarea>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-semibold mb-1">Type *</label>
            <select name="type" required class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
                @foreach(\App\Models\Document::TYPES as $t)
                    <option value="{{ $t }}" @selected(old('type', $document->type) === $t)>{{ $t }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold mb-1">Année / période</label>
            <input type="text" name="year" value="{{ old('year', $document->year) }}" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
        </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-semibold mb-1">Thématique</label>
            <select name="theme_id" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
                <option value="">—</option>
                @foreach($themes as $t)
                    <option value="{{ $t->id }}" @selected(old('theme_id', $document->theme_id) == $t->id)>{{ $t->name }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold mb-1">Région</label>
            <select name="region_id" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
                <option value="">—</option>
                @foreach($regions as $r)
                    <option value="{{ $r->id }}" @selected(old('region_id', $document->region_id) == $r->id)>{{ $r->name }}</option>
                @endforeach
            </select>
        </div>
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Langue</label>
        <input type="text" name="language" value="{{ old('language', $document->language) }}" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Mots-clés</label>
        <input type="text" name="keywords" value="{{ old('keywords', $document->keywords) }}" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Nouveau fichier (optionnel)</label>
        <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mp3,.wav" class="w-full">
        <p class="text-xs text-slate-500 mt-1">Laisser vide pour conserver le fichier actuel.</p>
    </div>
    <div class="flex gap-4">
        <button type="submit" class="bg-primary text-slate-900 px-6 py-2 rounded-lg font-bold">Enregistrer</button>
        <a href="{{ route('admin.documents.index') }}" class="px-6 py-2 rounded-lg border border-slate-300">Annuler</a>
    </div>
</form>
@endsection
