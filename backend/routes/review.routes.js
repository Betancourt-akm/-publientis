const express = require('express');
const router = express.Router();
const { createReview, getReviewsByUser, getReviewsByServiceType, getAverageRating } = require('../controller/reviewController');
const authToken = require('../middleware/authToken');

// Crear una nueva reseña
router.post('/create', authToken, createReview);

// Obtener reseñas de un usuario
router.get('/user/:userId', authToken, getReviewsByUser);

// Obtener reseñas por tipo de servicio
router.get('/service/:serviceType', authToken, getReviewsByServiceType);

// Calcular el promedio de calificaciones de un usuario
router.get('/average/:userId', authToken, getAverageRating);

module.exports = router;
