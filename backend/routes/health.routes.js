const express = require('express');
const router = express.Router();
const { healthCheck, serverInfo } = require('../controller/health.controller');

// Ruta de health check básica
router.get('/', healthCheck);

// Ruta de información del servidor
router.get('/info', serverInfo);

// Ruta de status simple (solo para verificar que el servidor responde)
router.get('/status', (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
