/**
 * Socket.io - Chat en Tiempo Real
 * Maneja conexiones, mensajes y notificaciones
 * Integrado con Bot de IA
 */

const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const aiChatbot = require('../services/aiChatbotService');

// Store de usuarios conectados
const connectedUsers = new Map();

const initializeChatSocket = (io) => {
  console.log('🔌 Inicializando Socket.io para chat...');

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      const userRole = socket.handshake.auth.userRole;
      
      if (!userId) {
        return next(new Error('Usuario no autenticado'));
      }

      socket.userId = userId;
      // Normalizar rol a lowercase para consistencia
      socket.userRole = (userRole || 'user').toLowerCase();
      
      next();
    } catch (error) {
      console.error('Error en autenticación socket:', error);
      next(new Error('Error de autenticación'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ Usuario conectado: ${socket.userId} (${socket.userRole})`);
    
    // Agregar a usuarios conectados
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      role: socket.userRole,
      connectedAt: new Date()
    });

    // Unir a sala personal
    socket.join(`user:${socket.userId}`);
    
    // Si es admin, unir a sala de admins
    if (socket.userRole === 'admin') {
      socket.join('admins');
      
      // Enviar lista de chats activos
      const activeChats = await Chat.find({ status: { $in: ['active', 'waiting'] } })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();
      
      socket.emit('admin:active-chats', activeChats);
    }

    // Emitir lista de usuarios online a admins
    io.to('admins').emit('users:online', {
      count: connectedUsers.size,
      users: Array.from(connectedUsers.entries()).map(([userId, data]) => ({
        userId,
        role: data.role
      }))
    });

    // ==========================================
    // EVENTOS: Iniciar/Obtener Chat Directo con Otro Usuario
    // ==========================================
    socket.on('chat:direct:start', async (data, callback) => {
      console.log('📨 Evento chat:direct:start recibido:', { userId: socket.userId, data });
      
      try {
        const { otherUserId } = data;
        const userId = socket.userId;

        if (!userId || !otherUserId) {
          return callback({ success: false, error: 'Datos insuficientes' });
        }

        if (userId.toString() === otherUserId.toString()) {
          return callback({ success: false, error: 'No puedes chatear contigo mismo' });
        }

        // Buscar conversación existente entre estos dos usuarios
        let chat = await Chat.findOne({
          type: 'direct',
          participants: { $all: [userId, otherUserId] }
        });

        if (!chat) {
          // Crear nueva conversación
          const user = await User.findById(userId);
          const otherUser = await User.findById(otherUserId);

          if (!otherUser) {
            return callback({ success: false, error: 'Usuario no encontrado' });
          }

          chat = await Chat.create({
            type: 'direct',
            participants: [userId, otherUserId],
            participantsInfo: [
              {
                userId: user._id,
                name: user.name,
                email: user.email,
                avatar: user.profilePic,
                role: user.role
              },
              {
                userId: otherUser._id,
                name: otherUser.name,
                email: otherUser.email,
                avatar: otherUser.profilePic,
                role: otherUser.role
              }
            ],
            status: 'active',
            unreadCount: { user: 0, admin: 0 }
          });

          console.log('📝 Nueva conversación directa creada entre:', user.name, 'y', otherUser.name);
        }

        // Unir ambos usuarios a la sala del chat
        socket.join(`chat:${chat._id}`);
        
        // Unir al otro usuario si está conectado
        const otherUserSocket = Array.from(connectedUsers.entries()).find(
          ([id]) => id.toString() === otherUserId.toString()
        );
        if (otherUserSocket) {
          io.to(`user:${otherUserId}`).emit('chat:direct:invitation', { chatId: chat._id });
        }

        // Obtener mensajes
        const messages = await Message.find({ chatId: chat._id })
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();

        console.log(`📋 Chat directo ${chat._id}: ${messages.length} mensajes cargados`);

        callback({ success: true, chat, messages });
      } catch (error) {
        console.error('❌ Error en chat:direct:start:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ==========================================
    // EVENTOS: Unirse a sala de chat existente
    // ==========================================
    socket.on('join:chat', ({ chatId }) => {
      if (chatId) {
        socket.join(`chat:${chatId}`);
        console.log(`🔗 Usuario ${socket.userId} unido a sala chat:${chatId}`);
      }
    });

    // ==========================================
    // EVENTOS: Iniciar/Obtener Chat de Soporte (Legacy)
    // ==========================================
    socket.on('chat:start', async (data, callback) => {
      console.log('📨 Evento chat:start recibido:', { userId: socket.userId, data });
      
      try {
        const { subject, message, chatId } = data;
        const userId = socket.userId;

        if (!userId) {
          console.error('❌ chat:start: userId no disponible');
          return callback({ success: false, error: 'Usuario no autenticado' });
        }

        let chat;
        
        // Si se proporciona chatId (admin seleccionando un chat específico)
        if (chatId) {
          chat = await Chat.findById(chatId);
          if (!chat) {
            return callback({ success: false, error: 'Chat no encontrado' });
          }
        } else {
          // Buscar chat existente del usuario o crear uno nuevo
          chat = await Chat.findOne({
            type: 'support',
            userId,
            status: { $in: ['active', 'waiting'] }
          });

          if (!chat) {
            // Obtener info del usuario
            const user = await User.findById(userId);
            
            chat = await Chat.create({
              type: 'support',
              userId,
              userName: user.name,
              userEmail: user.email,
              userAvatar: user.profilePic,
              subject: subject || 'Consulta general',
              status: 'waiting',
              unreadCount: { user: 0, admin: 0 }
            });

            // No crear mensaje automático - usuario debe escribir primero
            console.log('📝 Chat vacío creado - usuario puede enviar mensajes');
            
            // Notificar a admins que hay un nuevo chat disponible
            io.to('admins').emit('chat:new', { chat });

            // Chat directo usuario-admin sin bot
            console.log('💬 Chat nuevo creado - esperando respuesta del admin');
          }
        }

        // Unir a sala del chat
        socket.join(`chat:${chat._id}`);

        // Obtener TODOS los mensajes del chat (historial completo)
        const messages = await Message.find({ chatId: chat._id })
          .sort({ createdAt: 1 })
          .limit(500) // Incrementado para cargar más historial
          .lean();

        console.log(`📋 Chat ${chat._id}: ${messages.length} mensajes cargados para usuario ${userId}`);

        const response = { success: true, chat, messages };
        console.log('✅ Enviando respuesta chat:start:', { chatId: chat._id, messageCount: messages.length });
        callback(response);
      } catch (error) {
        console.error('❌ Error en chat:start:', error);
        console.error('Stack trace:', error.stack);
        const errorResponse = { success: false, error: error.message };
        callback(errorResponse);
      }
    });

    // ==========================================
    // EVENTOS: Enviar Mensaje
    // ==========================================
    socket.on('message:send', async (data, callback) => {
      try {
        const { chatId, content, type = 'text', attachments = [] } = data;
        const senderId = socket.userId;

        // Verificar que el chat existe
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return callback({ success: false, error: 'Chat no encontrado' });
        }

        // Obtener info del sender
        const sender = await User.findById(senderId);
        const senderRole = socket.userRole;

        // Crear mensaje
        const message = await Message.create({
          chatId,
          senderId,
          senderName: sender.name,
          senderRole,
          content,
          type,
          attachments
        });

        // Actualizar último mensaje del chat
        chat.lastMessage = {
          content,
          senderId,
          senderName: sender.name,
          timestamp: message.createdAt
        };

        // Incrementar contador de no leídos
        if (senderRole === 'user') {
          chat.unreadCount.admin += 1;
          chat.status = 'waiting'; // Cambiar a waiting si usuario responde
        } else {
          chat.unreadCount.user += 1;
          if (chat.status === 'waiting') {
            chat.status = 'active'; // Cambiar a active si admin responde
          }
        }

        await chat.save();

        // Emitir mensaje a todos en la sala del chat
        io.to(`chat:${chatId}`).emit('message:new', message);

        // Notificar al destinatario
        const recipientId = senderRole === 'user' ? chat.assignedTo : chat.userId;
        if (recipientId) {
          io.to(`user:${recipientId}`).emit('notification:message', {
            chatId,
            message,
            chat
          });
        }

        // Si es un mensaje de usuario, notificar a todos los admins
        if (senderRole === 'user') {
          io.to('admins').emit('chat:updated', chat);
          
          // Chat directo usuario-admin - sin bot
          console.log('📨 Mensaje enviado correctamente - esperando respuesta del admin');
        }

        callback({ success: true, message });
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ==========================================
    // EVENTOS: Usuario está escribiendo
    // ==========================================
    socket.on('typing:start', async ({ chatId }) => {
      const sender = await User.findById(socket.userId);
      socket.to(`chat:${chatId}`).emit('typing:start', {
        chatId,
        userId: socket.userId,
        userName: sender.name
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', {
        chatId,
        userId: socket.userId
      });
    });

    // ==========================================
    // EVENTOS: Marcar como leído
    // ==========================================
    socket.on('messages:read', async ({ chatId }, callback) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return callback({ success: false, error: 'Chat no encontrado' });
        }

        const userType = socket.userRole === 'admin' ? 'admin' : 'user';
        await chat.markAsRead(userType);

        // Marcar mensajes individuales como leídos
        await Message.updateMany(
          {
            chatId,
            senderId: { $ne: socket.userId },
            read: false
          },
          {
            read: true,
            readAt: new Date()
          }
        );

        // Notificar a la otra parte
        socket.to(`chat:${chatId}`).emit('messages:read', { chatId });

        callback({ success: true });
      } catch (error) {
        console.error('Error marcando mensajes como leídos:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ==========================================
    // EVENTOS ADMIN: Asignar chat
    // ==========================================
    socket.on('admin:assign-chat', async ({ chatId }, callback) => {
      try {
        if (socket.userRole !== 'admin') {
          return callback({ success: false, error: 'No autorizado' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return callback({ success: false, error: 'Chat no encontrado' });
        }

        const admin = await User.findById(socket.userId);
        
        chat.assignedTo = socket.userId;
        chat.assignedToName = admin.name;
        chat.status = 'active';
        await chat.save();

        // Unir admin a sala del chat
        socket.join(`chat:${chatId}`);

        // Notificar al usuario
        io.to(`user:${chat.userId}`).emit('chat:assigned', {
          chatId,
          adminName: admin.name
        });

        // Notificar a otros admins
        io.to('admins').emit('chat:updated', chat);

        callback({ success: true, chat });
      } catch (error) {
        console.error('Error asignando chat:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ==========================================
    // EVENTOS ADMIN: Cerrar chat
    // ==========================================
    socket.on('admin:close-chat', async ({ chatId, feedback }, callback) => {
      try {
        if (socket.userRole !== 'admin') {
          return callback({ success: false, error: 'No autorizado' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return callback({ success: false, error: 'Chat no encontrado' });
        }

        chat.status = 'closed';
        chat.closedAt = new Date();
        chat.closedBy = socket.userId;
        await chat.save();

        // Crear mensaje de sistema
        await Message.create({
          chatId,
          senderId: socket.userId,
          senderName: 'Sistema',
          senderRole: 'system',
          content: 'El chat ha sido cerrado por el administrador.',
          type: 'system'
        });

        // Notificar al usuario
        io.to(`chat:${chatId}`).emit('chat:closed', { chatId });
        io.to('admins').emit('chat:updated', chat);

        callback({ success: true });
      } catch (error) {
        console.error('Error cerrando chat:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ==========================================
    // EVENTOS: Desconexión
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
      
      // Notificar a admins sobre usuarios online
      io.to('admins').emit('users:online', {
        count: connectedUsers.size,
        users: Array.from(connectedUsers.entries()).map(([userId, data]) => ({
          userId,
          role: data.role
        }))
      });
    });
  });

  console.log('✅ Socket.io inicializado correctamente');
};

module.exports = { initializeChatSocket, connectedUsers };
