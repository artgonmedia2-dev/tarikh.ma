<?php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "--- TARKIKH.MA FINAL DIAGNOSTIC ---\n";
echo "Date du serveur : " . date('Y-m-d H:i:s') . "\n";

$backend_path = __DIR__ . '/../tarikh-backend';

try {
    echo "1. Chargement de autoload.php...\n";
    if (!file_exists($backend_path . '/vendor/autoload.php')) {
        die("[CRITIQUE] Le dossier 'vendor' est absent ou mal place ! Lancez 'composer install'.");
    }
    require $backend_path . '/vendor/autoload.php';
    echo "[OK]\n";

    echo "2. Initialisation de l'App (bootstrap/app.php)...\n";
    $app = require_once $backend_path . '/bootstrap/app.php';
    // Bootstrap the application to register all services (like 'db')
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    echo "[OK]\n";

    echo "3. Test du Public Path...\n";
    if (method_exists($app, 'usePublicPath')) {
        $app->usePublicPath(__DIR__);
        echo "[OK] usePublicPath() appelé avec succès.\n";
    } else {
        echo "[INFO] usePublicPath() non trouvé, tentative via binding...\n";
        $app->bind('path.public', function() { return __DIR__; });
    }
    
    echo "   Public Path résolu : " . public_path() . "\n";
    echo "   Base Path résolu : " . base_path() . "\n";
    
    if (public_path() === __DIR__) {
        echo "[OK] Le chemin public est maintenant correct.\n";
    } else {
        echo "[WARNING] Le chemin public n'a pas pu être forcé.\n";
    }

    echo "4. Test de la connexion a la BASE DE DONNEES (DB)...\n";
    try {
        $pdo = \DB::getPdo();
        echo "[OK] Connexion a la base de donnees REUSSIE.\n";
        $users_count = \DB::table('users')->count();
        echo "   Nombre d'utilisateurs en base : $users_count\n";
    } catch (Throwable $db_error) {
        echo "[FAIL] Erreur de base de donnees : " . $db_error->getMessage() . "\n";
        echo "       Verifiez DB_DATABASE, DB_USERNAME, DB_PASSWORD dans votre .env sur le serveur.\n";
    }

    echo "\n5. Verification de la APP_KEY...\n";
    if (env('APP_KEY')) {
        echo "[OK] APP_KEY est definie.\n";
    } else {
        echo "[FAIL] APP_KEY est VIDE ! Le cryptage ne fonctionnera pas.\n";
    }

    echo "\n6. Test de lecture des routes...\n";
    $web_path = $backend_path . '/routes/web.php';
    if (file_exists($web_path)) {
        echo "[OK] Fichier routes/web.php trouve.\n";
    } else {
        echo "[FAIL] Fichier routes/web.php ABSENT !\n";
    }

    echo "5. Vérification des CACHES sur le serveur...\n";
    $cache_dir = $backend_path . '/bootstrap/cache';
    if (is_dir($cache_dir)) {
        $files = array_diff(scandir($cache_dir), array('.', '..', '.gitignore'));
        if (empty($files)) {
            echo "[OK] bootstrap/cache est vide.\n";
        } else {
            echo "[WARNING] bootstrap/cache contient des fichiers : " . implode(', ', $files) . " (A SUPPRIMER !)\n";
        }
    }

    $views_dir = $backend_path . '/storage/framework/views';
    if (is_dir($views_dir)) {
        $files = array_diff(scandir($views_dir), array('.', '..', '.gitignore'));
        if (empty($files)) {
            echo "[OK] storage/framework/views est vide.\n";
        } else {
            echo "[WARNING] storage/framework/views contient " . count($files) . " fichiers (A SUPPRIMER !)\n";
        }
    }

    echo "\n6. Lecture des DERNIERES erreurs réelles (laravel.log)...\n";
    $log_path = $backend_path . '/storage/logs/laravel.log';
    if (file_exists($log_path)) {
        $logs = file($log_path);
        // Filtrer pour ne voir que les erreurs d'aujourd'hui
        $today = date('Y-m-d');
        $recent_logs = [];
        foreach (array_reverse($logs) as $line) {
            if (strpos($line, $today) !== false) {
                $recent_logs[] = $line;
            }
            if (count($recent_logs) > 20) break;
        }
        
        if (empty($recent_logs)) {
            echo "Aucune erreur enregistrée aujourd'hui ($today).\n";
        } else {
            echo implode("", array_reverse($recent_logs));
        }
    } else {
        echo "Fichier log introuvable à $log_path\n";
    }

} catch (Throwable $e) {
    echo "\n[ERREUR CRITIQUE DETECTEE]\n";
    echo "Message : " . $e->getMessage() . "\n";
    echo "Fichier : " . $e->getFile() . "\n";
    echo "Ligne : " . $e->getLine() . "\n";
}

echo "\n---------------------------------\n";
?>
