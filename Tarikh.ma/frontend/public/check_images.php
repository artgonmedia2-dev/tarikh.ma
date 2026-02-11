<?php
// check_images.php
// Place this in public_html and access it via your domain/check_images.php

header('Content-Type: text/plain');
require __DIR__ . '/../tarikh-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../tarikh-backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\HeritageSection;

echo "--- DIAGNOSTIC DES CATEGORIES HERITAGE ---\n\n";

try {
    $sections = HeritageSection::all();
    if ($sections->isEmpty()) {
        echo "[ERREUR] Aucune catégorie trouvée dans la base de données. Avez-vous exécuté le seeder ?\n";
    } else {
        foreach ($sections as $s) {
            echo "ID: " . $s->id . "\n";
            echo "Titre: " . $s->title . "\n";
            echo "URL Image brute: " . $s->image_path . "\n";
            echo "Longueur URL: " . strlen($s->image_path) . " caractères\n";
            echo "URL générée (image_url): " . $s->image_url . "\n";
            echo "-----------------------------------\n";
        }
    }
} catch (\Exception $e) {
    echo "[CRITICAL] Erreur : " . $e->getMessage() . "\n";
}

echo "\n--- CONFIGURATION SERVEUR ---\n";
echo "APP_URL: " . env('APP_URL') . "\n";
echo "Asset URL (test): " . asset('storage/test.jpg') . "\n";
