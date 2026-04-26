const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'profile_view',
      'new_applicant',
      'application_status',
      'match_found',
      'message',
      'saved_candidate',
      'evaluation_pending',
      'evaluation_received',
      'job_offer_approved',
      'job_offer_rejected',
      'friend_request',
      'friend_request_accepted'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['User', 'Application', 'JobOffer', 'Evaluation', 'Chat', 'Friendship']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índice compuesto para consultas eficientes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Método para marcar como leída
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return this.save();
};

// Método estático para crear notificación
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Método estático para contar no leídas
notificationSchema.statics.countUnread = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

// Auto-eliminar notificaciones antiguas (30 días)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
