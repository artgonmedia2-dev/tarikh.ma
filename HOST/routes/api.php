<?php

use App\Http\Controllers\Api\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController as ApiDocumentController;
use App\Http\Controllers\Api\DocumentPageController as ApiDocumentPageController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

// Public API (Phase 9: rate limiting)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('themes', function () {
        return Cache::remember('api_themes', 3600, fn () => \App\Models\Theme::orderBy('name')->get(['id', 'name', 'slug']));
    });
    Route::get('regions', function () {
        return Cache::remember('api_regions', 3600, fn () => \App\Models\Region::orderBy('name')->get(['id', 'name', 'slug']));
    });
    Route::get('documents', [ApiDocumentController::class, 'index']);
    Route::get('documents/{document}', [ApiDocumentController::class, 'show']);
});

Route::middleware('throttle:120,1')->get('documents/{document}/stream', [ApiDocumentController::class, 'stream'])
    ->name('api.documents.stream');
Route::get('documents/{document}/thumbnail', [ApiDocumentController::class, 'thumbnail'])
    ->name('api.documents.thumbnail');

// Document pages: signed URLs (for flipbook) + signed stream (with watermark)
Route::middleware('throttle:120,1')->get('documents/{document}/pages/urls', [ApiDocumentPageController::class, 'signedUrls'])
    ->name('api.documents.pages.urls');
Route::middleware(['throttle:120,1', 'signed'])->get('documents/{document}/pages/{page}', [ApiDocumentPageController::class, 'stream'])
    ->whereNumber('page')
    ->name('api.documents.pages.stream');

// Auth (Sanctum) — Phase 5, rate limit Phase 9
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
});

// Admin (auth + role) — Phase 5–7
Route::middleware(['auth:sanctum', 'role:admin,editor', 'throttle:60,1'])->prefix('admin')->group(function () {
    Route::get('stats', [StatsController::class, 'index']);
    Route::get('documents/{document}/conversion-progress', [AdminDocumentController::class, 'conversionProgress'])->name('admin.documents.conversion-progress');
    Route::post('documents/{document}/regenerate-pages', [AdminDocumentController::class, 'regeneratePages'])->name('admin.documents.regenerate-pages');
    Route::apiResource('documents', AdminDocumentController::class);
});
Route::middleware(['auth:sanctum', 'role:admin', 'throttle:60,1'])->prefix('admin')->group(function () {
    Route::apiResource('users', AdminUserController::class);
});
