const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number
  },
  size: {
    type: String,
    enum: ['toy', 'small', 'medium', 'large', 'giant'],
    required: true
  },
  weight: {
    type: Number
  },
  specialNeeds: {
    type: String
  },
  behavior: {
    type: String
  },
  medicalInfo: {
    type: String
  },
  photoUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
petSchema.index({ owner: 1 });
petSchema.index({ name: 1 });
petSchema.index({ size: 1 });

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
