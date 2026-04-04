const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updatePaymentStatus,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} = require('../controller/orderController');
const authToken = require('../middleware/authToken');
const { isAdmin } = require('../middleware/roleMiddleware');

// ✅ GUEST CHECKOUT - Crear orden sin autenticación (compra como invitado)
router.post('/orders/guest', createOrder); // Sin authToken - compra sin login

// Rutas de usuario (requieren autenticación)
router.post('/orders', authToken, createOrder); // Orden con usuario logueado
router.get('/orders', authToken, getUserOrders);
router.get('/orders/:id', authToken, getOrderById);
router.post('/orders/:id/cancel', authToken, cancelOrder);

// Rutas de administración
router.get('/admin/orders', authToken, isAdmin, getAllOrders);
router.put('/orders/:id/payment-status', authToken, isAdmin, updatePaymentStatus);
router.put('/orders/:id/order-status', authToken, isAdmin, updateOrderStatus);

// Ruta de prueba para debugging
router.get('/admin/test', authToken, (req, res) => {
  console.log('🧪 TEST ADMIN - Usuario:', req.user ? req.user.email : 'NO USER');
  console.log('🧪 TEST ADMIN - Rol:', req.user ? req.user.role : 'NO ROLE');
  console.log('🧪 TEST ADMIN - Cookies:', req.cookies);
  res.json({
    success: true,
    message: 'Test de autenticación',
    user: req.user ? { email: req.user.email, role: req.user.role } : null,
    cookies: req.cookies
  });
});

module.exports = router;
