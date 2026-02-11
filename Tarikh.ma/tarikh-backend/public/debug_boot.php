<?php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "--- TARKIKH.MA BOOT TEST ---\n";

$backend_path = __DIR__ . '/../tarikh-backend';

try {
    echo "1. Requiring autoload.php...\n";
    require $backend_path . '/vendor/autoload.php';
    echo "[OK]\n";

    echo "2. Requiring bootstrap/app.php...\n";
    $app = require_once $backend_path . '/bootstrap/app.php';
    echo "[OK]\n";

    echo "3. Forcing Public Path...\n";
    $app->usePublicPath(__DIR__);
    echo "[OK]\n";

    echo "4. Testing paths...\n";
    echo "   Base Path: " . base_path() . "\n";
    echo "   Public Path: " . public_path() . "\n";
    echo "   Storage Path: " . storage_path() . "\n";
    
    echo "4. Checking DB Connection...\n";
    try {
        \DB::connection()->getPdo();
        echo "[OK] Database connected.\n";
    } catch (\Exception $e) {
        echo "[FAIL] Database error: " . $e->getMessage() . "\n";
    }

    echo "5. Checking for missing routes file in code...\n";
    $web_routes = $backend_path . '/routes/web.php';
    $content = file_get_contents($web_routes);
    if (strpos($content, "require __DIR__ . '/auth.php';") !== false) {
        echo "[WARNING] web.php still contains hard 'require' for auth.php without check.\n";
    } else {
        echo "[OK] web.php seems patched.\n";
    }

} catch (Throwable $e) {
    echo "\n[CRITICAL ERROR DURING BOOT]\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n---------------------------------\n";
?>
