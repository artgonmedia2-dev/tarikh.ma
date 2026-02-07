# Tarikh.ma — Créer un projet Laravel et y copier le squelette
# À lancer depuis la racine du dépôt : .\scripts\setup-laravel.ps1

$ErrorActionPreference = "Stop"

# Racine du dépôt (dossier parent du dossier scripts)
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$laravelSkeleton = Join-Path $root "laravel"
$targetDir = Join-Path $root "tarikh-ma-laravel"

if (-not (Test-Path $laravelSkeleton)) {
    Write-Error "Dossier laravel/ introuvable: $laravelSkeleton - Lancez ce script depuis la racine du depot (tarikh.ma)."
}

if (Test-Path $targetDir) {
    Write-Host "Le dossier tarikh-ma-laravel existe deja. Supprimez-le ou choisissez un autre nom." -ForegroundColor Yellow
    exit 1
}

Write-Host "Creation du projet Laravel dans tarikh-ma-laravel/ ..." -ForegroundColor Cyan
Set-Location $root
composer create-project laravel/laravel tarikh-ma-laravel --no-interaction
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $targetDir
composer require laravel/sanctum --no-interaction
php artisan install:api

Write-Host "Copie du squelette Tarikh.ma ..." -ForegroundColor Cyan

function Copy-SkeletonDir {
    param([string]$SrcDir, [string]$DestDir)
    if (-not (Test-Path $SrcDir)) { Write-Error "Source introuvable: $SrcDir" }
    $null = New-Item -ItemType Directory -Path $DestDir -Force
    Copy-Item -Path (Join-Path $SrcDir "*") -Destination $DestDir -Recurse -Force
}

function Copy-SkeletonFile {
    param([string]$Src, [string]$Dest)
    if (-not (Test-Path $Src)) { Write-Error "Fichier introuvable: $Src" }
    $destDir = [System.IO.Path]::GetDirectoryName($Dest)
    $null = New-Item -ItemType Directory -Path $destDir -Force
    Copy-Item -Path $Src -Destination $Dest -Force
}

$db = Join-Path $laravelSkeleton "database"
$app = Join-Path $laravelSkeleton "app"
$routes = Join-Path $laravelSkeleton "routes"
$views = Join-Path $laravelSkeleton "resources"
$http = Join-Path $app "Http"

Copy-SkeletonDir (Join-Path $db "migrations") (Join-Path $targetDir "database\migrations")
Copy-SkeletonDir (Join-Path $db "seeders") (Join-Path $targetDir "database\seeders")
Copy-SkeletonDir (Join-Path $app "Models") (Join-Path $targetDir "app\Models")
Copy-SkeletonDir (Join-Path $http "Controllers") (Join-Path $targetDir "app\Http\Controllers")
Copy-SkeletonFile (Join-Path $http "Middleware\EnsureUserHasRole.php") (Join-Path $targetDir "app\Http\Middleware\EnsureUserHasRole.php")
Copy-SkeletonFile (Join-Path $routes "web.php") (Join-Path $targetDir "routes\web.php")
Copy-SkeletonFile (Join-Path $routes "api.php") (Join-Path $targetDir "routes\api.php")
Copy-SkeletonFile (Join-Path $routes "auth.php") (Join-Path $targetDir "routes\auth.php")
Copy-SkeletonDir (Join-Path $views "views") (Join-Path $targetDir "resources\views")
Copy-SkeletonFile (Join-Path $laravelSkeleton ".env.example") (Join-Path $targetDir ".env")

Write-Host ""
Write-Host "Projet Laravel pret dans: $targetDir" -ForegroundColor Green
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "  1. cd tarikh-ma-laravel"
Write-Host "  2. Editer .env (DB_DATABASE=tarikh_ma, DB_USERNAME, DB_PASSWORD)"
Write-Host "  3. php artisan key:generate"
Write-Host "  4. Dans bootstrap/app.php, enregistrer le middleware 'role' (voir laravel/README_LARAVEL.md)"
Write-Host "  5. php artisan migrate"
Write-Host "  6. php artisan db:seed"
Write-Host "  7. php artisan serve"
