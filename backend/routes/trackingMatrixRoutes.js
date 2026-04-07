const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getTrackingMatrix,
  validateDocument,
  notifyInstitutionAboutStuckStudent
} = require('../controller/trackingMatrixController');

// Todas las rutas requieren autenticación y rol de admin/faculty
router.use(protect);
router.use(authorizeRoles('ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'));

// Obtener matriz de seguimiento
router.get('/', getTrackingMatrix);

// Validar documento de estudiante
router.put('/validate-document', validateDocument);

// Notificar a institución sobre estudiante estancado
router.post('/notify-stuck-student', notifyInstitutionAboutStuckStudent);

module.exports = router;
