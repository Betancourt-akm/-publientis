/**
 * Middleware para permitir acceso público o a usuarios visitantes
 * No requiere autenticación, pero si hay usuario autenticado, lo adjunta
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
async function visitorAccess(req, res, next) {
  try {
    // Permitir acceso sin autenticación
    // Si el usuario está autenticado (por otros middlewares), mantener esa info
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
}

module.exports = visitorAccess;
