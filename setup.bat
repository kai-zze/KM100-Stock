@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo   KM100 Property Custody & Inventory Management System
echo ========================================================
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
  echo [ERROR] Failed to install dependencies.
  pause
  exit /b %ERRORLEVEL%
)
echo.
echo Starting local development server...
echo.
call npm run dev
