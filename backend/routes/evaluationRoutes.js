const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitEvaluation,
  getPendingEvaluations,
  getReceivedEvaluations,
  getGivenEvaluations,
  getEvaluationStats,
  updateVisibility
} = require('../controller/evaluationController');

// Todas las rutas requieren autenticación
router.use(protect);

// Enviar evaluación
router.post('/submit', submitEvaluation);

// Obtener evaluaciones pendientes del usuario
router.get('/pending', getPendingEvaluations);

// Obtener evaluaciones recibidas por un usuario
router.get('/received/:userId', getReceivedEvaluations);

// Obtener evaluaciones dadas por el usuario
router.get('/given', getGivenEvaluations);

// Obtener estadísticas de evaluaciones
router.get('/stats/:userId', getEvaluationStats);

// Actualizar visibilidad de evaluación (solo el evaluado)
router.put('/:evaluationId/visibility', updateVisibility);

module.exports = router;
