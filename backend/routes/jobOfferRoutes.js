const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const jobOfferController = require('../controller/jobOfferController');

// --- Rutas públicas ---
router.get('/', jobOfferController.getActiveJobOffers);

// --- Rutas protegidas con paths estáticos (ANTES de /:id) ---
router.post('/', protect, jobOfferController.createJobOffer);

// Ofertas de la organización autenticada
router.get('/my/offers', protect, jobOfferController.getMyJobOffers);

// Aprobación universitaria (FACULTY/DOCENTE/ADMIN)
router.get('/admin/pending', protect, jobOfferController.getPendingApproval);
router.get('/admin/stats', protect, jobOfferController.getJobStats);

// --- Rutas con parámetro dinámico /:id ---
router.get('/:id', jobOfferController.getJobOfferById);
router.put('/:id', protect, jobOfferController.updateJobOffer);
router.delete('/:id', protect, jobOfferController.deleteJobOffer);
router.patch('/:id/approve', protect, jobOfferController.approveJobOffer);
router.patch('/:id/reject', protect, jobOfferController.rejectJobOffer);

module.exports = router;
