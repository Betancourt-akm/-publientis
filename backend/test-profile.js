const axios = require('axios');
const fs = require('fs');

async function testProfile() {
  try {
    // Leer el token del archivo
    const token = fs.readFileSync('test-token.txt', 'utf8');
    console.log('🔑 Usando token:', token.substring(0, 20) + '...');
    
    console.log('🔄 Probando endpoint del perfil...');
    
    const response = await axios.get('http://localhost:8070/api/walkers/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Perfil obtenido exitosamente:');
    console.log('📊 Datos del perfil:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

testProfile();
