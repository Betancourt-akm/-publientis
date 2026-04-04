const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');
const authToken = require('../middleware/authToken');

// Middleware de autenticación para todas las rutas
router.use(authToken);

// Rutas para owners (crear reservas)
router.post('/', bookingController.createBooking);

// Rutas para walkers (responder reservas)
router.patch('/:id/status', bookingController.updateBookingStatus);
router.patch('/:id/complete', bookingController.completeBooking);

// Rutas para ambos (obtener información)
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);

module.exports = router;
