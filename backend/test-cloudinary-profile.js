require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('🧪 Probando Cloudinary para fotos de perfil...');
console.log('📋 Configuración:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NO CONFIGURADA');
console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? 'CONFIGURADA ✅' : 'NO CONFIGURADA ❌');

// Verificar config de cloudinary
const config = cloudinary.config();
console.log('\n📌 Cloudinary Config Object:');
console.log('   cloud_name:', config.cloud_name);
console.log('   api_key:', config.api_key ? '***' + config.api_key.slice(-4) : 'MISSING');
console.log('   api_secret:', config.api_secret ? 'SET ✅' : 'MISSING ❌');

if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.error('\n❌ ERROR: Cloudinary no está completamente configurado');
  console.log('\n💡 Verifica tu archivo .env:');
  console.log('   CLOUDINARY_CLOUD_NAME=tu_cloud_name');
  console.log('   CLOUDINARY_API_KEY=tu_api_key');
  console.log('   CLOUDINARY_API_SECRET=tu_api_secret');
  process.exit(1);
}

console.log('\n✅ Cloudinary configurado correctamente');
console.log('🎉 Listo para subir fotos de perfil!');
