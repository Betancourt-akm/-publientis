/**
 * Modelo de Mensaje
 * Representa un mensaje individual dentro de un chat
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Info del sender (cache)
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin', 'system'],
    required: true
  },
  
  // Contenido del mensaje
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Tipo de mensaje
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  
  // Para archivos/imágenes
  attachments: [{
    url: String,
    type: String, // image, pdf, etc
    name: String,
    size: Number
  }],
  
  // Estado de lectura
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Metadata
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Índices
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
