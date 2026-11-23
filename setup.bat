@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0frontend"
echo Installing frontend npm dependencies...
call npm install
echo.
echo Dependencies installed successfully!
echo.
echo Starting development server...
call npm run dev
