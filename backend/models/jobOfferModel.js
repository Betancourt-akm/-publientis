const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  // Organización que publica la oferta
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // Información de la oferta
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [150, 'El título no puede superar 150 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [5000, 'La descripción no puede superar 5000 caracteres']
  },
  // Tipo de vinculación
  type: {
    type: String,
    enum: ['practica', 'empleo', 'voluntariado', 'investigacion'],
    required: [true, 'El tipo de oferta es obligatorio']
  },
  // Modalidad
  modality: {
    type: String,
    enum: ['presencial', 'remoto', 'hibrido'],
    default: 'presencial'
  },
  // Ubicación (si aplica)
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'Colombia' }
  },
  // Requisitos
  requirements: [{
    type: String,
    trim: true
  }],
  // Facultades objetivo (filtro para estudiantes)
  targetFaculties: [{
    type: String,
    enum: [
      'Ingeniería',
      'Medicina',
      'Derecho',
      'Administración',
      'Educación',
      'Ciencias',
      'Artes',
      'Arquitectura',
      'Psicología',
      'Comunicación'
    ]
  }],
  // Compensación
  compensation: {
    type: { type: String, enum: ['remunerada', 'no_remunerada', 'por_definir'], default: 'por_definir' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'COP' }
  },
  // Vacantes
  slots: {
    type: Number,
    default: 1,
    min: [1, 'Debe haber al menos 1 vacante']
  },
  // Duración estimada
  duration: {
    value: { type: Number, default: 0 },
    unit: { type: String, enum: ['dias', 'semanas', 'meses'], default: 'meses' }
  },
  // Fechas
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  // Estado del flujo
  status: {
    type: String,
    enum: ['borrador', 'pendiente_aprobacion', 'activa', 'pausada', 'cerrada', 'rechazada'],
    default: 'pendiente_aprobacion'
  },
  // Aprobación universitaria
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  // Métricas
  viewCount: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  // Tags para búsqueda
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
jobOfferSchema.index({ status: 1, type: 1 });
jobOfferSchema.index({ organization: 1 });
jobOfferSchema.index({ targetFaculties: 1 });
jobOfferSchema.index({ applicationDeadline: 1 });
jobOfferSchema.index({ tags: 1 });
jobOfferSchema.index({ title: 'text', description: 'text', tags: 'text' });

const JobOffer = mongoose.model('JobOffer', jobOfferSchema);
module.exports = JobOffer;
