const express = require('express');
const router = express.Router();
const serviceController = require('../controller/serviceController');
const authToken = require('../middleware/authToken');

// Rutas públicas
router.get('/', serviceController.getAllServiceCards);
router.get('/:id', serviceController.getServiceCardById);

// Rutas protegidas para paseadores
router.use(authToken); // Middleware de autenticación para las rutas siguientes

router.post('/', serviceController.createServiceCard);
router.patch('/:id', serviceController.updateServiceCard);
router.delete('/:id', serviceController.deleteServiceCard);

module.exports = router;
