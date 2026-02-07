<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tarikh.ma — Plateforme d'archives numériques du patrimoine historique marocain">
    <title>@yield('title', 'Tarikh.ma') — Patrimoine du Maroc</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#11d483',
                        'background-light': '#fcfaf7',
                        'background-dark': '#10221a',
                    },
                },
            },
        }
    </script>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="{{ route('home') }}" class="flex items-center gap-3">
                <span class="text-primary text-2xl">📜</span>
                <span class="text-xl font-black tracking-tight">Tarikh.ma</span>
            </a>
            <nav class="hidden md:flex items-center gap-8">
                <a href="{{ route('documents.index') }}" class="text-sm font-semibold hover:text-primary transition-colors">Archives</a>
                <a href="{{ route('about') }}" class="text-sm font-semibold hover:text-primary transition-colors">À Propos</a>
                @auth
                    @if(in_array(auth()->user()->role, ['admin', 'editor']))
                        <a href="{{ route('admin.dashboard') }}" class="text-sm font-semibold text-primary">Admin</a>
                    @endif
                    <form method="POST" action="{{ route('logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="text-sm font-semibold hover:text-primary">Déconnexion</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="bg-primary text-slate-900 px-5 py-2 rounded-lg font-bold text-sm">Connexion</a>
                @endauth
            </nav>
        </div>
    </header>

    <main class="flex-1">
        @if(session('success'))
            <div class="max-w-7xl mx-auto px-6 py-2">
                <p class="text-sm text-green-600 dark:text-green-400">{{ session('success') }}</p>
            </div>
        @endif
        @yield('content')
    </main>

    <footer class="border-t border-slate-200 dark:border-slate-800 py-8 px-6 mt-auto">
        <div class="max-w-7xl mx-auto text-center text-sm text-slate-500">
            © {{ date('Y') }} Tarikh.ma — Plateforme d'archives numériques du patrimoine marocain.
        </div>
    </footer>
</body>
</html>
