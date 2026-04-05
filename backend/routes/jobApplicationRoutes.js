const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const applicationController = require('../controller/applicationController');

// --- Todas las rutas requieren autenticación ---

// --- Rutas con paths estáticos (ANTES de /:id) ---

// Estudiante: postularse a una oferta
router.post('/apply', protect, applicationController.applyToJob);

// Estudiante: ver mis postulaciones
router.get('/my', protect, applicationController.getMyApplications);

// Organización: ver postulaciones de una oferta
router.get('/job/:jobId', protect, applicationController.getApplicationsForJob);

// --- Rutas con parámetro dinámico /:id ---

// Detalle de una postulación
router.get('/:id', protect, applicationController.getApplicationById);

// Estudiante: retirar postulación
router.patch('/:id/withdraw', protect, applicationController.withdrawApplication);

// Organización: actualizar estado de postulación
router.patch('/:id/status', protect, applicationController.updateApplicationStatus);

module.exports = router;
