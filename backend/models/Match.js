const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  matchDate: {
    type: Date,
    default: Date.now
  },
  acceptedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
matchSchema.index({ ownerId: 1, walkerId: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ matchDate: -1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;