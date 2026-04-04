const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Genera un token JWT para un ID de usuario.
 * @param {string} id - El ID del usuario.
 * @returns {string} - El token JWT firmado.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', // El token expira en 1 día por defecto
  });
};

/**
 * Verifica un token JWT y devuelve los datos decodificados.
 * @param {string} token - El token JWT a verificar.
 * @returns {Promise<Object>} - Los datos decodificados del token.
 */
const verifyToken = async (token) => {
  try {
    // Convertir jwt.verify a una función que devuelve una promesa
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = { generateToken, verifyToken };
