@extends('layouts.app')

@section('title', 'Accueil')

@section('content')
<div class="max-w-7xl mx-auto px-6 py-16">
    <section class="text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white">
            L'histoire du Royaume <span class="text-primary italic">à portée de clic</span>
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Tarikh.ma centralise les archives numériques du patrimoine historique marocain. Consultation en ligne uniquement.
        </p>
        <a href="{{ route('documents.index') }}" class="inline-block bg-primary text-slate-900 px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all">
            Explorer les archives
        </a>
    </section>

    @if($recentDocuments->isNotEmpty())
    <section>
        <h2 class="text-2xl font-bold mb-6">Documents récents</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($recentDocuments as $doc)
            <a href="{{ route('documents.show', $doc) }}" class="block p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                <span class="text-xs font-bold text-primary uppercase">{{ $doc->type }}</span>
                <h3 class="font-bold mt-1 line-clamp-2">{{ $doc->title }}</h3>
                <p class="text-sm text-slate-500 mt-1">{{ $doc->views_count }} vues</p>
            </a>
            @endforeach
        </div>
    </section>
    @endif
</div>
@endsection
