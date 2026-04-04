const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  serviceCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCard',
    required: true
  },
  petDetails: {
    name: { type: String, required: true },
    breed: { type: String, required: true },
    size: { 
      type: String, 
      enum: ['toy', 'small', 'medium', 'large', 'giant'],
      required: true 
    },
    specialNeeds: { type: String }
  },
  serviceDetails: {
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // formato HH:MM
    duration: { type: Number, required: true }, // en minutos
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    }
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
