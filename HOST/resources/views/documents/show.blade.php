@extends('layouts.app')

@section('title', $document->title)

@section('content')
<div class="max-w-7xl mx-auto px-6 py-10">
    <nav class="text-sm text-slate-500 mb-6">
        <a href="{{ route('documents.index') }}" class="hover:text-primary">Archives</a> / {{ $document->title }}
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2" x-data="{ noRightClick: true }" @contextmenu.prevent="noRightClick">
            <div class="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
                @if($document->type === 'pdf')
                    <iframe src="{{ route('documents.stream', $document) }}" class="w-full h-[70vh] rounded border-0" title="Visionneuse PDF"></iframe>
                @elseif(in_array($document->type, ['image']))
                    <img src="{{ route('documents.stream', $document) }}" alt="{{ $document->title }}" class="max-h-[70vh] w-auto rounded shadow-2xl" style="user-select: none; pointer-events: none;">
                @elseif(in_array($document->type, ['video', 'audio']))
                    @if($document->type === 'video')
                        <video src="{{ route('documents.stream', $document) }}" controls class="max-w-full max-h-[70vh] rounded" controlsList="nodownload"></video>
                    @else
                        <audio src="{{ route('documents.stream', $document) }}" controls class="w-full" controlsList="nodownload"></audio>
                    @endif
                @else
                    <p class="text-slate-500">Aperçu non disponible pour ce type. <a href="{{ route('documents.stream', $document) }}" class="text-primary">Ouvrir</a></p>
                @endif
            </div>
            <p class="text-xs text-slate-400 mt-2 uppercase">Consultation en ligne uniquement — pas de téléchargement</p>
        </div>

        <aside class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <span class="text-xs font-bold text-primary uppercase">{{ $document->type }}</span>
            <h1 class="text-2xl font-bold mt-2">{{ $document->title }}</h1>
            <p class="text-slate-600 dark:text-slate-300 mt-4">{{ $document->description ?? '—' }}</p>
            <dl class="grid gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div><dt class="text-xs text-slate-400 uppercase">Année</dt><dd>{{ $document->year ?? '—' }}</dd></div>
                <div><dt class="text-xs text-slate-400 uppercase">Région</dt><dd>{{ $document->region?->name ?? '—' }}</dd></div>
                <div><dt class="text-xs text-slate-400 uppercase">Thème</dt><dd>{{ $document->theme?->name ?? '—' }}</dd></div>
                <div><dt class="text-xs text-slate-400 uppercase">Langue</dt><dd>{{ $document->language ?? '—' }}</dd></div>
                <div><dt class="text-xs text-slate-400 uppercase">Vues</dt><dd>{{ $document->views_count }}</dd></div>
            </dl>
        </aside>
    </div>

    @if($similar->isNotEmpty())
    <section class="mt-16">
        <h2 class="text-xl font-bold mb-4">Documents similaires</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            @foreach($similar as $doc)
            <a href="{{ route('documents.show', $doc) }}" class="block p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary">{{ $doc->title }}</a>
            @endforeach
        </div>
    </section>
    @endif
</div>
@endsection
