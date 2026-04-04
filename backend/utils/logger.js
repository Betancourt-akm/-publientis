const winston = require('winston');
const path = require('path');

// Crear directorio de logs si no existe
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configuración del logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'sako-pets-backend' },
  transports: [
    // Logs de errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Logs combinados
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Logs de seguridad
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Agregar consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Logger específico para seguridad
const securityLogger = winston.createLogger({
  level: 'info',
  format: customFormat,
  defaultMeta: { service: 'sako-pets-security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'security-combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Logger específico para auditoría
const auditLogger = winston.createLogger({
  level: 'info',
  format: customFormat,
  defaultMeta: { service: 'sako-pets-audit' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 20
    })
  ]
});

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
      responseSize: Buffer.byteLength(data || '', 'utf8')
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

// Función para limpiar logs antiguos
const cleanOldLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
  const now = Date.now();

  fs.readdir(logDir, (err, files) => {
    if (err) return;

    files.forEach(file => {
      const filePath = path.join(logDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              logger.info('OLD_LOG_CLEANED', { file });
            }
          });
        }
      });
    });
  });
};

// Limpiar logs antiguos cada día
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);

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
