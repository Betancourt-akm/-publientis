const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  serviceType: {
    type: String,
    enum: ['walk', 'boarding', 'grooming', 'training', 'vet-transport'],
    required: true
  },
  serviceDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
reviewSchema.index({ reviewer: 1, reviewee: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ serviceDate: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
