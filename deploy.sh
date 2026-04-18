#!/bin/bash
# ══════════════════════════════════════════════
#  Publientis — Script de Deploy en Contabo
#  Uso: bash deploy.sh
# ══════════════════════════════════════════════
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 PUBLIENTIS — DEPLOY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Pull últimos cambios
echo ""
echo "📥 [1/4] Actualizando código desde GitHub..."
git pull origin main

# 2. Backend — solo instala si cambió package.json
echo ""
echo "⚙️  [2/4] Backend — verificando dependencias..."
cd backend
pnpm install
cd ..
echo "   ✓ Backend listo"

# 3. Frontend — build de producción
echo ""
echo "⚛️  [3/4] Frontend — construyendo..."
cd frontend

# Solo reinstala node_modules si package.json cambió desde el último build
if [ package.json -nt node_modules/.pnpm-lock.yaml ] 2>/dev/null || [ ! -d node_modules ]; then
  echo "   → Instalando dependencias (package.json cambió)..."
  pnpm install
else
  echo "   → Dependencias sin cambios, saltando pnpm install"
fi

pnpm run build
cd ..
echo "   ✓ Build completado"

# 4. Reiniciar procesos PM2
echo ""
echo "🔄 [4/4] Reiniciando PM2..."
pm2 restart all
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Deploy completado exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
