const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const passport = require('passport');
// Asegúrate de que la ruta a tu generador de tokens sea correcta
const { generateToken } = require('../utils/jwt'); 

// =================================================
// --- Rutas de Autenticación Local (Email/Pass) ---
// =================================================

// Ruta para el registro de nuevos usuarios
router.post('/register', authController.register);

// Ruta para el inicio de sesión de usuarios
router.post('/login', authController.login);

// Ruta para el cierre de sesión
router.get('/logout', authController.logout);

// Rutas para recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Ruta para verificar el email del usuario
router.get('/verify/:token', authController.verifyEmail);

// Ruta para reenviar email de verificación
router.post('/resend-verification', authController.resendVerification);


// ========================================
// --- Rutas de Autenticación con Google ---
// ========================================

// 1. Ruta para iniciar autenticación con Google
router.get('/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: true,
    prompt: 'select_account'
  })
);

// 2. Callback de Google después del consentimiento del usuario
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: true }, (err, user, info) => {
    // Log detallado para diagnosticar errores
    if (err) {
      console.error('❌ Google OAuth ERROR:', err.message, err.code, err.oauthError);
      console.error('❌ Error completo:', JSON.stringify(err, null, 2));
      return res.redirect("https://publientis.online/login?error=auth_failed");
    }
    
    if (!user) {
      console.error('❌ Google OAuth: No user returned. Info:', info);
      return res.redirect("https://publientis.online/login?error=no_user");
    }

    // Establecer sesión manualmente
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('❌ Error en req.logIn:', loginErr);
        return res.redirect("https://publientis.online/login?error=login_failed");
      }

      console.log('✅ Google OAuth: Usuario autenticado:', user.email);
      
      // Generamos el token JWT
      const token = generateToken(user._id);
      
      // Establecer cookie con el token
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });
      
      console.log('✅ OAuth Google: Cookie establecida para usuario:', user.email);
      res.redirect("https://publientis.online/oauth-success");
    });
  })(req, res, next);
});

module.exports = router;