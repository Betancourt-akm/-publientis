const mongoose = require('mongoose');

const walkerProfileSchema = new mongoose.Schema({
  // Referencia al usuario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Datos personales
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  neighborhood: {
    type: String,
    trim: true,
    maxlength: 50
  },
  experience: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Documentación (URLs de Cloudinary)
  documents: {
    idDocument: {
      type: String,
      required: true,
      trim: true
    },
    idDocumentUrl: {
      type: String,
      required: true,
      match: /^https:\/\/res\.cloudinary\.com\/.+/
    },
    criminalRecordUrl: {
      type: String,
      required: true,
      match: /^https:\/\/res\.cloudinary\.com\/.+/
    },
    profilePhotoUrl: {
      type: String,
      required: true,
      match: /^https:\/\/res\.cloudinary\.com\/.+/
    }
  },

  // Servicios ofrecidos
  services: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000
    }
  }],

  // Tarifa por hora
  hourlyRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000
  },

  // Disponibilidad semanal
  availability: {
    monday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    tuesday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    wednesday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    thursday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    friday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    saturday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    sunday: {
      available: { type: Boolean, default: false },
      hours: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    }
  },

  // Estados del perfil
  profileStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },

  // Metadatos adicionales
  metadata: {
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    adminComments: {
      type: String,
      trim: true,
      maxlength: 500
    },
    verificationDate: {
      type: Date
    }
  },

  // Estadísticas
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    profileViews: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
walkerProfileSchema.index({ userId: 1 });
walkerProfileSchema.index({ profileStatus: 1 });
walkerProfileSchema.index({ isPublished: 1 });
walkerProfileSchema.index({ city: 1 });
walkerProfileSchema.index({ 'stats.averageRating': -1 });

// Virtual para obtener información del usuario
walkerProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Método para calcular el porcentaje de completitud
walkerProfileSchema.methods.calculateCompletionPercentage = function() {
  let completed = 0;
  const total = 7; // Total de secciones requeridas

  // 1. Datos personales
  if (this.fullName && this.phone && this.address && this.city && this.experience) {
    completed++;
  }

  // 2. Documentación
  if (this.documents.idDocument && this.documents.idDocumentUrl && 
      this.documents.criminalRecordUrl && this.documents.profilePhotoUrl) {
    completed++;
  }

  // 3. Servicios
  if (this.services && this.services.length > 0) {
    completed++;
  }

  // 4. Tarifa
  if (this.hourlyRate && this.hourlyRate > 0) {
    completed++;
  }

  // 5. Disponibilidad
  const hasAvailability = Object.values(this.availability).some(day => day.available);
  if (hasAvailability) {
    completed++;
  }

  // 6. Descripción
  if (this.description && this.description.trim().length > 0) {
    completed++;
  }

  // 7. Barrio/zona
  if (this.neighborhood && this.neighborhood.trim().length > 0) {
    completed++;
  }

  const percentage = Math.round((completed / total) * 100);
  this.metadata.completionPercentage = percentage;
  return percentage;
};

// Método para verificar si el perfil está completo
walkerProfileSchema.methods.isProfileComplete = function() {
  return this.calculateCompletionPercentage() === 100;
};

// Método para obtener días disponibles formateados
walkerProfileSchema.methods.getAvailableDays = function() {
  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return Object.entries(this.availability)
    .filter(([day, data]) => data.available)
    .map(([day, data]) => ({
      day: dayNames[day],
      hours: `${data.hours.start} - ${data.hours.end}`
    }));
};

// Middleware para actualizar lastUpdated
walkerProfileSchema.pre('save', function(next) {
  this.metadata.lastUpdated = new Date();
  this.calculateCompletionPercentage();
  next();
});

// Método estático para buscar walkers publicados
walkerProfileSchema.statics.findPublished = function(filters = {}) {
  return this.find({
    isPublished: true,
    profileStatus: 'APPROVED',
    ...filters
  }).populate('user', 'name email profilePic');
};

module.exports = mongoose.model('WalkerProfile', walkerProfileSchema);
