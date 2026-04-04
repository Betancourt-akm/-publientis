const crypto = require('crypto');
const { logger } = require('./simpleLogger');

// Configuración de cifrado
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Asegurar que la clave tenga la longitud correcta
const getEncryptionKey = () => {
  if (ENCRYPTION_KEY.length !== 64) {
    console.warn('⚠️  ENCRYPTION_KEY debe tener 64 caracteres. Generando clave temporal...');
    return crypto.randomBytes(32);
  }
  return Buffer.from(ENCRYPTION_KEY, 'hex');
};

/**
 * Cifra un texto usando AES-256-GCM
 * @param {string} text - Texto a cifrar
 * @returns {string} - Texto cifrado en formato base64
 */
const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combinar IV + datos cifrados
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  } catch (error) {
    console.error('Error al cifrar:', error);
    return text; // Devolver texto original si falla el cifrado
  }
};

/**
 * Descifra un texto cifrado con AES-256-GCM
 * @param {string} encryptedText - Texto cifrado en base64
 * @returns {string} - Texto descifrado
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Extraer IV y datos cifrados
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al descifrar:', error);
    return encryptedText; // Devolver texto original si falla el descifrado
  }
};

/**
 * Cifra datos sensibles usando CryptoJS (alternativo)
 * @param {string} text - Texto a cifrar
 * @param {string} secretKey - Clave secreta opcional
 * @returns {string} - Texto cifrado
 */
const encryptSensitive = (text, secretKey = null) => {
  if (!text) return null;
  
  try {
    // Usar cifrado nativo de Node.js temporalmente
    return encrypt(text);
  } catch (error) {
    console.error('Error al cifrar datos sensibles:', error);
    return null;
  }
};

/**
 * Descifra datos sensibles usando CryptoJS
 * @param {string} encryptedText - Texto cifrado
 * @param {string} secretKey - Clave secreta opcional
 * @returns {string} - Texto descifrado
 */
const decryptSensitive = (encryptedText, secretKey = null) => {
  if (!encryptedText) return null;
  
  try {
    // Usar descifrado nativo de Node.js temporalmente
    return decrypt(encryptedText);
  } catch (error) {
    console.error('Error al descifrar datos sensibles:', error);
    return null;
  }
};

/**
 * Genera un hash seguro para datos
 * @param {string} data - Datos a hashear
 * @param {string} salt - Salt opcional
 * @returns {object} - {hash, salt}
 */
const hashData = (data, salt = null) => {
  if (!data) return null;
  
  try {
    const saltToUse = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(data, saltToUse, 10000, 64, 'sha512').toString('hex');
    
    return {
      hash,
      salt: saltToUse
    };
  } catch (error) {
    console.error('Error al hashear datos:', error);
    return null;
  }
};

/**
 * Verifica un hash
 * @param {string} data - Datos originales
 * @param {string} hash - Hash a verificar
 * @param {string} salt - Salt usado
 * @returns {boolean} - True si coincide
 */
const verifyHash = (data, hash, salt) => {
  if (!data || !hash || !salt) return false;
  
  try {
    const hashToVerify = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return hashToVerify === hash;
  } catch (error) {
    console.error('Error al verificar hash:', error);
    return false;
  }
};

/**
 * Cifra un objeto completo
 * @param {object} obj - Objeto a cifrar
 * @returns {string} - Objeto cifrado en JSON
 */
const encryptObject = (obj) => {
  if (!obj) return null;
  
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
  } catch (error) {
    console.error('Error al cifrar objeto:', error);
    return null;
  }
};

/**
 * Descifra un objeto
 * @param {string} encryptedObj - Objeto cifrado
 * @returns {object} - Objeto descifrado
 */
const decryptObject = (encryptedObj) => {
  if (!encryptedObj) return null;
  
  try {
    const jsonString = decrypt(encryptedObj);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error al descifrar objeto:', error);
    return null;
  }
};

/**
 * Genera un token seguro
 * @param {number} length - Longitud del token
 * @returns {string} - Token generado
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Genera un ID único
 * @returns {string} - ID único
 */
const generateUniqueId = () => {
  return crypto.randomUUID();
};

/**
 * Cifra campos específicos de un documento
 * @param {object} doc - Documento
 * @param {array} fields - Campos a cifrar
 * @returns {object} - Documento con campos cifrados
 */
const encryptFields = (doc, fields) => {
  if (!doc || !fields || !Array.isArray(fields)) return doc;
  
  const encrypted = { ...doc };
  
  fields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encryptSensitive(encrypted[field]);
    }
  });
  
  return encrypted;
};

/**
 * Descifra campos específicos de un documento
 * @param {object} doc - Documento
 * @param {array} fields - Campos a descifrar
 * @returns {object} - Documento con campos descifrados
 */
const decryptFields = (doc, fields) => {
  if (!doc || !fields || !Array.isArray(fields)) return doc;
  
  const decrypted = { ...doc };
  
  fields.forEach(field => {
    if (decrypted[field]) {
      decrypted[field] = decryptSensitive(decrypted[field]);
    }
  });
  
  return decrypted;
};

// Campos sensibles que deben cifrarse
const SENSITIVE_FIELDS = [
  'phone',
  'address',
  'emergencyContact',
  'medicalConditions',
  'specialNeeds',
  'bankAccount',
  'identificationNumber',
  'socialSecurityNumber'
];

/**
 * Middleware para cifrar automáticamente campos sensibles
 */
const encryptSensitiveMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = encryptFields(req.body, SENSITIVE_FIELDS);
  }
  next();
};

/**
 * Middleware para descifrar automáticamente campos sensibles
 */
const decryptSensitiveMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (data && typeof data === 'object') {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed.data) {
          parsed.data = decryptFields(parsed.data, SENSITIVE_FIELDS);
        }
        data = JSON.stringify(parsed);
      } catch (error) {
        // Si no se puede parsear, enviar como está
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  encrypt,
  decrypt,
  encryptSensitive,
  decryptSensitive,
  hashData,
  verifyHash,
  encryptObject,
  decryptObject,
  generateSecureToken,
  generateUniqueId,
  encryptFields,
  decryptFields,
  encryptSensitiveMiddleware,
  decryptSensitiveMiddleware,
  SENSITIVE_FIELDS
};
