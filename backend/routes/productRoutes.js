const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getCategories,
  getBrands,
} = require('../controller/productController');
const authToken = require('../middleware/authToken');
const { isAdmin } = require('../middleware/roleMiddleware');

// NOTA: El prefijo /products ya se agrega en index.minimal.js (línea 35)
// Por lo tanto, estas rutas NO deben incluir /products nuevamente

// Rutas públicas
router.get('/', getAllProducts); // GET /api/products
router.get('/featured', getFeaturedProducts); // GET /api/products/featured
router.get('/categories', getCategories); // GET /api/products/categories
router.get('/brands', getBrands); // GET /api/products/brands
router.get('/:id', getProductById); // GET /api/products/:id

// Rutas de administración (requieren autenticación y rol admin)
router.post('/', authToken, isAdmin, createProduct); // POST /api/products
router.put('/:id', authToken, isAdmin, updateProduct); // PUT /api/products/:id
router.delete('/:id', authToken, isAdmin, deleteProduct); // DELETE /api/products/:id

module.exports = router;
