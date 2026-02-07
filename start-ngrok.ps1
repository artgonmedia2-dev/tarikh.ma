# Script de DEBOGAGE Ngrok pour Tarikh.ma
$projectName = "Tarikh.ma"

Write-Host "--- Debugging Ngrok Setup for $projectName ---" -ForegroundColor Cyan

# 1. Localiser Ngrok
$ngrokPath = "ngrok" # Fallback
$possiblePaths = @(
    "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\ngrok.ngrok_Microsoft.WinGet.Source_8wekyb3d8bbwe\ngrok.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\ngrok.ngrok_Microsoft.WinGet.Source_8wekyb3d8bbwe\ngrok.exe",
    "C:\Program Files\ngrok\ngrok.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $ngrokPath = $path
        break
    }
}

Write-Host "Using Ngrok from: $ngrokPath"

# 2. Arreter les anciennes instances
Write-Host "Cleaning old instances..."
Stop-Process -Name ngrok -ErrorAction SilentlyContinue

# 3. Demarrer Ngrok (FENETRE VISIBLE pour voir l'erreur)
Write-Host "Starting Ngrok (Check the new window for errors)..."
$ngrokProc = Start-Process $ngrokPath -ArgumentList "start --config=ngrok.yml --all" -PassThru

Write-Host "Waiting for URLs (15s)..."
Start-Sleep -s 15

# 4. Recuperer les URLs via l'API locale de Ngrok
try {
    Write-Host "Connecting to Ngrok API (http://localhost:4040)..."
    $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $tunnels = $response.Content | ConvertFrom-Json
    
    $apiUrl = ($tunnels.tunnels | Where-Object { $_.name -eq 'api' }).public_url
    $appUrl = ($tunnels.tunnels | Where-Object { $_.name -eq 'app' }).public_url

    if (-not $apiUrl -or -not $appUrl) {
        throw "Could not find both tunnels. If the ngrok window says 'Your account is limited to 1 tunnel', we will need to change the config."
    }

    Write-Host "[OK] Backend URL: $apiUrl" -ForegroundColor Green
    Write-Host "[OK] Frontend URL: $appUrl" -ForegroundColor Green

    # 5. Mettre a jour les fichiers .env
    $backendEnv = Join-Path $PSScriptRoot "tarikh-ma-laravel\.env"
    $frontendEnv = Join-Path $PSScriptRoot "frontend\.env"

    Write-Host "Updating .env files..."
    if (Test-Path $backendEnv) { (Get-Content $backendEnv) -replace '^APP_URL=.*', "APP_URL=$apiUrl" | Set-Content $backendEnv }
    if (Test-Path $frontendEnv) { (Get-Content $frontendEnv) -replace '^VITE_API_URL=.*', "VITE_API_URL=$apiUrl/api" | Set-Content $frontendEnv }

    Write-Host "--- Success ---" -ForegroundColor Yellow
    Write-Host "Access URL: $appUrl"
    while ($true) { Start-Sleep -s 60 }

} catch {
    Write-Host "`n!!! ERROR !!!" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)"
    Write-Host "`nCHECK THE OTHER NGROK WINDOW THAT OPENED."
    Write-Host "Does it show an error about 'Session' or 'Limit'?"
    pause
}
