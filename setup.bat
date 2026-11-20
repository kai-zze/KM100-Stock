@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "c:\Users\KM100 - 1008\Downloads\KM100 Stock"
echo Installing npm dependencies...
npm install
echo.
echo Dependencies installed successfully!
echo.
echo Starting development server...
npm run dev