const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  amountInCents: { type: Number, required: true },
  status: { type: String, required: true },
  reservationDetails: { type: Array, default: [] },
  productDetails: { type: mongoose.Schema.Types.Mixed, default: null }, // para compras (e-commerce)
  shippingInfo: { type: mongoose.Schema.Types.Mixed, default: null },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: false,
    default: null
  },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Transaction', transactionSchema);

// const mongoose = require('mongoose');
// const transactionSchema = new mongoose.Schema({
//   reference: { type: String, required: true, unique: true },
//   amountInCents: { type: Number, required: true },
//   status: { type: String, required: true },
//   reservationDetails: { type: Array, default: [] },
//   productDetails: { type: Object, default: null }, // Nuevo campo para compras
//   shippingInfo: { type: Object, default: null },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Transaction', transactionSchema);
 

// const mongoose = require('mongoose');

// const transactionSchema = new mongoose.Schema({
//   reference: { type: String, required: true, unique: true },
//   amountInCents: { type: Number, required: true },
//   status: { type: String, required: true },
//   reservationDetails: { type: Array, default: [] },
//   shippingInfo: { type: Object, default: null },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Transaction', transactionSchema);

// const mongoose = require('mongoose');

// const transactionSchema = new mongoose.Schema({
//   reference: { type: String, required: true, unique: true },
//   amountInCents: { type: Number, required: true },
//   status: { type: String, required: true },
//   reservationDetails: { type: Array, default: [] },
//   shippingInfo: { type: Object, default: null },
// }, { timestamps: true });

// module.exports = mongoose.model('Transaction', transactionSchema);

