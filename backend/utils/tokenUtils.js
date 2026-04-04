const crypto = require('crypto');

/**
 * Genera un token criptográficamente seguro.
 * @returns {string} Un token hexadecimal de 40 caracteres (20 bytes).
 */
const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = { generateToken };
