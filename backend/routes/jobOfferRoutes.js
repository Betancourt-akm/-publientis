const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/auth');
const jobOfferController = require('../controller/jobOfferController');

// --- Rutas públicas ---
router.get('/', jobOfferController.getActiveJobOffers);

// --- Rutas protegidas con paths estáticos (ANTES de /:id) ---
router.post('/', protect, authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER'), jobOfferController.createJobOffer);

// Ofertas de la organización autenticada
router.get('/my/offers', protect, authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER'), jobOfferController.getMyJobOffers);

// Aprobación universitaria (FACULTY/DOCENTE/ADMIN)
router.get('/admin/pending', protect, authorizeRoles('FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'), jobOfferController.getPendingApproval);
router.get('/admin/stats', protect, authorizeRoles('FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'), jobOfferController.getJobStats);

// --- Rutas con parámetro dinámico /:id ---
router.get('/:id', jobOfferController.getJobOfferById);
router.put('/:id', protect, authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER'), jobOfferController.updateJobOffer);
router.delete('/:id', protect, authorizeRoles('ORGANIZATION', 'ADMIN', 'OWNER'), jobOfferController.deleteJobOffer);
router.patch('/:id/approve', protect, authorizeRoles('FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'), jobOfferController.approveJobOffer);
router.patch('/:id/reject', protect, authorizeRoles('FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'), jobOfferController.rejectJobOffer);

module.exports = router;
