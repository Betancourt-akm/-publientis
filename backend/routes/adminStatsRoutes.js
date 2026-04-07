const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getResponseTrafficLight,
  getConvenioStatus,
  approveJobOffer,
  getPendingJobOffers,
  getAdminKPIs
} = require('../controller/adminStatsController');

// Todas las rutas requieren autenticación y rol de admin/faculty
router.use(protect);
router.use(authorizeRoles('ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'));

// KPIs generales del dashboard
router.get('/kpis', getAdminKPIs);

// Semáforo de respuesta institucional
router.get('/response-traffic-light', getResponseTrafficLight);

// Estado de convenios institucionales
router.get('/convenios', getConvenioStatus);

// Ofertas pendientes de aprobación
router.get('/pending-offers', getPendingJobOffers);

// Aprobar/Rechazar oferta
router.put('/approve-offer/:jobOfferId', approveJobOffer);

module.exports = router;
