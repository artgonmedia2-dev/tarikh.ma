<?php

use App\Http\Controllers\Api\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController as ApiDocumentController;
use Illuminate\Support\Facades\Route;

// Public API
Route::get('themes', fn () => \App\Models\Theme::orderBy('name')->get(['id', 'name', 'slug']));
Route::get('regions', fn () => \App\Models\Region::orderBy('name')->get(['id', 'name', 'slug']));
Route::get('documents', [ApiDocumentController::class, 'index']);
Route::get('documents/{document}', [ApiDocumentController::class, 'show']);

// Auth (Sanctum)
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
});

// Stream fichier (public ou avec token) — appelé depuis le front pour afficher le document
Route::get('documents/{document}/stream', [ApiDocumentController::class, 'stream'])
    ->name('api.documents.stream');

// Admin (auth + role)
Route::middleware(['auth:sanctum', 'role:admin,editor'])->prefix('admin')->group(function () {
    Route::get('stats', [StatsController::class, 'index']);
    Route::apiResource('documents', AdminDocumentController::class);
});
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('users', AdminUserController::class)->except(['show']);
});
