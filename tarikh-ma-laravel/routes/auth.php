<?php

use Illuminate\Support\Facades\Route;

// Routes d'authentification web (login/register) optionnelles.
// Projet Tarikh.ma : l'auth principale est via l'API (Sanctum) pour le frontend React.
// On définit tout de même la route nommée 'login' pour éviter RouteNotFoundException
// (middleware, vues Blade). Redirection vers l'accueil ; le frontend gère la page de connexion.
Route::get('/login', fn () => redirect()->route('home'))->name('login');
Route::get('/register', fn () => redirect()->route('home'))->name('register');
