@extends('layouts.app')

@section('title', 'Exploration des archives')

@section('content')
<div class="max-w-7xl mx-auto px-6 py-10" x-data="{ openFilters: false }">
    <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2">Archives</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-8">{{ $documents->total() }} document(s)</p>

    <form method="GET" action="{{ route('documents.index') }}" class="flex flex-wrap gap-4 mb-8">
        <input type="text" name="q" value="{{ request('q') }}" placeholder="Rechercher..." class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 flex-1 min-w-[200px]">
        <select name="type" class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
            <option value="">Type</option>
            @foreach(\App\Models\Document::TYPES as $t)
                <option value="{{ $t }}" @selected(request('type') === $t)>{{ $t }}</option>
            @endforeach
        </select>
        <select name="theme_id" class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
            <option value="">Thématique</option>
            @foreach($themes as $t)
                <option value="{{ $t->id }}" @selected(request('theme_id') == $t->id)>{{ $t->name }}</option>
            @endforeach
        </select>
        <select name="region_id" class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
            <option value="">Région</option>
            @foreach($regions as $r)
                <option value="{{ $r->id }}" @selected(request('region_id') == $r->id)>{{ $r->name }}</option>
            @endforeach
        </select>
        <button type="submit" class="bg-primary text-slate-900 px-6 py-2 rounded-lg font-bold">Filtrer</button>
    </form>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($documents as $doc)
        <a href="{{ route('documents.show', $doc) }}" class="block p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-lg transition-all">
            <span class="text-xs font-bold text-primary uppercase">{{ $doc->type }}</span>
            <h3 class="font-bold text-lg mt-1 line-clamp-2">{{ $doc->title }}</h3>
            <p class="text-sm text-slate-500 mt-2">{{ $doc->year }} — {{ $doc->region?->name ?? '—' }}</p>
            <p class="text-sm text-slate-400 mt-1">{{ $doc->views_count }} vues</p>
        </a>
        @empty
        <p class="col-span-full text-slate-500">Aucun document pour le moment.</p>
        @endforelse
    </div>

    <div class="mt-10">
        {{ $documents->links() }}
    </div>
</div>
@endsection
