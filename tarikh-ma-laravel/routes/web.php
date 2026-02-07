<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

// Public API (Géré par React, on laisse Laravel gérer uniquement le stream si besoin)
// Route::get('/', [HomeController::class, 'index'])->name('home');
// Route::get('/a-propos', [HomeController::class, 'about'])->name('about');
// Route::get('/archives', [DocumentController::class, 'index'])->name('documents.index');
// Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
Route::get('/documents/{document}/stream', [DocumentController::class, 'stream'])->name('documents.stream');

// Admin (auth + role admin|editor)
Route::middleware(['auth', 'role:admin,editor'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::resource('documents', AdminDocumentController::class)->except(['show']);
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', AdminUserController::class);
});

require __DIR__ . '/auth.php';
