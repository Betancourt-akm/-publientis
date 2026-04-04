const axios = require('axios');

async function createTestUser() {
  try {
    console.log('🔄 Creando usuario de prueba...');
    
    const response = await axios.post('http://localhost:8070/api/test/create-walker', {});
    
    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('🔑 Token:', response.data.data.token);
    console.log('👤 Rol:', response.data.data.user.role);
    
    // Guardar el token en un archivo para uso posterior
    const fs = require('fs');
    fs.writeFileSync('test-token.txt', response.data.data.token);
    console.log('💾 Token guardado en test-token.txt');
    
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error.response?.data || error.message);
  }
}

createTestUser();
