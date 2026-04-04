/**
 * Script de Prueba de Upload
 * Ejecutar: node scripts/test-upload.js
 * 
 * Este script crea una imagen de prueba y la sube a Cloudinary
 */

require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const { createCanvas } = require('canvas');

console.log('\n🧪 Test de Upload de Imágenes a Cloudinary\n');

async function createTestImage() {
  try {
    // Nota: Si no tienes canvas instalado, comenta esta sección
    // y usa una imagen existente
    console.log('📸 Creando imagen de prueba...');
    
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // Fondo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Texto
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Test Upload', 400, 280);
    ctx.font = '24px Arial';
    ctx.fillText(new Date().toLocaleString(), 400, 340);
    
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    console.log('⚠️  No se pudo crear imagen de prueba con canvas');
    console.log('   Instalando canvas: npm install canvas');
    console.log('   O usa este script con una imagen existente\n');
    throw error;
  }
}

async function testUpload() {
  try {
    console.log('☁️  Subiendo imagen a Cloudinary...\n');
    
    const imageBuffer = await createTestImage();
    
    // Subir imagen usando stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'test',
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(imageBuffer);
    });
    
    console.log('✅ Upload exitoso!\n');
    console.log('📊 Información de la imagen:');
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Formato: ${result.format}`);
    console.log(`   Tamaño: ${result.width}x${result.height}px`);
    console.log(`   Bytes: ${(result.bytes / 1024).toFixed(2)} KB\n`);
    
    console.log('🗑️  Limpiando imagen de prueba...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Imagen eliminada\n');
    
    console.log('🎉 ¡Sistema de upload funcionando correctamente!\n');
    
  } catch (error) {
    console.log('❌ Error en el test:\n');
    console.log(`   ${error.message}\n`);
    process.exit(1);
  }
}

// Ejecutar test
testUpload();
