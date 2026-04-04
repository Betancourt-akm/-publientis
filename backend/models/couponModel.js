/**
 * Modelo de Cupones/Descuentos
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código del cupón es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'El código debe tener al menos 3 caracteres'],
    maxlength: [20, 'El código no puede exceder 20 caracteres']
  },
  
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },
  
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  
  discountValue: {
    type: Number,
    required: [true, 'El valor del descuento es requerido'],
    min: [0, 'El descuento no puede ser negativo']
  },
  
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: [0, 'El monto mínimo no puede ser negativo']
  },
  
  maxDiscountAmount: {
    type: Number,
    default: null // null = sin límite
  },
  
  usageLimit: {
    type: Number,
    default: null, // null = ilimitado
    min: [1, 'El límite de uso debe ser al menos 1']
  },
  
  usageCount: {
    type: Number,
    default: 0
  },
  
  usagePerUser: {
    type: Number,
    default: 1,
    min: [1, 'Debe permitir al menos 1 uso por usuario']
  },
  
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  expiryDate: {
    type: Date,
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Restricciones opcionales
  applicableCategories: [{
    type: String
  }],
  
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Seguimiento de uso
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    discountApplied: Number
  }],
  
  // Metadatos
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

// Método para validar si el cupón es válido
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  // Verificar si está activo
  if (!this.isActive) {
    return { valid: false, message: 'Este cupón no está activo' };
  }
  
  // Verificar fechas
  if (now < this.startDate) {
    return { valid: false, message: 'Este cupón aún no está disponible' };
  }
  
  if (now > this.expiryDate) {
    return { valid: false, message: 'Este cupón ha expirado' };
  }
  
  // Verificar límite de uso
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Este cupón ha alcanzado su límite de uso' };
  }
  
  return { valid: true };
};

// Método para calcular descuento
couponSchema.methods.calculateDiscount = function(cartTotal) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (cartTotal * this.discountValue) / 100;
    
    // Aplicar límite máximo si existe
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    // Fixed amount
    discount = this.discountValue;
    
    // No puede ser mayor que el total
    if (discount > cartTotal) {
      discount = cartTotal;
    }
  }
  
  return Math.round(discount * 100) / 100; // Redondear a 2 decimales
};

// Método para verificar si un usuario puede usar el cupón
couponSchema.methods.canUserUse = function(userId) {
  const userUsages = this.usedBy.filter(
    usage => usage.userId.toString() === userId.toString()
  );
  
  if (userUsages.length >= this.usagePerUser) {
    return { can: false, message: 'Has alcanzado el límite de uso de este cupón' };
  }
  
  return { can: true };
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
