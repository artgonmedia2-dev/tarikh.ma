<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../tarikh-backend/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../tarikh-backend/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../tarikh-backend/bootstrap/app.php';

if (method_exists($app, 'usePublicPath')) {
    $app->usePublicPath(__DIR__);
} else {
    $app->bind('path.public', function() { return __DIR__; });
}

$app->handleRequest(Request::capture());
