const mongoose = require('mongoose');

const academicProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },

  // ── Presentación pública ──
  headline: { type: String, default: '', maxlength: 120 },
  bio: { type: String, maxlength: 800, default: '' },
  photo: { type: String, default: '' },

  // ── Ubicación y disponibilidad ──
  location: {
    city:    { type: String, default: '' },
    country: { type: String, default: '' }
  },
  willingToTravel:   { type: Boolean, default: false },
  willingToRelocate: { type: Boolean, default: false },
  availability: {
    type: String,
    enum: ['immediate', '1_month', '3_months', 'not_available', ''],
    default: ''
  },

  // ── Formación académica (historial completo) ──
  educationHistory: [{
    institution: String,
    degree:      String,
    field:       String,
    startYear:   Number,
    endYear:     Number,
    current:     { type: Boolean, default: false },
    description: String
  }],

  // ── Campos heredados (universidad principal) ──
  university: { type: String, default: '' },
  faculty:    { type: String, default: '' },
  researchLine: { type: String, default: '' },
  semillero:    { type: String, default: '' },

  // ── Habilidades e idiomas ──
  skills: [{ type: String }],
  languages: [{
    language: String,
    level: {
      type: String,
      enum: ['basico', 'intermedio', 'avanzado', 'nativo', ''],
      default: ''
    }
  }],

  // ── Experiencia / Prácticas ──
  practices: [{
    company:     String,
    position:    String,
    startDate:   Date,
    endDate:     Date,
    description: String,
    current:     { type: Boolean, default: false }
  }],

  // ── Certificaciones ──
  certifications: [{
    name:          String,
    issuer:        String,
    date:          Date,
    credentialUrl: String,
    imageUrl:      String
  }],

  // ── Redes sociales ──
  socialLinks: {
    linkedin:  { type: String, default: '' },
    github:    { type: String, default: '' },
    portfolio: { type: String, default: '' },
    twitter:   { type: String, default: '' }
  },

  // ── Visibilidad ──
  isPublic: { type: Boolean, default: true },
  cvUrl:    { type: String, default: '' }
}, {
  timestamps: true
});

const AcademicProfile = mongoose.model('AcademicProfile', academicProfileSchema);

module.exports = AcademicProfile;
