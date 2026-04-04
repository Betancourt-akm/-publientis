const jwt = require('jsonwebtoken');
const fs = require('fs');

// Leer el token del archivo
const token = fs.readFileSync('test-token.txt', 'utf8');

// Decodificar el token para obtener la información del usuario
const decoded = jwt.decode(token);

console.log('🔍 Información del usuario desde el token:');
console.log('📧 Email:', decoded.email);
console.log('🆔 ID:', decoded.id);
console.log('👤 Rol:', decoded.role);
console.log('⏰ Expira:', new Date(decoded.exp * 1000));

// Crear objeto de usuario para el frontend
const userObject = {
  _id: decoded.id,
  name: 'Walker de Prueba',
  email: decoded.email,
  role: decoded.role,
  profilePic: ''
};

console.log('\n📋 Objeto de usuario para el frontend:');
console.log(JSON.stringify(userObject, null, 2));
