const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function authToken(req, res, next) {
  console.log(`🔐 Middleware authToken aplicado en ruta: ${req.originalUrl}`);
  console.log('🍪 Cookies recibidas:', req.cookies);
  console.log('🔐 Headers Authorization:', req.headers.authorization);
  try {
    let token = null;

    // *** INICIO DE LA CORRECCIÓN ***
    // 1. Intentamos obtener el token de la cabecera 'Authorization' (para OAuth)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token encontrado en la cabecera Authorization.');
    } 
    // 2. Si no está en la cabecera, lo buscamos en las cookies (para login normal)
    else if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('✅ Token encontrado en las cookies.');
    }
    // *** FIN DE LA CORRECCIÓN ***

    if (!token) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Please login to access this resource."
      });
    }

    // jwt.verify lanza si es inválido o expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Token decodificado:', decoded);
    
    if (!decoded.id) {
      throw new Error("Token malformado - falta ID de usuario");
    }

    // Busca el usuario completo (sin password)
    const user = await userModel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Usuario no encontrado. Por favor, vuelve a iniciar sesión."
      });
    }

    // Inyecta en req
    req.user = user;      // todo el objeto user
    req.userId = user._id; // sólo el ID, para compatibilidad

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Token ha expirado. Inicia sesión de nuevo."
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Token inválido. Inicia sesión de nuevo."
      });
    }
    console.error("Error en middleware authToken:", err);
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Error en autenticación."
    });
  }
}

module.exports = authToken;
