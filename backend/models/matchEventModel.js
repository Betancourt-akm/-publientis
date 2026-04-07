const mongoose = require('mongoose');

/**
 * MatchEvent - Registro de interacciones en el Marketplace
 * 
 * Rastrea cuando una Organización muestra interés en un Egresado.
 * Genera alertas automáticas al Coordinador del Programa.
 */

const matchEventSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'viewed_profile',
      'viewed_portfolio', 
      'saved_candidate',
      'invited_to_apply',
      'contacted_directly',
      'hired'
    ],
    required: true
  },
  jobOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer'
  },
  metadata: {
    viewDuration: Number, // segundos
    portfolioItemsViewed: [String],
    deviceType: String,
    source: String // 'search', 'recommendation', 'featured'
  },
  coordinatorNotified: {
    type: Boolean,
    default: false
  },
  followUpStatus: {
    type: String,
    enum: ['pending', 'contacted', 'in_process', 'completed', 'cancelled'],
    default: 'pending'
  },
  followUpNotes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    note: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices compuestos para queries comunes
matchEventSchema.index({ student: 1, createdAt: -1 });
matchEventSchema.index({ organization: 1, createdAt: -1 });
matchEventSchema.index({ action: 1, createdAt: -1 });
matchEventSchema.index({ followUpStatus: 1 });

// Índice para dashboard de Facultad (matches por programa)
matchEventSchema.index({ 'student': 1, 'action': 1 });

module.exports = mongoose.model('MatchEvent', matchEventSchema);
