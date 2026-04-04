const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Logger simple sin dependencias externas
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [INFO]: ${message} ${JSON.stringify(meta)}\n`;
    
    console.log(`ℹ️ ${message}`, meta);
    
    // Escribir a archivo
    fs.appendFileSync(path.join(logDir, 'combined.log'), logEntry);
  },
  
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [WARN]: ${message} ${JSON.stringify(meta)}\n`;
    
    console.warn(`⚠️ ${message}`, meta);
    
    // Escribir a archivo
    fs.appendFileSync(path.join(logDir, 'combined.log'), logEntry);
    fs.appendFileSync(path.join(logDir, 'security.log'), logEntry);
  },
  
  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [ERROR]: ${message} ${JSON.stringify(meta)}\n`;
    
    console.error(`❌ ${message}`, meta);
    
    // Escribir a archivo
    fs.appendFileSync(path.join(logDir, 'combined.log'), logEntry);
    fs.appendFileSync(path.join(logDir, 'error.log'), logEntry);
  }
};

// Logger específico para seguridad
const securityLogger = {
  log: (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level.toUpperCase()}]: ${message} ${JSON.stringify(meta)}\n`;
    
    console.log(`🔒 [${level.toUpperCase()}] ${message}`, meta);
    
    // Escribir a archivo de seguridad
    fs.appendFileSync(path.join(logDir, 'security.log'), logEntry);
  }
};

// Logger específico para auditoría
const auditLogger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [AUDIT]: ${message} ${JSON.stringify(meta)}\n`;
    
    console.log(`📋 [AUDIT] ${message}`, meta);
    
    // Escribir a archivo de auditoría
    fs.appendFileSync(path.join(logDir, 'audit.log'), logEntry);
  }
};

// Funciones de utilidad para logging
const logSecurity = (level, message, meta = {}) => {
  securityLogger.log(level, message, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logAudit = (action, userId, details = {}) => {
  auditLogger.info('AUDIT_EVENT', {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

const logError = (error, req = null, additionalInfo = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.clientIP || req.ip,
      userAgent: req.userAgent || req.get('User-Agent'),
      userId: req.user?.id
    };
  }

  logger.error('APPLICATION_ERROR', errorInfo);
};

const logAuth = (event, userId, success, details = {}) => {
  const level = success ? 'info' : 'warn';
  const message = `AUTH_${event.toUpperCase()}_${success ? 'SUCCESS' : 'FAILED'}`;
  
  logSecurity(level, message, {
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
};

const logRateLimit = (ip, endpoint, userAgent) => {
  logSecurity('warn', 'RATE_LIMIT_EXCEEDED', {
    ip,
    endpoint,
    userAgent,
    timestamp: new Date().toISOString()
  });
};

const logSuspiciousActivity = (type, details) => {
  logSecurity('error', `SUSPICIOUS_ACTIVITY_${type.toUpperCase()}`, {
    type,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturar información del request
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.clientIP || req.ip,
    userAgent: req.userAgent || req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  };

  // Log del request
  logger.info('REQUEST_START', requestInfo);

  // Interceptar response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const responseInfo = {
      ...requestInfo,
      statusCode: res.statusCode,
      duration,
      responseSize: data ? Buffer.byteLength(typeof data === 'string' ? data : JSON.stringify(data), 'utf8') : 0
    };

    // Log del response
    if (res.statusCode >= 400) {
      logger.warn('REQUEST_ERROR', responseInfo);
    } else {
      logger.info('REQUEST_SUCCESS', responseInfo);
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  logger,
  securityLogger,
  auditLogger,
  logSecurity,
  logAudit,
  logError,
  logAuth,
  logRateLimit,
  logSuspiciousActivity,
  requestLogger
};
