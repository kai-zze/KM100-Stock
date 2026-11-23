param(
    [string]$mode = "prod"
)

$env:Path += ";C:\Program Files\nodejs"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"

if ($mode -eq "dev") {
    Write-Host "Starting Vite Development Server with HMR at http://localhost:3000 ..." -ForegroundColor Cyan
    cmd /c npx vite --host --port 3000
} else {
    Write-Host "Building optimized production assets for 100/100 Lighthouse performance..." -ForegroundColor Green
    cmd /c npm run build
    Write-Host "Starting high-performance server at http://localhost:3000 ..." -ForegroundColor Green
    cmd /c npx vite preview --host --port 3000
}
