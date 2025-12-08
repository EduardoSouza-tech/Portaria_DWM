@echo off
chcp 65001 >nul
title Parar Servidores - Portaria Inteligente
color 0C

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         🛑 PARANDO SERVIDORES - PORTARIA INTELIGENTE      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo [1/2] 🔴 Parando Backend (Python)...
taskkill /FI "WINDOWTITLE eq Backend API - FastAPI*" /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend parado!
) else (
    echo ⚠️ Backend não estava rodando
)
echo.

echo [2/2] 🔴 Parando Frontend (Node)...
taskkill /FI "WINDOWTITLE eq Frontend - React Vite*" /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend parado!
) else (
    echo ⚠️ Frontend não estava rodando
)
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              ✅ SERVIDORES FINALIZADOS!                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
pause
