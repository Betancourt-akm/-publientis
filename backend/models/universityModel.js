const mongoose = require('mongoose');

/**
 * Universidad (Nivel 0) - Nodo Raíz
 * 
 * Super Admin que posee la instancia de Publientis.
 * Controla estadísticas globales, convenios activos y rendimiento de facultades.
 * 
 * Jerarquía: Universidad → Facultad → Programa Académico
 */

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    // Ej: "UNAL", "UDEA", "UPN"
  },
  
  logo: {
    type: String,
    default: ''
  },
  
  description: {
    type: String,
    default: ''
  },
  
  location: {
    country: { type: String, default: 'Colombia' },
    city: { type: String, required: true },
    address: String
  },
  
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    website: String
  },
  
  // Super Admin de la Universidad
  superAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Configuración global de la instancia
  settings: {
    allowPublicRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    autoApproveInstitutions: {
      type: Boolean,
      default: false // Requiere aprobación manual por defecto
    }
  },
  
  // Estadísticas globales (cache)
  stats: {
    totalFaculties: {
      type: Number,
      default: 0
    },
    totalPrograms: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalGraduates: {
      type: Number,
      default: 0
    },
    activeConvenios: {
      type: Number,
      default: 0
    },
    placementRate: {
      type: Number,
      default: 0
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
universitySchema.index({ code: 1 });
universitySchema.index({ name: 1 });

module.exports = mongoose.model('University', universitySchema);
