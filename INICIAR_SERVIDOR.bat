@echo off
chcp 65001 >nul
title Portaria Inteligente - Servidor Local
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         🏢 PORTARIA INTELIGENTE - SERVIDOR LOCAL 🏢       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo [1/3] 🐍 Ativando ambiente Python virtual...
call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao ativar ambiente virtual!
    echo Verifique se o ambiente .venv existe na pasta do projeto.
    pause
    exit /b 1
)
echo ✅ Ambiente Python ativado!
echo.

echo [2/3] 🚀 Iniciando Backend (FastAPI)...
cd backend
start "Backend API - FastAPI" cmd /k "python main.py"
cd ..
timeout /t 5 /nobreak >nul
echo ✅ Backend rodando em http://localhost:8000
echo 📚 Documentação API: http://localhost:8000/docs
echo.

echo [3/3] ⚛️ Iniciando Frontend (React + Vite)...
cd frontend
start "Frontend - React Vite" cmd /k "set PATH=%PATH%;%ProgramFiles%\nodejs && npm run dev"
cd ..
timeout /t 3 /nobreak >nul
echo ✅ Frontend rodando em http://localhost:5173
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                  ✅ SISTEMA INICIADO!                      ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  🌐 Acesse: http://localhost:5173                         ║
echo ║  📖 API Docs: http://localhost:8000/docs                  ║
echo ║                                                           ║
echo ║  👤 Login de teste:                                       ║
echo ║     Email: admin@portaria.com                             ║
echo ║     Senha: admin123                                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Pressione qualquer tecla para fechar este terminal...
echo (Os servidores continuarão rodando em segundo plano)
pause >nul
