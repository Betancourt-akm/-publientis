const express = require('express');
const router = express.Router();
const { createServiceRequest, getServiceRequestsByStatus, acceptServiceRequest, rejectServiceRequest, cancelServiceRequest, completeServiceRequest } = require('../controller/serviceRequestController');
const authToken = require('../middleware/authToken');

// Crear una nueva solicitud de servicio
router.post('/create', authToken, createServiceRequest);

// Obtener solicitudes de servicio por estado
router.get('/:status?', authToken, getServiceRequestsByStatus);

// Aceptar una solicitud de servicio
router.put('/accept/:requestId', authToken, acceptServiceRequest);

// Rechazar una solicitud de servicio
router.put('/reject/:requestId', authToken, rejectServiceRequest);

// Cancelar una solicitud de servicio
router.put('/cancel/:requestId', authToken, cancelServiceRequest);

// Completar una solicitud de servicio
router.put('/complete/:requestId', authToken, completeServiceRequest);

module.exports = router;
