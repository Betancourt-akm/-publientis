const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  generateCV,
  downloadUserCV
} = require('../controller/cvGeneratorController');

// Todas las rutas requieren autenticación
router.use(protect);

// Generar CV del usuario actual
router.get('/generate', generateCV);

// Descargar CV de otro usuario (admin/faculty)
router.get('/download/:userId', authorizeRoles('ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'), downloadUserCV);

module.exports = router;
