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

# Detectar gestor de paquetes disponible
if command -v pnpm &> /dev/null; then
  PKG="pnpm"
else
  PKG="npm"
fi
echo "   → Gestor detectado: $PKG"

# 1. Pull últimos cambios
echo ""
echo "📥 [1/4] Actualizando código desde GitHub..."
git pull origin main

# 2. Backend — eliminar lock files conflictivos e instalar
echo ""
echo "⚙️  [2/4] Backend — instalando dependencias..."
cd backend
rm -f package-lock.json yarn.lock
$PKG install
cd ..
echo "   ✓ Backend listo"

# 3. Frontend — build de producción
echo ""
echo "⚛️  [3/4] Frontend — construyendo..."
cd frontend
rm -f package-lock.json yarn.lock
$PKG install
$PKG run build
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
