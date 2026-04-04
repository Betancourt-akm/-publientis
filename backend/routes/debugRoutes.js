const express = require('express');
const router = express.Router();
const authToken = require('../middleware/authToken');

// Endpoint de debug para verificar autenticación
router.get('/debug/auth', authToken, (req, res) => {
  console.log('🔍 DEBUG AUTH - Usuario autenticado:', req.user);
  res.json({
    success: true,
    message: 'Usuario autenticado correctamente',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Endpoint de debug SIN autenticación para verificar cookies
router.get('/debug/cookies', (req, res) => {
  console.log('🍪 DEBUG COOKIES - Headers:', req.headers);
  console.log('🍪 DEBUG COOKIES - Cookies:', req.cookies);
  res.json({
    success: true,
    cookies: req.cookies,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie
    }
  });
});

// Endpoint simple para verificar que el servidor funciona
router.get('/debug/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
