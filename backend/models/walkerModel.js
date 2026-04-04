const mongoose = require('mongoose');

/**
 * 🌐 MODELO WALKER - SOLO DATOS PÚBLICOS
 * 
 * ⚠️  IMPORTANTE: Este modelo contiene ÚNICAMENTE datos no sensibles
 * ❌ NUNCA incluir: address, phone, idDocument, documentos, antecedentes
 * ✅ SOLO incluir: datos que pueden ser vistos públicamente
 * 
 * Propósito: Servir datos seguros a la página /paseadores y APIs públicas
 */
const walkerSchema = new mongoose.Schema({
  // 🔗 Referencia al usuario original (para sincronización interna)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // 👤 DATOS PÚBLICOS DEL PASEADOR
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },

  profilePhotoUrl: {
    type: String,
    default: '',
    trim: true
  },

  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000
  },

  experience: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500
  },

  // 📍 UBICACIÓN GENERAL (SIN dirección exacta por privacidad)
  city: {
    type: String,
    default: '',
    trim: true,
    maxlength: 50,
    index: true
  },

  neighborhood: {
    type: String,
    default: '',
    trim: true,
    maxlength: 50,
    index: true
  },

  // 🗺️ Zona geográfica para búsquedas por proximidad (opcional)
  zone: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },

  // 🐕 SERVICIOS OFRECIDOS
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }],

  // 💰 Tarifa por hora
  hourlyRate: {
    type: String,
    default: '',
    trim: true
  },

  // 🐾 Tipos de mascotas que maneja
  petTypes: [{
    type: String,
    enum: ['small', 'medium', 'large', 'cat', 'bird', 'other'],
    index: true
  }],

  // 📅 DISPONIBILIDAD SEMANAL
  availability: {
    monday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    },
    tuesday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    },
    wednesday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    },
    thursday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    },
    friday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    },
    saturday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    },
    sunday: {
      available: { type: Boolean, default: false },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    }
  },

  // ⭐ CALIFICACIÓN Y RESEÑAS
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },

  reviewsCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // 📢 ESTADO DE PUBLICACIÓN
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },

  publishedAt: {
    type: Date,
    default: null,
    index: true
  }

}, {
  timestamps: true,
  // Optimizaciones de consulta
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS

// Índice geoespacial para búsquedas por proximidad
walkerSchema.index({ zone: '2dsphere' });

// Índices compuestos para consultas eficientes
walkerSchema.index({ isPublished: 1, publishedAt: -1 });
walkerSchema.index({ isPublished: 1, city: 1, neighborhood: 1 });
walkerSchema.index({ isPublished: 1, rating: -1 });
walkerSchema.index({ isPublished: 1, 'petTypes': 1 });

// Índices individuales
walkerSchema.index({ user: 1 }, { unique: true });
walkerSchema.index({ fullName: 'text', description: 'text' });

// 🛠️ MÉTODOS DEL ESQUEMA

/**
 * Obtener solo datos públicos (sin referencia al usuario)
 */
walkerSchema.methods.getPublicData = function() {
  const walker = this.toObject();
  delete walker.user; // Remover referencia al usuario por seguridad
  return walker;
};

/**
 * Verificar si el walker está disponible en un día específico
 */
walkerSchema.methods.isAvailableOn = function(dayName) {
  const day = this.availability[dayName.toLowerCase()];
  return day && day.available === true;
};

/**
 * Obtener días disponibles
 */
walkerSchema.methods.getAvailableDays = function() {
  const days = [];
  Object.keys(this.availability).forEach(day => {
    if (this.availability[day].available) {
      days.push(day);
    }
  });
  return days;
};

// 🔒 MIDDLEWARE DE VALIDACIÓN

// Validar que al menos un día esté disponible antes de publicar
walkerSchema.pre('save', function(next) {
  if (this.isPublished) {
    const hasAvailability = Object.values(this.availability).some(day => day.available === true);
    if (!hasAvailability) {
      return next(new Error('Debe tener al menos un día disponible para publicar'));
    }
    
    // Validar que tenga al menos un servicio
    if (!this.services || this.services.length === 0) {
      return next(new Error('Debe tener al menos un servicio para publicar'));
    }
  }
  next();
});

// 📊 MÉTODOS ESTÁTICOS

/**
 * Buscar walkers publicados por ciudad
 */
walkerSchema.statics.findPublishedByCity = function(city) {
  return this.find({
    isPublished: true,
    city: new RegExp(city, 'i')
  }).sort({ publishedAt: -1 });
};

/**
 * Buscar walkers por rating mínimo
 */
walkerSchema.statics.findByMinRating = function(minRating) {
  return this.find({
    isPublished: true,
    rating: { $gte: minRating }
  }).sort({ rating: -1 });
};

const Walker = mongoose.model('Walker', walkerSchema);

module.exports = Walker;
