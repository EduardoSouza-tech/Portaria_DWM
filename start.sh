#!/bin/bash

echo "🚀 Iniciando deploy no Railway..."

# Build do frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copiar build do frontend para servir pelo FastAPI
echo "📂 Copiando arquivos estáticos..."
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
cd backend
python init_db.py

# Iniciar servidor
echo "✅ Iniciando servidor na porta ${PORT:-8000}..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
