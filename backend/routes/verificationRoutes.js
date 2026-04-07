const express = require('express');
const router = express.Router();
const authToken = require('../middleware/authToken');
const {
  requestVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationStats
} = require('../controller/verificationController');

// Todas las rutas requieren autenticación
router.use(authToken);

// POST /api/verification/request - Solicitar verificación (Egresado)
router.post('/request', requestVerification);

// GET /api/verification/pending - Pendientes (Coordinador/Facultad/Admin)
router.get('/pending', getPendingVerifications);

// PUT /api/verification/approve/:userId - Aprobar (Coordinador)
router.put('/approve/:userId', approveVerification);

// PUT /api/verification/reject/:userId - Rechazar (Coordinador)
router.put('/reject/:userId', rejectVerification);

// GET /api/verification/stats - Estadísticas (Dashboard)
router.get('/stats', getVerificationStats);

module.exports = router;
