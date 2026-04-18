const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const authToken = require('./authToken');

/**
 * Middleware para verificar si el usuario está autenticado
 * Utiliza el middleware authToken como base y extiende su funcionalidad
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Primero ejecutamos el middleware authToken para verificar el token y obtener el usuario
    await new Promise((resolve, reject) => {
      authToken(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Si llegamos aquí, el usuario está autenticado
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Por favor inicia sesión para acceder a este recurso'
    });
  }
};

/**
 * Middleware para autorizar roles específicos
 * @param {...String} roles - Roles permitidos para acceder al recurso
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verificamos que req.user exista (debería ser inyectado por authToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Por favor inicia sesión para acceder a este recurso'
      });
    }

    // Verificamos si el rol del usuario está entre los roles permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.role} no está autorizado para acceder a este recurso`
      });
    }

    next();
  };
};

module.exports = {
  isAuthenticated,
  protect: isAuthenticated,
  authorizeRoles
};
