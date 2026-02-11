@extends('layouts.admin')

@section('title', 'Documents')

@section('content')
<div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold">Documents</h1>
    <a href="{{ route('admin.documents.create') }}" class="bg-primary text-slate-900 px-6 py-2 rounded-lg font-bold">Ajouter un document</a>
</div>

<table class="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <thead class="bg-slate-50 dark:bg-slate-800">
        <tr>
            <th class="text-left p-3">Titre</th>
            <th class="text-left p-3">Type</th>
            <th class="text-left p-3">Région</th>
            <th class="text-right p-3">Vues</th>
            <th class="text-right p-3">Actions</th>
        </tr>
    </thead>
    <tbody>
        @forelse($documents as $doc)
        <tr class="border-t border-slate-200 dark:border-slate-700">
            <td class="p-3">{{ $doc->title }}</td>
            <td class="p-3">{{ $doc->type }}</td>
            <td class="p-3">{{ $doc->region?->name ?? '—' }}</td>
            <td class="p-3 text-right">{{ $doc->views_count }}</td>
            <td class="p-3 text-right">
                <a href="{{ route('documents.show', $doc) }}" class="text-primary text-sm mr-2">Voir</a>
                <a href="{{ route('admin.documents.edit', $doc) }}" class="text-primary text-sm mr-2">Modifier</a>
                <form action="{{ route('admin.documents.destroy', $doc) }}" method="POST" class="inline" onsubmit="return confirm('Supprimer ce document ?');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="text-red-600 text-sm">Supprimer</button>
                </form>
            </td>
        </tr>
        @empty
        <tr><td colspan="5" class="p-3 text-slate-500">Aucun document.</td></tr>
        @endforelse
    </tbody>
</table>
<div class="mt-4">{{ $documents->links() }}</div>
@endsection
