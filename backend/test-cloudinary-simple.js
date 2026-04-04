/**
 * Test simple de Cloudinary
 * Ejecutar: node test-cloudinary-simple.js
 */

require('dotenv').config();

console.log('🔍 Verificando configuración de Cloudinary...\n');

// Verificar variables de entorno
console.log('Variables de entorno:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NO CONFIGURADO');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET (***' + process.env.CLOUDINARY_API_KEY.slice(-4) + ')' : '❌ NO CONFIGURADO');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NO CONFIGURADO');

// Intentar cargar Cloudinary
try {
  const cloudinary = require('cloudinary').v2;
  console.log('\n✅ Cloudinary package found');
  
  // Verificar configuración
  const config = cloudinary.config();
  console.log('\n📋 Configuración de Cloudinary:');
  console.log('Cloud Name:', config.cloud_name || '❌ NO CONFIGURADO');
  console.log('API Key:', config.api_key || '❌ NO CONFIGURADO');
  console.log('API Secret:', config.api_secret ? 'SET' : '❌ NO CONFIGURADO');
  
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.log('\n❌ ERROR: Cloudinary NO está completamente configurado');
    console.log('\n🔧 SOLUCIÓN:');
    console.log('1. Abre: backend/.env');
    console.log('2. Busca las líneas de CLOUDINARY');
    console.log('3. Reemplaza con tus keys reales de Cloudinary Dashboard');
    console.log('4. Guarda el archivo');
    console.log('5. Reinicia el servidor backend\n');
  } else {
    console.log('\n✅ Cloudinary está completamente configurado');
    console.log('\n📸 Puedes intentar subir imágenes ahora.');
  }
  
} catch (error) {
  console.log('\n❌ ERROR:', error.message);
  console.log('\n🔧 SOLUCIÓN: Ejecuta: pnpm install cloudinary\n');
}
