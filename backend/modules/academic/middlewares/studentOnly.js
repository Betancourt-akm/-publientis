const userModel = require("../../../models/userModel");

/**
 * Middleware para verificar si un usuario tiene rol STUDENT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
async function studentOnly(req, res, next) {
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

    if (user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de estudiante'
      });
    }

    req.academicUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
}

module.exports = studentOnly;
