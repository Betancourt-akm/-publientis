const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} = require('../controller/cartController');
const authToken = require('../middleware/authToken');

// NOTA: El prefijo /cart ya se agrega en index.minimal.js (línea 36)
// Por lo tanto, estas rutas NO deben incluir /cart nuevamente

// Todas las rutas del carrito requieren autenticación
router.use(authToken);

router.get('/', getCart); // GET /api/cart
router.get('/count', getCartCount); // GET /api/cart/count
router.post('/', addToCart); // POST /api/cart
router.put('/', updateCartItem); // PUT /api/cart
router.delete('/:productId', removeFromCart); // DELETE /api/cart/:productId
router.delete('/', clearCart); // DELETE /api/cart

module.exports = router;
