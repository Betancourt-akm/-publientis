/**
 * Modelo de Amistad
 * Maneja las relaciones de amistad entre usuarios
 */

const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  // Usuario que envía la solicitud
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Usuario que recibe la solicitud
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Estado de la amistad
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending',
    index: true
  },
  
  // Fecha de aceptación
  acceptedAt: Date,
  
  // Fecha de rechazo
  rejectedAt: Date,
  
  // Notas o mensaje al enviar solicitud
  message: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Índices compuestos
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

// Método estático para verificar si son amigos
friendshipSchema.statics.areFriends = async function(userId1, userId2) {
  const friendship = await this.findOne({
    status: 'accepted',
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
  
  return !!friendship;
};

// Método estático para obtener amigos de un usuario
friendshipSchema.statics.getFriends = async function(userId) {
  const friendships = await this.find({
    status: 'accepted',
    $or: [
      { requester: userId },
      { recipient: userId }
    ]
  })
  .populate('requester', 'name email profilePic role')
  .populate('recipient', 'name email profilePic role')
  .lean();
  
  // Extraer los amigos (el otro usuario en cada relación)
  return friendships.map(f => {
    const friend = f.requester._id.toString() === userId.toString() 
      ? f.recipient 
      : f.requester;
    return {
      ...friend,
      friendshipId: f._id,
      friendsSince: f.acceptedAt
    };
  });
};

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;
