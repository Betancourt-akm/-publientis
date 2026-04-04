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
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: "https://clickpublicidad.click/login?error=auth_failed", 
    session: true 
  }), 
  (req, res) => {
    try {
      // Passport añade el usuario a req.user si la autenticación es exitosa
      const user = req.user;
      
      if (!user) {
        console.error('❌ Google OAuth: No se encontró usuario en req.user');
        return res.redirect("https://clickpublicidad.click/login?error=no_user");
      }
      
      console.log('✅ Google OAuth: Usuario autenticado:', user.email);
      
      // Generamos el token JWT
      const token = generateToken(user._id);
      
      // ✅ CORRECCIÓN: ESTABLECER COOKIE (igual que login normal)
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // true en producción
        sameSite: 'lax', // lax para OAuth redirects
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/' // Disponible en toda la app
      });
      
      console.log('✅ OAuth Google: Cookie establecida para usuario:', user.email);
      
      // Redirigir al frontend SIN el token en la URL (está en la cookie)
      const redirectUrl = "https://clickpublicidad.click/oauth-success";
      console.log('🔄 Redirigiendo a:', redirectUrl);
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Error en Google OAuth callback:', error);
      res.redirect("https://clickpublicidad.click/login?error=oauth_failed");
    }
  }
);

module.exports = router;