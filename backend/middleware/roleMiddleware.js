// middleware/roleMiddleware.js
const userModel = require("../models/userModel");

/**
 * Middleware para verificar si un usuario es ADMIN
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
async function isAdmin(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
}

/**
 * Middleware para verificar si un usuario es USER (cliente)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
async function isUser(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.role !== 'USER' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
}

// Funciones legacy para compatibilidad (si aún se usan en otras partes)
async function isTeacher(userId) {
  const u = await userModel.findById(userId);
  return !!(u && u.role === 'ADMIN'); // Los admins tienen todos los permisos
}

async function isStudent(userId) {
  const u = await userModel.findById(userId);
  return !!(u && u.role === 'USER');
}

module.exports = { isAdmin, isUser, isTeacher, isStudent };
