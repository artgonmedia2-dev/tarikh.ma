<?php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "--- TARKIKH.MA ADVANCED DEBUG ---\n";
echo "PHP version: " . PHP_VERSION . "\n";
echo "Active Extensions: " . implode(', ', get_loaded_extensions()) . "\n\n";

$backend_path = __DIR__ . '/../tarikh-backend';

function test_path($path, $is_dir = false) {
    if ($is_dir) {
        if (is_dir($path)) {
            $perms = substr(sprintf('%o', fileperms($path)), -4);
            echo "[OK] Directory exists: $path (Perms: $perms)\n";
            return true;
        }
        echo "[FAIL] Directory MISSING: $path\n";
    } else {
        if (file_exists($path)) {
            $perms = substr(sprintf('%o', fileperms($path)), -4);
            echo "[OK] File exists: $path (Perms: $perms)\n";
            return true;
        }
        echo "[FAIL] File MISSING: $path\n";
    }
    return false;
}

test_path($backend_path, true);
test_path($backend_path . '/storage', true);
test_path($backend_path . '/storage/framework/views', true);
test_path($backend_path . '/bootstrap/cache', true);
test_path($backend_path . '/vendor/autoload.php');
test_path($backend_path . '/.env');
test_path($backend_path . '/routes/web.php');
test_path($backend_path . '/routes/auth.php');

echo "\n--- .env CHECK ---\n";
if (file_exists($backend_path . '/.env')) {
    $env = file_get_contents($backend_path . '/.env');
    if (strpos($env, 'APP_KEY=') !== false && strlen(trim(explode('APP_KEY=', $env)[1])) > 10) {
        echo "[OK] APP_KEY is set.\n";
    } else {
        echo "[FAIL] APP_KEY is missing or too short!\n";
    }
}

$log_file = $backend_path . '/storage/logs/laravel.log';
echo "\n--- LAST 20 LINES OF LARAVEL LOG ---\n";
if (file_exists($log_file)) {
    $lines = file($log_file);
    $last_lines = array_slice($lines, -20);
    echo implode("", $last_lines);
} else {
    echo "Log file not found at $log_file\n";
}

echo "\n--- TESTING BOOTSTRAP INCLUSION ---\n";
try {
    if (file_exists($backend_path . '/vendor/autoload.php')) {
        echo "Attempting to require autoload.php...\n";
        require $backend_path . '/vendor/autoload.php';
        echo "[OK] Autoloaded successfully.\n";
    }
} catch (Throwable $e) {
    echo "[CRITICAL] Failed to autoload: " . $e->getMessage() . "\n";
}

echo "\n---------------------------------\n";
?>
