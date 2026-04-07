const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getEmploymentFunnel,
  getStatsByProgram,
  getPlacementTimeline,
  getTopInstitutions,
  getPracticeCenters,
  getGeneralKPIs
} = require('../controller/employabilityStatsController');

// Todas las rutas requieren autenticación y roles específicos
router.use(protect);
router.use(authorizeRoles('FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'));

// KPIs generales
router.get('/kpis', getGeneralKPIs);

// Embudo de conversión
router.get('/employment-funnel', getEmploymentFunnel);

// Estadísticas por programa académico
router.get('/by-program', getStatsByProgram);

// Línea de tiempo de vinculaciones
router.get('/placement-timeline', getPlacementTimeline);

// Top instituciones contratantes
router.get('/top-institutions', getTopInstitutions);

// Ranking de centros de práctica
router.get('/practice-centers', getPracticeCenters);

module.exports = router;
