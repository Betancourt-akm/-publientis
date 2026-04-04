/**
 * Modelo de Configuración de Envíos
 */

const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Tipo de tarifa
  rateType: {
    type: String,
    enum: ['flat', 'weight-based', 'price-based', 'zone-based'],
    default: 'flat'
  },
  
  // Tarifa plana
  flatRate: {
    type: Number,
    default: 0
  },
  
  // Tarifa por peso (COP por kg)
  weightRate: {
    type: Number,
    default: 0
  },
  
  // Tarifa por valor (porcentaje del total)
  priceRate: {
    type: Number,
    default: 0
  },
  
  // Zonas geográficas
  zones: [{
    name: String,
    cities: [String],
    departments: [String],
    rate: Number,
    estimatedDays: {
      min: Number,
      max: Number
    }
  }],
  
  // Envío gratis
  freeShippingThreshold: {
    type: Number,
    default: null // null = no hay envío gratis
  },
  
  // Peso máximo
  maxWeight: {
    type: Number,
    default: null // null = sin límite
  },
  
  // Tiempo estimado de entrega (días)
  estimatedDeliveryDays: {
    min: {
      type: Number,
      default: 3
    },
    max: {
      type: Number,
      default: 7
    }
  },
  
  // Restricciones
  minOrderAmount: {
    type: Number,
    default: 0
  },
  
  maxOrderAmount: {
    type: Number,
    default: null
  },
  
  // Estado
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Orden de visualización
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Configuración general de envíos
const shippingConfigSchema = new mongoose.Schema({
  // Configuración activa (solo puede haber una)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Transportadoras disponibles
  carriers: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    apiKey: String,
    apiSecret: String
  }],
  
  // Tarifas de envío
  rates: [shippingRateSchema],
  
  // Configuración de empaque
  packaging: {
    defaultBoxWeight: {
      type: Number,
      default: 0.5 // kg
    },
    paddingWeight: {
      type: Number,
      default: 0.2 // kg adicional por empaque
    }
  },
  
  // Zonas de envío
  shippingZones: [{
    name: String,
    type: {
      type: String,
      enum: ['national', 'regional', 'local'],
      default: 'national'
    },
    countries: [String],
    departments: [String],
    cities: [String],
    postalCodes: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Configuración de cálculo
  calculationMethod: {
    type: String,
    enum: ['cheapest', 'fastest', 'manual'],
    default: 'cheapest'
  },
  
  // Días de procesamiento
  processingDays: {
    type: Number,
    default: 1
  },
  
  // Metadatos
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Método para calcular costo de envío
shippingConfigSchema.methods.calculateShippingCost = function(orderData) {
  const { city, department, total, weight } = orderData;
  
  // Buscar tarifas activas
  const activeRates = this.rates.filter(rate => rate.isActive);
  
  let lowestCost = Infinity;
  let selectedRate = null;
  
  for (const rate of activeRates) {
    let cost = 0;
    
    // Verificar envío gratis
    if (rate.freeShippingThreshold && total >= rate.freeShippingThreshold) {
      return {
        cost: 0,
        rate: rate.name,
        freeShipping: true,
        estimatedDays: rate.estimatedDeliveryDays
      };
    }
    
    // Calcular según tipo
    switch (rate.rateType) {
      case 'flat':
        cost = rate.flatRate;
        break;
        
      case 'weight-based':
        if (weight) {
          cost = weight * rate.weightRate;
        }
        break;
        
      case 'price-based':
        cost = (total * rate.priceRate) / 100;
        break;
        
      case 'zone-based':
        // Buscar zona correspondiente
        const zone = rate.zones.find(z => 
          z.cities.includes(city) || z.departments.includes(department)
        );
        if (zone) {
          cost = zone.rate;
        }
        break;
    }
    
    // Verificar si es la opción más económica
    if (cost < lowestCost) {
      lowestCost = cost;
      selectedRate = rate;
    }
  }
  
  if (!selectedRate) {
    // Tarifa por defecto
    return {
      cost: 10000, // COP
      rate: 'Estándar',
      estimatedDays: { min: 3, max: 7 }
    };
  }
  
  return {
    cost: Math.round(lowestCost),
    rate: selectedRate.name,
    freeShipping: false,
    estimatedDays: selectedRate.estimatedDeliveryDays
  };
};

const ShippingConfig = mongoose.model('ShippingConfig', shippingConfigSchema);

module.exports = ShippingConfig;
