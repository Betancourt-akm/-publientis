const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad mínima es 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  _id: false,
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  // Sistema de carritos abandonados con múltiples etapas
  abandonmentStages: {
    // Etapa 1: Recordatorio a las 72h
    reminder72h: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      opened: { type: Boolean, default: false }
    },
    // Etapa 2: Cupón de incentivo a los 7 días
    incentive7d: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      couponCode: { type: String, default: null },
      opened: { type: Boolean, default: false }
    }
  },
  // Fecha de último abandono detectado
  lastAbandonedAt: {
    type: Date,
    default: null
  },
  // Para mantener compatibilidad con código antiguo
  abandonedEmailSent: {
    type: Boolean,
    default: false,
  },
  lastAbandonedEmailSentAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Método para calcular totales
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Pre-save hook para calcular totales y resetear flags de abandonado
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  
  // Si el carrito fue modificado, resetear todas las etapas de abandono
  // para que se pueda enviar un nuevo ciclo si lo abandona de nuevo
  if (this.isModified('items') && this.items.length > 0) {
    this.abandonedEmailSent = false;
    this.lastAbandonedAt = new Date(); // Marcar nuevo abandono
    
    // Resetear todas las etapas
    if (!this.abandonmentStages) {
      this.abandonmentStages = {
        reminder72h: { sent: false, sentAt: null, opened: false },
        incentive7d: { sent: false, sentAt: null, couponCode: null, opened: false }
      };
    } else {
      this.abandonmentStages.reminder72h = { sent: false, sentAt: null, opened: false };
      this.abandonmentStages.incentive7d = { sent: false, sentAt: null, couponCode: null, opened: false };
    }
  }
  
  next();
});

// Índice para búsquedas rápidas por usuario
cartSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
