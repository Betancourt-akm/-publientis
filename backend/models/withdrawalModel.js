const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  vendorNote: {
    type: String,
    default: '',
  },
  adminNote: {
    type: String,
    default: '',
  },
  paymentAccountSnapshot: {
    type: String,
    default: null,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  payoutReference: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

withdrawalSchema.index({ vendorId: 1, createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
