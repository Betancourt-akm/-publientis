/**
 * Script de verificación del endpoint de upload
 * Ejecutar: node test-upload-endpoint.js
 */

const http = require('http');

console.log('🔍 Verificando endpoint /api/upload/image...\n');

const options = {
  hostname: 'localhost',
  port: 8070,
  path: '/api/upload/image',
  method: 'GET', // Solo verificar si existe
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  
  if (res.statusCode === 404) {
    console.log('❌ ERROR: La ruta /api/upload/image NO existe');
    console.log('🔧 SOLUCIÓN:');
    console.log('   1. Verifica que uploadRoutes esté importado en routes/index.minimal.js');
    console.log('   2. REINICIA el servidor backend (npm start)');
    console.log('   3. Vuelve a ejecutar este script\n');
  } else if (res.statusCode === 401) {
    console.log('✅ ÉXITO: La ruta /api/upload/image EXISTE');
    console.log('   (401 = No autorizado, pero la ruta funciona)');
    console.log('   Ahora puedes subir imágenes desde el frontend\n');
  } else {
    console.log(`ℹ️  La ruta respondió con código: ${res.statusCode}`);
    console.log('   La ruta existe, pero revisa la configuración\n');
  }
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data) {
      console.log('📄 Respuesta del servidor:');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(data);
      }
    }
  });
});

req.on('error', (error) => {
  console.log('❌ ERROR DE CONEXIÓN:');
  console.log(`   ${error.message}`);
  console.log('\n🔧 POSIBLES CAUSAS:');
  console.log('   1. El servidor backend NO está corriendo');
  console.log('   2. El puerto 8070 está bloqueado');
  console.log('   3. Problema de configuración de red\n');
  console.log('💡 SOLUCIÓN:');
  console.log('   Ejecuta: npm start (en la carpeta backend)\n');
});

req.end();

// También verificar el servidor básico
setTimeout(() => {
  console.log('\n🔍 Verificando servidor básico...\n');
  
  const healthOptions = {
    hostname: 'localhost',
    port: 8070,
    path: '/api/health',
    method: 'GET'
  };
  
  const healthReq = http.request(healthOptions, (res) => {
    console.log(`📡 Health check status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Servidor backend está funcionando correctamente\n');
    } else {
      console.log('⚠️  Servidor responde pero con errores\n');
    }
  });
  
  healthReq.on('error', (error) => {
    console.log('❌ Servidor backend NO responde');
    console.log('   Asegúrate de iniciar el servidor con: npm start\n');
  });
  
  healthReq.end();
}, 1000);
