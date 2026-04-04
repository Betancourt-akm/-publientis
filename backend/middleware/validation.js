const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    console.log(`🚨 [VALIDATION ERROR] ${req.method} ${req.originalUrl} - IP: ${req.clientIP}`, errorMessages);
    
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errorMessages
    });
  }
  
  next();
};

// Validaciones para autenticación
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email debe ser válido'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
    
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('Nombre debe tener entre 2-50 caracteres y solo letras'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('Apellido debe tener entre 2-50 caracteres y solo letras'),
    
    body('role')
      .isIn(['OWNER', 'WALKER'])
      .withMessage('Rol debe ser OWNER o WALKER'),
    
    body('phone')
      .optional()
      .isMobilePhone('es-CO')
      .withMessage('Teléfono debe ser válido para Colombia'),
    
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email debe ser válido'),
    
    body('password')
      .notEmpty()
      .withMessage('Contraseña es requerida'),
    
    handleValidationErrors
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email debe ser válido'),
    
    handleValidationErrors
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .isLength({ min: 64, max: 64 })
      .withMessage('Token de reset inválido'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
    
    handleValidationErrors
  ]
};

// Validaciones para perfil de usuario
const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('Nombre debe tener entre 2-50 caracteres y solo letras'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('Apellido debe tener entre 2-50 caracteres y solo letras'),
    
    body('phone')
      .optional()
      .isMobilePhone('es-CO')
      .withMessage('Teléfono debe ser válido para Colombia'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Biografía no puede exceder 500 caracteres'),
    
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Contraseña actual es requerida'),
    
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Nueva contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
    
    handleValidationErrors
  ]
};

// Validaciones para paseadores
const walkerValidation = {
  application: [
    body('experience')
      .isInt({ min: 0, max: 50 })
      .withMessage('Experiencia debe ser un número entre 0 y 50 años'),
    
    body('services')
      .isArray({ min: 1 })
      .withMessage('Debe seleccionar al menos un servicio'),
    
    body('services.*')
      .isIn(['WALK', 'CARE', 'TRAINING', 'GROOMING', 'BOARDING'])
      .withMessage('Servicio inválido'),
    
    body('availability')
      .isObject()
      .withMessage('Disponibilidad debe ser un objeto'),
    
    body('hourlyRate')
      .isFloat({ min: 10000, max: 100000 })
      .withMessage('Tarifa por hora debe estar entre $10,000 y $100,000'),
    
    body('coverageArea')
      .isArray({ min: 1 })
      .withMessage('Debe seleccionar al menos una zona de cobertura'),
    
    body('emergencyContact.name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre de contacto de emergencia requerido'),
    
    body('emergencyContact.phone')
      .isMobilePhone('es-CO')
      .withMessage('Teléfono de emergencia debe ser válido'),
    
    handleValidationErrors
  ]
};

// Validaciones para reservas
const bookingValidation = {
  create: [
    body('walkerId')
      .isMongoId()
      .withMessage('ID de paseador inválido'),
    
    body('petIds')
      .isArray({ min: 1 })
      .withMessage('Debe seleccionar al menos una mascota'),
    
    body('petIds.*')
      .isMongoId()
      .withMessage('ID de mascota inválido'),
    
    body('serviceType')
      .isIn(['WALK', 'CARE', 'TRAINING', 'GROOMING', 'BOARDING'])
      .withMessage('Tipo de servicio inválido'),
    
    body('scheduledDate')
      .isISO8601()
      .toDate()
      .custom((value) => {
        if (value <= new Date()) {
          throw new Error('Fecha debe ser futura');
        }
        return true;
      }),
    
    body('duration')
      .isInt({ min: 30, max: 480 })
      .withMessage('Duración debe estar entre 30 minutos y 8 horas'),
    
    body('location.address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Dirección debe tener entre 10-200 caracteres'),
    
    body('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Coordenadas deben ser [longitud, latitud]'),
    
    body('location.coordinates.*')
      .isFloat()
      .withMessage('Coordenadas deben ser números válidos'),
    
    body('specialInstructions')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Instrucciones especiales no pueden exceder 1000 caracteres'),
    
    handleValidationErrors
  ]
};

// Validaciones para mascotas
const petValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('Nombre debe tener entre 2-50 caracteres y solo letras'),
    
    body('species')
      .isIn(['DOG', 'CAT'])
      .withMessage('Especie debe ser DOG o CAT'),
    
    body('breed')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Raza debe tener entre 2-50 caracteres'),
    
    body('age')
      .isInt({ min: 0, max: 30 })
      .withMessage('Edad debe estar entre 0 y 30 años'),
    
    body('weight')
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('Peso debe estar entre 0.1 y 100 kg'),
    
    body('size')
      .isIn(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'])
      .withMessage('Tamaño inválido'),
    
    body('temperament')
      .isIn(['CALM', 'ENERGETIC', 'AGGRESSIVE', 'SHY', 'FRIENDLY'])
      .withMessage('Temperamento inválido'),
    
    body('medicalConditions')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Condiciones médicas no pueden exceder 500 caracteres'),
    
    body('specialNeeds')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Necesidades especiales no pueden exceder 500 caracteres'),
    
    handleValidationErrors
  ]
};

// Validaciones para parámetros de URL
const paramValidation = {
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('ID inválido'),
    
    handleValidationErrors
  ],

  userId: [
    param('userId')
      .isMongoId()
      .withMessage('ID de usuario inválido'),
    
    handleValidationErrors
  ]
};

// Validaciones para queries
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página debe ser un número mayor a 0'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite debe estar entre 1 y 100'),
    
    handleValidationErrors
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Búsqueda debe tener entre 1-100 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  authValidation,
  userValidation,
  walkerValidation,
  bookingValidation,
  petValidation,
  paramValidation,
  queryValidation,
  handleValidationErrors
};
