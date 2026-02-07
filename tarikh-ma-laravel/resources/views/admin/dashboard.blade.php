@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
<h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">Dashboard</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Nombre de documents</p>
        <p class="text-3xl font-bold text-primary">{{ $stats['documents_count'] }}</p>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Consultations totales</p>
        <p class="text-3xl font-bold text-primary">{{ $stats['views_total'] }}</p>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400">Utilisateurs</p>
        <p class="text-3xl font-bold text-primary">{{ $stats['users_count'] }}</p>
    </div>
</div>

<h2 class="text-xl font-bold mb-4">Documents les plus vus</h2>
<table class="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <thead class="bg-slate-50 dark:bg-slate-800">
        <tr>
            <th class="text-left p-3">Titre</th>
            <th class="text-left p-3">Type</th>
            <th class="text-right p-3">Vues</th>
        </tr>
    </thead>
    <tbody>
        @forelse($mostViewed as $doc)
        <tr class="border-t border-slate-200 dark:border-slate-700">
            <td class="p-3"><a href="{{ route('documents.show', $doc) }}" class="text-primary hover:underline">{{ $doc->title }}</a></td>
            <td class="p-3">{{ $doc->type }}</td>
            <td class="p-3 text-right">{{ $doc->views_count }}</td>
        </tr>
        @empty
        <tr><td colspan="3" class="p-3 text-slate-500">Aucun document.</td></tr>
        @endforelse
    </tbody>
</table>
@endsection
