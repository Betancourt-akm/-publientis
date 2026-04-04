/**
 * Script de prueba para verificar conexión de chat
 * Ejecutar con: node test-chat.js
 */

require('dotenv').config();
const io = require('socket.io-client');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8070';

console.log('🧪 Probando conexión de chat...');
console.log('Backend URL:', BACKEND_URL);

// ID de usuario de prueba - reemplazar con un ID real de tu DB
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // MongoDB ObjectId de ejemplo

const socket = io(BACKEND_URL, {
  auth: {
    userId: TEST_USER_ID,
    userRole: 'user'
  },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Conectado al servidor de chat');
  console.log('Socket ID:', socket.id);
  
  // Probar iniciar chat
  console.log('\n🔄 Probando chat:start...');
  socket.emit('chat:start', { subject: 'Prueba de chat' }, (response) => {
    console.log('📥 Respuesta de chat:start:', response);
    
    if (response.success) {
      console.log('✅ Chat iniciado correctamente');
      console.log('Chat ID:', response.chat._id);
      console.log('Mensajes:', response.messages.length);
      
      // Probar enviar mensaje
      console.log('\n📨 Probando envío de mensaje...');
      socket.emit('message:send', {
        chatId: response.chat._id,
        content: 'Hola, este es un mensaje de prueba',
        type: 'text'
      }, (msgResponse) => {
        console.log('📥 Respuesta de message:send:', msgResponse);
        
        if (msgResponse.success) {
          console.log('✅ Mensaje enviado correctamente');
        } else {
          console.error('❌ Error enviando mensaje:', msgResponse.error);
        }
        
        // Desconectar después de la prueba
        setTimeout(() => {
          console.log('\n👋 Desconectando...');
          socket.disconnect();
          process.exit(0);
        }, 1000);
      });
    } else {
      console.error('❌ Error iniciando chat:', response.error);
      socket.disconnect();
      process.exit(1);
    }
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Desconectado:', reason);
});

socket.on('message:new', (message) => {
  console.log('📬 Nuevo mensaje recibido:', message);
});

// Timeout de seguridad
setTimeout(() => {
  console.error('⏱️ Timeout: Prueba tardó demasiado');
  socket.disconnect();
  process.exit(1);
}, 15000);
