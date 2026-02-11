@extends('layouts.app')

@section('title', 'À propos')

@section('content')
<div class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-black mb-6 text-slate-900 dark:text-white">
        Notre mission : <span class="text-primary italic">Porter l'héritage</span>
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
        Tarikh.ma est la plateforme web dédiée à la valorisation du patrimoine historique marocain. Plus de 10 000 documents numérisés — textes, images, cartes, vidéos et audio — sont accessibles en consultation en ligne uniquement, sans téléchargement.
    </p>
    <p class="mt-6 text-slate-600 dark:text-slate-400">
        Objectifs : centraliser les archives, faciliter l'accès à l'information historique, offrir une expérience moderne et garantir une consultation sécurisée.
    </p>
    <a href="{{ route('documents.index') }}" class="inline-block mt-8 bg-primary text-slate-900 px-6 py-3 rounded-lg font-bold">Explorer les archives</a>
</div>
@endsection
