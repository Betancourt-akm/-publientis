const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  paymentAccount: {
    type: String,
    default: null,
  },
  commissionPercentage: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
