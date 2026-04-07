const mongoose = require('mongoose');

const academicProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del programa es requerido'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'El código del programa es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  faculty: {
    type: String,
    required: [true, 'La facultad es requerida'],
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
  },
  level: {
    type: String,
    required: [true, 'El nivel académico es requerido'],
    enum: ['Pregrado', 'Posgrado', 'Especialización', 'Maestría', 'Doctorado']
  },
  description: {
    type: String,
    trim: true
  },
  pedagogicalEmphasis: [{
    type: String,
    trim: true
  }],
  requiredTags: [{
    type: String,
    trim: true
  }],
  approvers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  duration: {
    semesters: {
      type: Number,
      min: 1
    },
    years: {
      type: Number,
      min: 1
    }
  },
  practiceRequirements: {
    practiceI: {
      required: { type: Boolean, default: false },
      semester: Number,
      hours: Number
    },
    practiceII: {
      required: { type: Boolean, default: false },
      semester: Number,
      hours: Number
    },
    ruralPractice: {
      required: { type: Boolean, default: false },
      semester: Number,
      hours: Number
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  studentsEnrolled: {
    type: Number,
    default: 0
  },
  graduatesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

academicProgramSchema.index({ faculty: 1, active: 1 });
academicProgramSchema.index({ code: 1 });
academicProgramSchema.index({ name: 'text', description: 'text' });

const AcademicProgram = mongoose.model('AcademicProgram', academicProgramSchema);

module.exports = AcademicProgram;
