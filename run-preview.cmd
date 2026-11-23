@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0frontend"
echo Building optimized production bundle...
call npm run build
echo.
echo Launching blazing-fast production preview server at http://localhost:3000 ...
call npx vite preview --port 3000
