const axios = require('axios');
const fs = require('fs');

async function testUserDetails() {
  try {
    // Leer el token del archivo
    const token = fs.readFileSync('test-token.txt', 'utf8');
    console.log('🔑 Usando token:', token.substring(0, 20) + '...');
    
    console.log('🔄 Probando endpoint de user details...');
    
    const response = await axios.get('http://localhost:8070/api/users/user-details', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User details obtenidos exitosamente:');
    console.log('📊 Datos del usuario:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error obteniendo user details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

testUserDetails();
