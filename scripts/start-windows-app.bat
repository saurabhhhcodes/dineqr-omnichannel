@echo off
title DineQR Desktop POS ^& Clinic Reception Suite (Windows)
echo ==============================================================
echo    DineQR Desktop POS ^& Clinic Suite (Windows Launch System)
echo ==============================================================
echo.
echo [1/3] Checking Node.js runtime...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js LTS from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Starting DineQR Local Background Service on port 3001...
start "DineQR Server" /B node server/index.js

echo Waiting 2 seconds for server initialization...
timeout /t 2 /nobreak >nul

echo [3/3] Launching Windows Desktop Application...
npx electron electron/main.cjs

echo.
echo Application closed.
exit /b 0
