const mongoose = require('mongoose');

/**
 * Facultad (Nivel 1) - Admin de Unidad
 * 
 * Reporta directamente a la Universidad.
 * Visualiza y gestiona todos los programas académicos de su unidad.
 * Dashboard centrado en supervisión de convenios marco y cumplimiento de metas.
 * 
 * Jerarquía: Universidad → Facultad → Programa Académico
 */

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
    // Ej: "Facultad de Educación", "Facultad de Ingeniería"
  },
  
  code: {
    type: String,
    required: true,
    uppercase: true,
    // Ej: "EDU", "ING", "ARTES"
  },
  
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  logo: {
    type: String,
    default: ''
  },
  
  // Admin de la Facultad
  dean: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Rol: FACULTY o ADMIN
  },
  
  contact: {
    email: String,
    phone: String,
    office: String
  },
  
  // Áreas de conocimiento de la facultad
  knowledgeAreas: [{
    type: String
    // Ej: "Pedagogía", "Didáctica", "Ciencias Sociales"
  }],
  
  // Estadísticas de la facultad (cache)
  stats: {
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

// Índices compuestos
facultySchema.index({ university: 1, code: 1 }, { unique: true });
facultySchema.index({ university: 1, name: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
