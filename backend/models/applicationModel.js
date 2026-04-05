const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Estudiante que postula
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // Oferta a la que postula
  jobOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer',
    required: true
  },
  // Estado del proceso de selección
  status: {
    type: String,
    enum: [
      'postulado',        // Recién enviada
      'en_revision',      // La organización la está revisando
      'preseleccionado',  // Pasó el primer filtro
      'entrevista',       // Citado a entrevista
      'aceptado',         // Seleccionado para el puesto
      'rechazado',        // No seleccionado
      'retirado'          // El estudiante se retiró
    ],
    default: 'postulado'
  },
  // Carta de presentación o mensaje del estudiante
  coverLetter: {
    type: String,
    maxlength: [3000, 'La carta de presentación no puede superar 3000 caracteres'],
    default: ''
  },
  // CV o documento adjunto (URL de Cloudinary)
  resumeUrl: {
    type: String,
    default: ''
  },
  // Historial de cambios de estado (trazabilidad)
  statusHistory: [{
    status: {
      type: String,
      enum: ['postulado', 'en_revision', 'preseleccionado', 'entrevista', 'aceptado', 'rechazado', 'retirado']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  // Notas internas de la organización (no visibles para el estudiante)
  internalNotes: {
    type: String,
    default: ''
  },
  // Calificación/puntaje interno
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // Fecha de entrevista (si aplica)
  interviewDate: {
    type: Date,
    default: null
  },
  interviewLocation: {
    type: String,
    default: ''
  },
  // Seguimiento universitario
  universityReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    comments: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Índices
applicationSchema.index({ applicant: 1, jobOffer: 1 }, { unique: true }); // Un estudiante solo puede postularse una vez por oferta
applicationSchema.index({ jobOffer: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
