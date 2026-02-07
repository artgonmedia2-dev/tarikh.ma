# Script Automatisé Ngrok pour Tarikh.ma
$projectName = "Tarikh.ma"

Write-Host "--- Ngrok Setup for $projectName ---" -ForegroundColor Cyan

# 1. Localiser Ngrok
$ngrokPath = "ngrok" # Fallback
$possiblePaths = @(
    "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\ngrok.ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\ngrok.ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe",
    "C:\Program Files\ngrok\ngrok.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $ngrokPath = $path
        break
    }
}

Write-Host "Using Ngrok from: $ngrokPath"

# 2. Demarrer Ngrok en arriere-plan
Write-Host "Starting Ngrok..."
$ngrokProc = Start-Process $ngrokPath -ArgumentList "start --config=ngrok.yml --all" -PassThru -WindowStyle Minimized

Write-Host "Waiting for URLs (10s)..."
Start-Sleep -s 10

# 3. Recuperer les URLs via l'API locale de Ngrok
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $tunnels = $response.Content | ConvertFrom-Json
    
    $apiUrl = ($tunnels.tunnels | Where-Object { $_.name -eq 'api' }).public_url
    $appUrl = ($tunnels.tunnels | Where-Object { $_.name -eq 'app' }).public_url

    if (-not $apiUrl -or -not $appUrl) {
        throw "Could not find both tunnels (api and app). Check your Ngrok dashboard."
    }

    Write-Host "[OK] Backend URL: $apiUrl" -ForegroundColor Green
    Write-Host "[OK] Frontend URL: $appUrl" -ForegroundColor Green

    # 4. Mettre a jour les fichiers .env
    $backendEnv = Join-Path $PSScriptRoot "tarikh-ma-laravel\.env"
    $frontendEnv = Join-Path $PSScriptRoot "frontend\.env"

    Write-Host "Updating .env files..."

    if (Test-Path $backendEnv) {
        (Get-Content $backendEnv) -replace '^APP_URL=.*', "APP_URL=$apiUrl" | Set-Content $backendEnv
        Write-Host " - Updated $backendEnv"
    }
    
    if (Test-Path $frontendEnv) {
        (Get-Content $frontendEnv) -replace '^VITE_API_URL=.*', "VITE_API_URL=$apiUrl/api" | Set-Content $frontendEnv
        Write-Host " - Updated $frontendEnv"
    }

    Write-Host "--- Configuration Complete ---" -ForegroundColor Yellow
    Write-Host "Public Access URL: $appUrl" -ForegroundColor Cyan
    Write-Host "Keep this window open to maintain the connection."
    
    # Keeping script alive
    while ($true) { Start-Sleep -s 60 }

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($ngrokProc) { Stop-Process $ngrokProc -ErrorAction SilentlyContinue }
    Write-Host "Press any key to exit..."
    $x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
