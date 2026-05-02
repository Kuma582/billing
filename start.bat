@echo off
title QuickBill POS Debugger
echo ==========================================
echo    QUICKBILL POS SYSTEM - DIAGNOSTIC
echo ==========================================
echo.
echo 1. Checking Node.js...
node -v
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed! Please install from nodejs.org
    pause
    exit
)

echo 2. Checking Dependencies...
if not exist node_modules (
    echo [INFO] node_modules not found. Installing...
    call npm install
)

echo 3. Starting Server on Port 4000...
echo (If this window closes, there is a crash error)
node server.js
if %errorlevel% neq 0 (
    echo.
    echo [CRITICAL ERROR] Server crashed! 
    echo Please check if Port 4000 is already in use.
)

echo.
echo ==========================================
pause
