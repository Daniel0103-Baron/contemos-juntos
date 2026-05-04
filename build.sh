#!/bin/bash
set -e

echo "🔨 Construyendo frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..

echo "✅ Build completado"
