const security = require('../middleware/security');
const { requestLogger, logError } = require('../utils/simpleLogger');
const { encryptSensitiveMiddleware, decryptSensitiveMiddleware } = require('../utils/encryption');

/**
 * Configuración de seguridad para la aplicación
 * Implementa múltiples capas de protección
 */

// Middleware de sanitización básica
const sanitizeInput = (req, res, next) => {
  // Sanitizar query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Remover caracteres peligrosos
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    });
  }

  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

// Función recursiva para sanitizar objetos
const sanitizeObject = (obj) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
};

// Middleware para detectar actividad sospechosa
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\$ne|\$gt|\$lt|\$in|\$nin)/i, // NoSQL injection patterns
    /(union|select|insert|delete|drop|create|alter)/i, // SQL injection patterns
    /<script|javascript:|on\w+=/i, // XSS patterns
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal patterns
  ];

  const checkString = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && checkString(value)) {
        console.log(`🚨 [SUSPICIOUS] Patrón sospechoso detectado en ${currentPath}: ${value}`);
        return true;
      } else if (typeof value === 'object' && value !== null) {
        if (checkObject(value, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar query parameters
  if (req.query && checkObject(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Solicitud bloqueada por seguridad'
    });
  }

  // Verificar body
  if (req.body && checkObject(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Solicitud bloqueada por seguridad'
    });
  }

  next();
};

// Middleware para logging de seguridad avanzado
const advancedSecurityLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.clientIP || req.ip,
    userAgent: req.userAgent || req.get('User-Agent'),
    referer: req.get('Referer'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  };

  // Detectar patrones de ataque comunes
  const userAgent = requestInfo.userAgent.toLowerCase();
  const suspiciousUAs = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp'];
  
  if (suspiciousUAs.some(ua => userAgent.includes(ua))) {
    console.log(`🚨 [SECURITY ALERT] Herramienta de hacking detectada: ${requestInfo.userAgent} desde ${requestInfo.ip}`);
  }

  // Log de request con información de seguridad
  console.log(`🔒 [SECURITY LOG] ${requestInfo.method} ${requestInfo.url} - IP: ${requestInfo.ip}`);

  // Interceptar response para métricas
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const responseInfo = {
      ...requestInfo,
      statusCode: res.statusCode,
      duration,
      responseSize: Buffer.byteLength(data || '', 'utf8')
    };

    // Alertas por códigos de estado sospechosos
    if (res.statusCode === 401) {
      console.log(`🚨 [AUTH FAILED] Intento de acceso no autorizado desde ${requestInfo.ip}`);
    } else if (res.statusCode === 403) {
      console.log(`🚨 [ACCESS DENIED] Acceso denegado para ${requestInfo.ip} a ${requestInfo.url}`);
    } else if (res.statusCode >= 500) {
      console.log(`🚨 [SERVER ERROR] Error ${res.statusCode} en ${requestInfo.url} desde ${requestInfo.ip}`);
    }

    originalSend.call(this, data);
  };

  next();
};

// Middleware para protección contra ataques de timing
const timingAttackProtection = (req, res, next) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Si la respuesta fue muy rápida (posible timing attack), agregar delay
    if (duration < 100 && (res.statusCode === 401 || res.statusCode === 404)) {
      const delay = 100 + Math.random() * 200; // 100-300ms de delay aleatorio
      setTimeout(() => {
        originalSend.call(this, data);
      }, delay);
    } else {
      originalSend.call(this, data);
    }
  };
  
  next();
};

// Configuración de CORS más estricta para producción
const strictCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_DOMAIN,
      'http://localhost:3000', // Solo para desarrollo
    ].filter(Boolean);

    // Permitir requests sin origin (navegación directa, curl/health checks, Postman, etc.)
    // Esto es necesario para flujos OAuth (GET /api/auth/google) y endpoints públicos.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚨 [CORS BLOCKED] Origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 horas
};

// Función para aplicar toda la seguridad básica
const applyBasicSecurity = (app) => {
  // 1. Extracción de IP y logging básico
  app.use(security.extractClientIP);
  
  // 2. Logging de requests
  app.use(requestLogger);
  
  // 3. Headers de seguridad con Helmet
  app.use(security.helmet);
  
  // 4. Rate limiting general
  app.use(security.rateLimits.general);
  
  // 5. Sanitización de inputs
  app.use(sanitizeInput);
  
  // 6. Detección de actividad sospechosa
  app.use(detectSuspiciousActivity);
  
  // 7. Logging de seguridad avanzado
  app.use(advancedSecurityLogger);
  
  // 8. Protección contra timing attacks
  app.use(timingAttackProtection);
  
  // 9. Cifrado automático de campos sensibles
  app.use(encryptSensitiveMiddleware);
  
  console.log('🔒 Seguridad básica aplicada correctamente');
};

// Función para aplicar seguridad avanzada
const applyAdvancedSecurity = (app) => {
  // Middleware de manejo de errores de seguridad
  app.use((error, req, res, next) => {
    if (error.message === 'No permitido por CORS') {
      logError(error, req, { type: 'CORS_VIOLATION' });
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }
    
    logError(error, req, { type: 'SECURITY_ERROR' });
    next(error);
  });
  
  console.log('🔒 Seguridad avanzada aplicada correctamente');
};

// Configuración específica para rutas sensibles
const sensitiveRoutesSecurity = {
  // Para rutas de autenticación
  auth: [
    security.authRateLimit,
    timingAttackProtection
  ],
  
  // Para rutas de registro
  register: [
    security.registerRateLimit,
    sanitizeInput,
    detectSuspiciousActivity
  ],
  
  // Para rutas de admin
  admin: [
    security.adminRateLimit,
    advancedSecurityLogger,
    detectSuspiciousActivity
  ],
  
  // Para rutas de upload
  upload: [
    security.uploadRateLimit,
    // Aquí se pueden agregar validaciones específicas de archivos
  ]
};

module.exports = {
  applyBasicSecurity,
  applyAdvancedSecurity,
  strictCorsOptions,
  sensitiveRoutesSecurity,
  sanitizeInput,
  detectSuspiciousActivity,
  advancedSecurityLogger,
  timingAttackProtection
};
