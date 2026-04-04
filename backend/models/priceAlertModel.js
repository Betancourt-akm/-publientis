/**
 * Modelo de Alertas de Precio
 * Para notificar a usuarios cuando un producto baja de precio
 */

const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  
  // Precio objetivo
  targetPrice: {
    type: Number,
    required: true
  },
  
  // Precio actual cuando se creó la alerta
  currentPrice: {
    type: Number,
    required: true
  },
  
  // Estado de la alerta
  status: {
    type: String,
    enum: ['active', 'triggered', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  
  // Notificación
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date,
    default: null
  },
  
  // Email de notificación
  userEmail: {
    type: String,
    required: true
  },
  
  // Metadata del producto (para no hacer joins)
  productName: String,
  productImage: String,
  
  // Expiración (90 días por defecto)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

// Índices compuestos
priceAlertSchema.index({ userId: 1, productId: 1 });
priceAlertSchema.index({ status: 1, expiresAt: 1 });
priceAlertSchema.index({ productId: 1, status: 1 });

// Método para verificar si se debe activar la alerta
priceAlertSchema.methods.shouldTrigger = function(currentPrice) {
  return this.status === 'active' && currentPrice <= this.targetPrice;
};

// Método estático para limpiar alertas expiradas
priceAlertSchema.statics.cleanExpired = async function() {
  const result = await this.updateMany(
    {
      status: 'active',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
  
  console.log(`🧹 ${result.modifiedCount} alertas de precio expiradas`);
  return result;
};

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);

module.exports = PriceAlert;
