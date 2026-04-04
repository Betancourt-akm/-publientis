const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
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
  serviceType: {
    type: String,
    enum: ['walk', 'boarding', 'grooming', 'training', 'vet-transport'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duración en minutos
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  cancellationReason: {
    type: String
  },
  cancellationDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
serviceRequestSchema.index({ ownerId: 1, walkerId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ startDate: 1 });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
