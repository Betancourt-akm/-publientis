const helmet = require('helmet');
const { logSecurity, logAudit } = require('../utils/simpleLogger');
const rateLimit = require('express-rate-limit');

// Configuración de Rate Limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // ✅ Resetear contador en cada reinicio del servidor (desarrollo)
    skipFailedRequests: true, // No contar requests fallidas
    skipSuccessfulRequests: false,
    // Usar la configuración por defecto que maneja IPv6 correctamente
    // No necesitamos keyGenerator personalizado
  });
};

// Rate limits específicos por tipo de endpoint
const rateLimits = {
  // Rate limit general
  // DESARROLLO: 1000 requests por 15 minutos
  // PRODUCCIÓN: 100 requests por 15 minutos
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    process.env.NODE_ENV === 'production' ? 100 : 1000, // ✅ 1000 en desarrollo
    'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos'
  ),

  // Rate limit para autenticación
  // DESARROLLO: 100 intentos por 15 minutos
  // PRODUCCIÓN: Cambiar a 5 intentos
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    process.env.NODE_ENV === 'production' ? 5 : 100, // 100 en desarrollo, 5 en producción
    'Demasiados intentos de login, intenta de nuevo en 15 minutos'
  ),

  // Rate limit para registro
  // DESARROLLO: 20 registros por hora
  // PRODUCCIÓN: 3 registros por hora
  register: createRateLimit(
    60 * 60 * 1000, // 1 hora
    process.env.NODE_ENV === 'production' ? 3 : 20,
    'Demasiados intentos de registro, intenta de nuevo en 1 hora'
  ),

  // Rate limit para reset de contraseña
  // DESARROLLO: 10 intentos por hora
  // PRODUCCIÓN: 3 intentos por hora
  passwordReset: createRateLimit(
    60 * 60 * 1000, // 1 hora
    process.env.NODE_ENV === 'production' ? 3 : 10,
    'Demasiados intentos de reset de contraseña, intenta de nuevo en 1 hora'
  ),

  // Rate limit para endpoints de admin - 50 requests por 5 minutos
  admin: createRateLimit(
    5 * 60 * 1000, // 5 minutos
    50,
    'Demasiadas solicitudes administrativas, intenta de nuevo en 5 minutos'
  ),

  // Rate limit para uploads - 10 uploads por 10 minutos
  upload: createRateLimit(
    10 * 60 * 1000, // 10 minutos
    10,
    'Demasiados uploads, intenta de nuevo en 10 minutos'
  )
};

// Configuración de Helmet para headers de seguridad
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-XSS-Protection
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'same-origin'
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },

  // IE No Open
  ieNoOpen: true,

  // Don't infer MIME type
  noSniff: true
});

// Middleware para extraer IP real del cliente
const extractClientIP = (req, res, next) => {
  // Orden de prioridad para obtener la IP real
  const ip = req.headers['x-forwarded-for'] ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
             req.ip;

  req.clientIP = ip ? ip.split(',')[0].trim() : 'unknown';
  req.userAgent = req.headers['user-agent'] || 'unknown';
  
  next();
};

// Middleware de logging de seguridad
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log de request
  console.log(`🔒 [SECURITY] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.clientIP} - UA: ${req.userAgent}`);
  
  // Interceptar response para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log de response con código de estado
    if (statusCode >= 400) {
      console.log(`🚨 [SECURITY ERROR] ${statusCode} - ${req.method} ${req.originalUrl} - IP: ${req.clientIP} - Duration: ${duration}ms`);
    } else {
      console.log(`✅ [SECURITY OK] ${statusCode} - ${req.method} ${req.originalUrl} - IP: ${req.clientIP} - Duration: ${duration}ms`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  // Configuraciones principales
  helmet: helmetConfig,
  rateLimits,
  
  // Middlewares utilitarios
  extractClientIP,
  securityLogger,
  
  // Funciones de conveniencia
  applyBasicSecurity: (app) => {
    app.use(extractClientIP);
    app.use(securityLogger);
    app.use(helmetConfig);
    app.use(rateLimits.general);
  },
  
  // Rate limits específicos para rutas
  authRateLimit: rateLimits.auth,
  registerRateLimit: rateLimits.register,
  passwordResetRateLimit: rateLimits.passwordReset,
  adminRateLimit: rateLimits.admin,
  uploadRateLimit: rateLimits.upload
};
