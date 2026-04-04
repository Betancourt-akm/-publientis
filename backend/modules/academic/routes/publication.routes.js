const express = require('express');
const router = express.Router();
const authToken = require('../../../middleware/authToken');
const {
  createPublication,
  getPublicationFeed,
  getPendingPublications,
  approvePublication,
  rejectPublication,
  getMyPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
  toggleLike
} = require('../controllers/publicationController');

// Rutas públicas
router.get('/feed', getPublicationFeed);
router.get('/:id', getPublicationById);

// Rutas autenticadas
router.post('/', authToken, createPublication);
router.get('/user/my', authToken, getMyPublications);
router.put('/:id', authToken, updatePublication);
router.delete('/:id', authToken, deletePublication);
router.post('/:id/like', authToken, toggleLike);

// Rutas de moderación (FACULTY)
router.get('/moderation/pending', authToken, getPendingPublications);
router.put('/:id/approve', authToken, approvePublication);
router.put('/:id/reject', authToken, rejectPublication);

module.exports = router;
