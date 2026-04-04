const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
  },
  vendorName: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  commissionPercentage: {
    type: Number,
    default: 0,
  },
  commissionAmount: {
    type: Number,
    default: 0,
  },
  vendorAmount: {
    type: Number,
    default: 0,
  },
  platformAmount: {
    type: Number,
    default: 0,
  },
}, {
  _id: false,
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: 'Colombia',
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false, // Para guest checkout
  },
}, {
  _id: false,
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: false, // Se genera en el controlador
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Opcional para guest checkout
    default: null,
  },
  isGuestOrder: {
    type: Boolean,
    default: false, // true si es compra sin login
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Tarjeta de Crédito', 'PSE', 'Efectivo Contra Entrega', 'PayPal', 'Wompi'],
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pendiente', 'Pagado', 'Fallido', 'Reembolsado', 'Rechazado'],
    default: 'Pendiente',
  },
  transactionId: {
    type: String,
    default: null,
  },
  paypalOrderId: {
    type: String,
    default: null,
  },
  wompiTransactionId: {
    type: String,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0,
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'],
    default: 'Pendiente',
  },
  notes: {
    type: String,
    default: '',
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancelReason: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Generar número de orden automáticamente
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const orderNum = String(count + 1).padStart(6, '0');
    this.orderNumber = `FF-${orderNum}`;
  }
  next();
});

// Índices
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
