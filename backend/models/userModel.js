const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  tel: String,
  phone: String, // Alias para compatibilidad
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  password: {
    type: String,
    required: function() { return this.provider === 'local'; },
    select: false
  },
  profilePic: String,
  role: {
    type: String,
    enum: ['ADMIN', 'OWNER', 'ORGANIZATION', 'USER', 'DOCENTE', 'STUDENT', 'FACULTY', 'VISITOR'],
    default: 'USER'
  },
  faculty: {
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
    ],
    default: null
  },
  program: {
    type: String,
    default: null
  },
  academicLevel: {
    type: String,
    enum: ['Pregrado', 'Posgrado', 'Especialización', 'Maestría', 'Doctorado', 'Egresado'],
    default: null
  },
  pedagogicalTags: [{
    type: String
  }],
  academicStatus: {
    type: String,
    enum: ['Activo', 'Graduado', 'Practicante', 'Egresado'],
    default: 'Activo'
  },
  provider: {
    type: String,
    required: true,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Number
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: mongoose.Schema.Types.Mixed,
  
  // Portafolio Profesional Pedagógico
  portfolio: {
    cv: {
      type: String,
      default: null
    },
    planesAula: [{
      name: String,
      subject: String,
      gradeLevel: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    certificados: [{
      name: String,
      institution: String,
      issueDate: Date,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    proyectos: [{
      name: String,
      description: String,
      category: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Middleware pre-guardado para hashear la contraseña
// CRÍTICO: Solo hashea si la contraseña ha sido modificada para evitar doble hashing
userSchema.pre('save', async function(next) {
  // Si la contraseña no ha sido modificada, continúa sin hashear
  if (!this.isModified('password')) {
    return next();
  }
  
  // Si no hay contraseña (usuarios OAuth), continúa
  if (!this.password) {
    return next();
  }
  
  // Solo hashea si la contraseña es nueva o ha sido modificada
  try {
    console.log('Hasheando contraseña para usuario:', this.email);
    const salt = await bcrypt.genSalt(12); // Aumentamos la seguridad a 12 rounds
    this.password = await bcrypt.hash(this.password, salt);
    
    // Actualizar passwordChangedAt solo si no es un documento nuevo
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Restamos 1 segundo para asegurar que el token JWT se crea después del cambio
    }
    
    next();
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Verificar que tenemos una contraseña hasheada para comparar
    if (!this.password) {
      console.log('No hay contraseña hasheada para el usuario:', this.email);
      return false;
    }
    
    // Verificar que la contraseña candidata no esté vacía
    if (!candidatePassword) {
      console.log('Contraseña candidata vacía para usuario:', this.email);
      return false;
    }
    
    console.log('Comparando contraseña para usuario:', this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Resultado de comparación:', isMatch ? '✓ Correcta' : '✗ Incorrecta');
    
    return isMatch;
  } catch (error) {
    console.error('Error al comparar contraseña para usuario', this.email, ':', error);
    return false;
  }
};

// Método de utilidad para verificar si una contraseña ya está hasheada
userSchema.methods.isPasswordHashed = function() {
  // Verificar el formato de bcrypt (comienza con $2b$ o similar) y la longitud (60 caracteres)
  const bcryptRegex = /^\$2[abxy]\$\d+\$/;
  return bcryptRegex.test(this.password) && this.password.length === 60;
};

// Método para verificar si el usuario cambió su contraseña después de emitir el token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // Si no hay campo passwordChangedAt, significa que nunca ha cambiado la contraseña
  if (!this.passwordChangedAt) return false;

  // Convertir la fecha a timestamp en segundos
  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  // Si JWTTimestamp < changedTimestamp, significa que el token se emitió antes del cambio de contraseña
  return JWTTimestamp < changedTimestamp;
};

// Método para generar el token de reseteo de contraseña
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // El token expira en 10 minutos
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
