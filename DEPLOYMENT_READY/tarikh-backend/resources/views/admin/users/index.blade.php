@extends('layouts.admin')

@section('title', 'Utilisateurs')

@section('content')
<div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold">Utilisateurs</h1>
    <a href="{{ route('admin.users.create') }}" class="bg-primary text-slate-900 px-6 py-2 rounded-lg font-bold">Ajouter un utilisateur</a>
</div>

<table class="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <thead class="bg-slate-50 dark:bg-slate-800">
        <tr>
            <th class="text-left p-3">Nom</th>
            <th class="text-left p-3">Email</th>
            <th class="text-left p-3">Rôle</th>
            <th class="text-right p-3">Actions</th>
        </tr>
    </thead>
    <tbody>
        @foreach($users as $user)
        <tr class="border-t border-slate-200 dark:border-slate-700">
            <td class="p-3">{{ $user->name }}</td>
            <td class="p-3">{{ $user->email }}</td>
            <td class="p-3">{{ $user->role }}</td>
            <td class="p-3 text-right">
                <a href="{{ route('admin.users.edit', $user) }}" class="text-primary text-sm">Modifier</a>
                @if($user->id !== auth()->id())
                <form action="{{ route('admin.users.destroy', $user) }}" method="POST" class="inline ml-2" onsubmit="return confirm('Supprimer cet utilisateur ?');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="text-red-600 text-sm">Supprimer</button>
                </form>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
<div class="mt-4">{{ $users->links() }}</div>
@endsection
