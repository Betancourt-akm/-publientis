const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const authToken = require('../middleware/authToken');
const { uploadFaceFields, verifyFace } = require('../controller/identityController');

/**
 * Middleware para asegurar autenticación compatible tanto con
 * Passport.js (sesión / req.user) como con JWT (token en cookie / Bearer header).
 */
const requireAuth = (req, res, next) => {
  // 1. Si el usuario ya está autenticado mediante sesión Passport
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    req.userId = req.user._id;
    return next();
  }

  // 2. Si no, validar mediante el middleware authToken del proyecto
  return authToken(req, res, next);
};

/**
 * Rate Limiter específico para verificación facial:
 * Máximo 5 intentos cada 15 minutos por usuario autenticado (o IP normalizada como fallback).
 */
const faceVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  standardHeaders: true, // Retorna cabeceras RateLimit-* estándar
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Agrupa por ID de usuario autenticado si existe
    if (req.user?._id) return req.user._id.toString();
    if (req.userId) return req.userId.toString();
    // Fallback a IP usando el helper oficial para soporte IPv4/IPv6
    return ipKeyGenerator(req);
  },
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Has superado el límite de 5 intentos de verificación facial por cada 15 minutos. Por favor, intenta de nuevo más tarde.'
    });
  }
});

/**
 * POST /api/identity/verify-face
 * Recibe document_image y selfie_image, reenvía al microservicio y devuelve el resultado.
 */
router.post(
  '/verify-face',
  requireAuth,
  faceVerificationLimiter,
  uploadFaceFields,
  verifyFace
);

module.exports = router;