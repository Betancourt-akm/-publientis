const mongoose = require('mongoose');

const serviceCardSchema = new mongoose.Schema({
  walkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animalTypes: [{
    type: String,
    enum: ['Perro', 'Gato', 'Ave', 'Roedor', 'Reptil', 'Otros'],
    required: true
  }],
  availability: {
    type: Map,
    of: {
      startTime: String, // formato HH:MM
      endTime: String,   // formato HH:MM
      available: Boolean
    }
  },
  pricePerHour: {
    type: Number,
    required: true,
    min: 0
  },
  serviceCity: {
    type: String,
    required: true,
    trim: true
  },
  serviceDescription: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceCard', serviceCardSchema);
