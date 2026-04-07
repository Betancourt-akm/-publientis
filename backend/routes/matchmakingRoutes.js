const express = require('express');
const router = express.Router();
const authToken = require('../middleware/authToken');
const {
  registerMatchInterest,
  getMatchmakingDashboard,
  getMatchAlerts,
  updateFollowUp,
  getProgramStats
} = require('../controller/matchmakingController');

// Middleware de autenticación
router.use(authToken);

// POST /api/matchmaking/register-interest
// Registrar interés de organización en egresado
router.post('/register-interest', registerMatchInterest);

// GET /api/matchmaking/dashboard
// Dashboard de matches (Facultad/Admin)
router.get('/dashboard', getMatchmakingDashboard);

// GET /api/matchmaking/alerts
// Alertas de matches pendientes (Coordinadores)
router.get('/alerts', getMatchAlerts);

// PUT /api/matchmaking/follow-up/:matchId
// Actualizar seguimiento de match
router.put('/follow-up/:matchId', updateFollowUp);

// GET /api/matchmaking/stats/program/:programId
// Estadísticas por programa
router.get('/stats/program/:programId', getProgramStats);

module.exports = router;
