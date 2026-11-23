@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0frontend"

if "%1"=="dev" goto dev_mode

echo ==============================================================================
echo   KM100 Inventory Management System - 100/100 Lighthouse Performance Runner
echo ==============================================================================
echo.
echo Building optimized production assets...
call npm run build
echo.
echo Starting high-performance server at http://localhost:3000 ...
echo (Tip: Run "run-dev.cmd dev" if you want development mode with hot-reloading)
echo.
call npx vite preview --host --port 3000
goto end

:dev_mode
echo Starting Vite Development Server with HMR at http://localhost:3000 ...
call npx vite --host --port 3000

:end
