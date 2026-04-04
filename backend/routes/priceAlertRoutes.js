/**
 * Rutas de Alertas de Precio
 */

const express = require('express');
const router = express.Router();
const priceAlertService = require('../services/priceAlertService');
const authToken = require('../middleware/authToken');

// Todas las rutas requieren autenticación
router.use(authToken);

// ==========================================
// CREAR ALERTA DE PRECIO
// ==========================================
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, targetPrice } = req.body;
    const userEmail = req.user.email;

    if (!productId || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere productId y targetPrice'
      });
    }

    if (targetPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio objetivo debe ser mayor a 0'
      });
    }

    const alert = await priceAlertService.createPriceAlert(
      userId,
      productId,
      targetPrice,
      userEmail
    );

    res.status(201).json({
      success: true,
      message: 'Alerta de precio creada',
      alert
    });
  } catch (error) {
    console.error('❌ Error creando alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear alerta de precio',
      error: error.message
    });
  }
});

// ==========================================
// OBTENER ALERTAS DEL USUARIO
// ==========================================
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const alerts = await priceAlertService.getUserAlerts(userId);

    res.status(200).json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

// ==========================================
// CANCELAR ALERTA
// ==========================================
router.delete('/:alertId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertId } = req.params;

    const alert = await priceAlertService.cancelAlert(alertId, userId);

    res.status(200).json({
      success: true,
      message: 'Alerta cancelada',
      alert
    });
  } catch (error) {
    console.error('❌ Error cancelando alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar alerta',
      error: error.message
    });
  }
});

module.exports = router;
