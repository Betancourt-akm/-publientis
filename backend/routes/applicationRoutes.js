// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controller/walker/applicationController');
const authToken = require('../middleware/authToken');

// Rutas para aplicaciones de walker
router.post('/apply', authToken, applicationController.apply);
router.get('/pending', authToken, applicationController.listPending);
router.get('/:id', authToken, applicationController.getApplicationDetail);
router.patch('/:id/status', authToken, applicationController.updateApplicationStatus);

module.exports = router;
