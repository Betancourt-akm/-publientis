// middleware/adminRole.js
/**
 * Middleware para asegurar que el usuario autenticado tiene rol ADMIN.
 * Debe colocarse después de authToken, que inyecta req.user.
 */
module.exports = function adminRole(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acceso solo para administradores' });
    }
    next();
  } catch (err) {
    console.error('Error en adminRole middleware:', err);
    res.status(500).json({ success: false, message: 'Error interno de autorización' });
  }
};
