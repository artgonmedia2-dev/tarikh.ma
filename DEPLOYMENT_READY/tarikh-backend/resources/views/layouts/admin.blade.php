<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin') — Tarikh.ma</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { theme: { extend: { colors: { primary: '#11d483' } } } }
    </script>
</head>
<body class="bg-slate-100 dark:bg-slate-900 min-h-screen">
    <div class="flex">
        <aside class="w-64 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
            <a href="{{ route('home') }}" class="block text-lg font-bold text-primary mb-6">Tarikh.ma</a>
            <nav class="space-y-1">
                <a href="{{ route('admin.dashboard') }}" class="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">Dashboard</a>
                <a href="{{ route('admin.documents.index') }}" class="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">Documents</a>
                @if(auth()->user()->role === 'admin')
                    <a href="{{ route('admin.users.index') }}" class="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">Utilisateurs</a>
                @endif
            </nav>
        </aside>
        <div class="flex-1 p-8">
            @if(session('success'))
                <p class="text-green-600 dark:text-green-400 text-sm mb-4">{{ session('success') }}</p>
            @endif
            @yield('content')
        </div>
    </div>
</body>
</html>
