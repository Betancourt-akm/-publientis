/**
 * Script de Verificación de Cloudinary
 * Ejecutar: node scripts/verify-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('../config/cloudinary');

console.log('\n🔍 Verificando configuración de Cloudinary...\n');

// 1. Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}`);
console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅' : '❌'}`);
console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'}\n`);

// 2. Verificar configuración de Cloudinary
const config = cloudinary.config();
console.log('⚙️  Configuración de Cloudinary:');
console.log(`   Cloud Name: ${config.cloud_name || '❌ No configurado'}`);
console.log(`   API Key: ${config.api_key ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`   API Secret: ${config.api_secret ? '✅ Configurado' : '❌ No configurado'}\n`);

// 3. Probar conexión con Cloudinary
async function testCloudinaryConnection() {
  try {
    console.log('🌐 Probando conexión con Cloudinary...');
    
    // Intentar obtener información de uso
    const result = await cloudinary.api.usage();
    
    console.log('✅ Conexión exitosa!\n');
    console.log('📊 Información de tu cuenta:');
    console.log(`   Plan: ${result.plan || 'Free'}`);
    console.log(`   Créditos usados: ${result.credits?.usage || 0} de ${result.credits?.limit || 'ilimitado'}`);
    console.log(`   Almacenamiento: ${(result.storage?.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Bandwidth: ${(result.bandwidth?.usage / 1024 / 1024).toFixed(2)} MB\n`);
    
    console.log('🎉 Todo está configurado correctamente!\n');
    console.log('✨ Puedes comenzar a subir imágenes.\n');
    
  } catch (error) {
    console.log('❌ Error al conectar con Cloudinary:\n');
    
    if (error.message.includes('Invalid cloud_name')) {
      console.log('⚠️  El CLOUDINARY_CLOUD_NAME es inválido.');
      console.log('   Verifica que sea el correcto en tu Dashboard de Cloudinary.\n');
    } else if (error.message.includes('Invalid API')) {
      console.log('⚠️  Las credenciales API son inválidas.');
      console.log('   Verifica tu CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.\n');
    } else {
      console.log(`   ${error.message}\n`);
    }
    
    console.log('📖 Soluciones:');
    console.log('   1. Ve a https://cloudinary.com y copia tus credenciales');
    console.log('   2. Actualiza el archivo backend/.env');
    console.log('   3. Reinicia el servidor\n');
    
    process.exit(1);
  }
}

// Ejecutar verificación
if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.log('⚠️  Configuración incompleta!\n');
  console.log('📝 Por favor configura las siguientes variables en backend/.env:\n');
  
  if (!config.cloud_name) console.log('   CLOUDINARY_CLOUD_NAME=tu_cloud_name');
  if (!config.api_key) console.log('   CLOUDINARY_API_KEY=tu_api_key');
  if (!config.api_secret) console.log('   CLOUDINARY_API_SECRET=tu_api_secret');
  
  console.log('\n💡 Obtén tus credenciales en: https://cloudinary.com/console\n');
  process.exit(1);
} else {
  testCloudinaryConnection();
}
