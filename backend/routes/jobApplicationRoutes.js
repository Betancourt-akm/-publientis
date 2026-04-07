const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/auth');
const applicationController = require('../controller/applicationController');

// --- Todas las rutas requieren autenticación ---

// --- Rutas con paths estáticos (ANTES de /:id) ---

// Estudiante: postularse a una oferta
router.post('/apply', protect, authorizeRoles('STUDENT', 'USER'), applicationController.applyToJob);

// Estudiante: ver mis postulaciones
router.get('/my', protect, authorizeRoles('STUDENT', 'USER', 'ADMIN', 'OWNER'), applicationController.getMyApplications);

// Organización: ver postulaciones de una oferta
router.get('/job/:jobId', protect, authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'), applicationController.getApplicationsForJob);

// --- Rutas con parámetro dinámico /:id ---

// Detalle de una postulación
router.get('/:id', protect, applicationController.getApplicationById);

// Estudiante: retirar postulación
router.patch('/:id/withdraw', protect, authorizeRoles('STUDENT', 'USER', 'ADMIN', 'OWNER'), applicationController.withdrawApplication);

// Organización: actualizar estado de postulación
router.patch('/:id/status', protect, authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'), applicationController.updateApplicationStatus);

module.exports = router;
