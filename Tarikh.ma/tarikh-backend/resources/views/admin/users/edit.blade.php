@extends('layouts.admin')

@section('title', 'Modifier l\'utilisateur')

@section('content')
<h1 class="text-2xl font-bold mb-8">Modifier : {{ $user->name }}</h1>

<form action="{{ route('admin.users.update', $user) }}" method="POST" class="max-w-md space-y-6">
    @csrf
    @method('PUT')
    <div>
        <label class="block text-sm font-semibold mb-1">Nom *</label>
        <input type="text" name="name" value="{{ old('name', $user->name) }}" required class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
        @error('name')<p class="text-red-500 text-sm mt-1">{{ $message }}</p>@enderror
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Email *</label>
        <input type="email" name="email" value="{{ old('email', $user->email) }}" required class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
        @error('email')<p class="text-red-500 text-sm mt-1">{{ $message }}</p>@enderror
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Nouveau mot de passe (optionnel)</label>
        <input type="password" name="password" autocomplete="new-password" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
        @error('password')<p class="text-red-500 text-sm mt-1">{{ $message }}</p>@enderror
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Confirmer le mot de passe</label>
        <input type="password" name="password_confirmation" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
    </div>
    <div>
        <label class="block text-sm font-semibold mb-1">Rôle *</label>
        <select name="role" required class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2">
            <option value="reader" @selected(old('role', $user->role) === 'reader')>Lecteur</option>
            <option value="editor" @selected(old('role', $user->role) === 'editor')>Éditeur</option>
            <option value="admin" @selected(old('role', $user->role) === 'admin')>Administrateur</option>
        </select>
    </div>
    <div class="flex gap-4">
        <button type="submit" class="bg-primary text-slate-900 px-6 py-2 rounded-lg font-bold">Enregistrer</button>
        <a href="{{ route('admin.users.index') }}" class="px-6 py-2 rounded-lg border border-slate-300">Annuler</a>
    </div>
</form>
@endsection
