const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Organización suscrita
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  
  // Tipo de plan
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free'
  },
  
  // Estado de la suscripción
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active',
    index: true
  },
  
  // Fechas
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null = no expira (free plan)
  },
  
  // Renovación automática
  autoRenew: {
    type: Boolean,
    default: false
  },
  
  // Características incluidas
  features: {
    maxJobOffers: {
      type: Number,
      default: -1 // -1 = ilimitado
    },
    priorityListing: {
      type: Boolean,
      default: false
    },
    verifiedBadge: {
      type: Boolean,
      default: false
    },
    studentDatabase: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    },
    advancedFilters: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  },
  
  // Información de pago
  payment: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'one-time'],
      default: 'monthly'
    },
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    transactionId: String
  },
  
  // Historial de cambios
  history: [{
    action: {
      type: String,
      enum: ['created', 'upgraded', 'downgraded', 'renewed', 'cancelled', 'expired']
    },
    previousPlan: String,
    newPlan: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Cancelación
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
}, {
  timestamps: true
});

// Índices
subscriptionSchema.index({ organization: 1, status: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

// Método para verificar si está activa
subscriptionSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  if (!this.endDate) return true; // Free plan nunca expira
  return new Date() < this.endDate;
};

// Método para obtener características del plan
subscriptionSchema.statics.getPlanFeatures = function(planType) {
  const plans = {
    free: {
      maxJobOffers: -1, // ilimitado
      priorityListing: false,
      verifiedBadge: false,
      studentDatabase: false,
      analytics: false,
      advancedFilters: false,
      prioritySupport: false
    },
    pro: {
      maxJobOffers: -1,
      priorityListing: true,
      verifiedBadge: true,
      studentDatabase: true,
      analytics: true,
      advancedFilters: true,
      prioritySupport: true
    },
    premium: {
      maxJobOffers: -1,
      priorityListing: true,
      verifiedBadge: true,
      studentDatabase: true,
      analytics: true,
      advancedFilters: true,
      prioritySupport: true
    }
  };
  
  return plans[planType] || plans.free;
};

// Método para calcular fecha de expiración
subscriptionSchema.methods.calculateEndDate = function(frequency) {
  const start = this.startDate || new Date();
  const end = new Date(start);
  
  switch (frequency) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'annual':
      end.setFullYear(end.getFullYear() + 1);
      break;
    default:
      return null; // Free plan
  }
  
  return end;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
