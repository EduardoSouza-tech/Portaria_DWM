@echo off
chcp 65001 >nul
title Reinicializar Banco de Dados - Portaria Inteligente
color 0E

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║      🗄️ REINICIALIZAR BANCO DE DADOS - PORTARIA          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo ⚠️ ATENÇÃO: Isso irá APAGAR todos os dados e recriar o banco!
echo.
set /p confirma="Deseja continuar? (S/N): "
if /i not "%confirma%"=="S" (
    echo ❌ Operação cancelada!
    pause
    exit /b 0
)

echo.
echo [1/3] 🐍 Ativando ambiente Python virtual...
call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao ativar ambiente virtual!
    pause
    exit /b 1
)
echo ✅ Ambiente ativado!
echo.

echo [2/3] 🗑️ Removendo banco antigo...
cd backend
if exist portaria.db (
    del portaria.db
    echo ✅ Banco antigo removido!
) else (
    echo ⚠️ Banco não existia
)
echo.

echo [3/3] 🔨 Criando novo banco com dados de exemplo...
python init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao criar banco!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              ✅ BANCO REINICIALIZADO!                     ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  👤 Login de teste recriado:                              ║
echo ║     Email: admin@portaria.com                             ║
echo ║     Senha: admin123                                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
pause
