// routes/wompiRoutes.js - Rutas para pagos con Wompi

const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authToken");
const {
  getAcceptanceToken,
  createWompiOrder,
  verifyWompiTransaction,
  wompiWebhook,
  createSimpleTransaction,
} = require("../controller/payment/wompiController");

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * POST /api/wompi/webhook
 * Webhook para recibir notificaciones de Wompi
 * No requiere autenticación (Wompi envía las notificaciones)
 */
router.post("/webhook", wompiWebhook);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * GET /api/wompi/acceptance-token
 * Obtener token de aceptación de términos de Wompi
 * Este token se usa en el frontend para mostrar el widget de pago
 */
router.get("/acceptance-token", authToken, getAcceptanceToken);

/**
 * POST /api/wompi/create-order
 * Crear una transacción de Wompi desde una orden existente
 * Body: { orderId, paymentMethod }
 */
router.post("/create-order", authToken, createWompiOrder);

/**
 * GET /api/wompi/verify/:transactionId
 * Verificar el estado de una transacción de Wompi
 * Actualiza la orden en MongoDB si el pago fue exitoso
 */
router.get("/verify/:transactionId", authToken, verifyWompiTransaction);

/**
 * POST /api/wompi/create-simple
 * Crear una transacción simple sin orden previa
 * Body: { amount, description, customerEmail }
 * Útil para pagos rápidos o donaciones
 */
router.post("/create-simple", authToken, createSimpleTransaction);

module.exports = router;
