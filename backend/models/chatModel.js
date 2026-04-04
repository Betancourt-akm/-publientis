/**
 * Modelo de Chat
 * Representa una conversación entre dos usuarios (peer-to-peer)
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Tipo de conversación
  type: {
    type: String,
    enum: ['direct', 'support'], // direct = usuario-usuario, support = usuario-admin
    default: 'direct'
  },
  
  // Participantes de la conversación (para chats directos)
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Cache de info de participantes
  participantsInfo: [{
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    avatar: String,
    role: String
  }],
  
  // Legacy fields (mantener compatibilidad con chat de soporte)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userName: String,
  userEmail: String,
  userAvatar: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: String,
  
  // Estado de la conversación
  status: {
    type: String,
    enum: ['active', 'waiting', 'closed', 'archived'],
    default: 'waiting',
    index: true
  },
  
  // Último mensaje
  lastMessage: {
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
    senderName: String,
    timestamp: Date
  },
  
  // Contador de mensajes no leídos
  unreadCount: {
    user: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  },
  
  // Metadata
  subject: String, // Asunto o razón del chat
  tags: [String], // Tags para categorizar (soporte, ventas, etc.)
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Rating del servicio (cuando se cierra)
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  
  closedAt: Date,
  closedBy: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

// Índices
chatSchema.index({ status: 1, createdAt: -1 });
chatSchema.index({ assignedTo: 1, status: 1 });
chatSchema.index({ userId: 1, status: 1 });
chatSchema.index({ participants: 1, status: 1 });
chatSchema.index({ type: 1, status: 1 });

// Índice compuesto para encontrar conversaciones entre dos usuarios
chatSchema.index({ type: 1, participants: 1 });

// Método para marcar mensajes como leídos
chatSchema.methods.markAsRead = async function(userType) {
  if (userType === 'user') {
    this.unreadCount.user = 0;
  } else if (userType === 'admin') {
    this.unreadCount.admin = 0;
  }
  await this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
