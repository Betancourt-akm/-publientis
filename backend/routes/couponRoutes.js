/**
 * Rutas de Cupones y Descuentos
 */

const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCouponByCode,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats
} = require('../controller/couponController');
const authToken = require('../middleware/authToken');
const requireAdmin = require('../middleware/adminRole');

// Rutas públicas (con autenticación opcional)
router.post('/validate', authToken, validateCoupon);
router.get('/code/:code', authToken, getCouponByCode);

// Rutas de administrador
router.use(authToken);
router.use(requireAdmin);

router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/:id/stats', getCouponStats);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
