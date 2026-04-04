const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verificar configuración
const verifyCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    console.error('❌ Error: Configuración de Cloudinary incompleta');
    console.error('Asegúrate de tener las siguientes variables de entorno:');
    console.error('- CLOUDINARY_CLOUD_NAME');
    console.error('- CLOUDINARY_API_KEY');
    console.error('- CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  
  console.log('✅ Cloudinary configurado correctamente');
  console.log(`📁 Cloud Name: ${cloud_name}`);
};

// Verificar configuración al cargar el módulo
verifyCloudinaryConfig();

module.exports = cloudinary;
