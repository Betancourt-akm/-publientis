require('dotenv').config();

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO:\n');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NO ENCONTRADO');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌ NO ENCONTRADO');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NO ENCONTRADO');

if (process.env.CLOUDINARY_API_KEY === 'tu_api_key_aqui_de_cloudinary') {
    console.log('\n❌❌❌ ERROR: CLOUDINARY_API_KEY es un PLACEHOLDER, no una key real');
}

if (process.env.CLOUDINARY_API_SECRET === 'tu_api_secret_aqui_de_cloudinary') {
    console.log('❌❌❌ ERROR: CLOUDINARY_API_SECRET es un PLACEHOLDER, no una key real');
}
