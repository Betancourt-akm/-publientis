/**
 * Rutas de Reviews de Productos
 */

const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  voteReview,
  removeVote,
  respondToReview,
  editSellerResponse,
  flagReview,
  moderateReview,
  getPendingReviews,
  canUserReview
} = require('../controller/productReviewController');
const authToken = require('../middleware/authToken');
const requireAdmin = require('../middleware/adminRole');

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

// Obtener reviews de un producto
router.get('/product/:productId', getProductReviews);

// ==========================================
// RUTAS DE USUARIO (requieren autenticación)
// ==========================================

// Verificar si puede reviewar
router.get('/can-review/:productId', authToken, canUserReview);

// Crear review
router.post('/', authToken, createReview);

// Votar en un review
router.post('/:reviewId/vote', authToken, voteReview);

// Remover voto
router.delete('/:reviewId/vote', authToken, removeVote);

// Reportar review
router.post('/:reviewId/flag', authToken, flagReview);

// ==========================================
// RUTAS DE VENDEDOR/ADMIN (requieren autenticación y admin)
// ==========================================

// Responder a un review
router.post('/:reviewId/respond', authToken, requireAdmin, respondToReview);

// Editar respuesta
router.put('/:reviewId/respond', authToken, requireAdmin, editSellerResponse);

// Moderar review
router.patch('/:reviewId/moderate', authToken, requireAdmin, moderateReview);

// Obtener reviews pendientes de moderación
router.get('/admin/pending', authToken, requireAdmin, getPendingReviews);

module.exports = router;
