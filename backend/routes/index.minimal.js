const express = require('express');
const router = express.Router();

// === RUTAS DE AUTENTICACIÓN Y USUARIOS ===
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// === RUTAS DE E-COMMERCE ===
const productRoutes = require('./productRoutes'); // ✅ Productos
const cartRoutes = require('./cartRoutes'); // ✅ Carrito
const orderRoutes = require('./orderRoutes'); // ✅ Órdenes
const categoryRoutes = require('./categoryRoutes'); // ✅ Categorías
const paymentRoutes = require('./paymentRoutes'); // ✅ Pagos

// === RUTAS DE WALKERS (Legacy - Sistema anterior) ===
const publicWalkerRoutes = require('./publicWalker.routes'); 
const walkerDashboardRoutes = require('./walkerDashboard.routes');
const walkerManagementRoutes = require('./walkerManagement.routes');

// === RUTAS DE UTILIDAD ===
const healthRoutes = require('./health.routes');
const testRoutes = require('./test.routes');
const uploadRoutes = require('./uploadRoutes'); // ✅ Upload de imágenes

// --- Montar Enrutadores con sus Prefijos ---
// Nota: El prefijo /api se agrega en index.js principal

// Autenticación
router.use('/auth', authRoutes); // /api/auth

// Usuarios
router.use('/users', userRoutes); // /api/users

// E-commerce
router.use('/products', productRoutes); // /api/products
router.use('/cart', cartRoutes); // /api/cart
router.use('/categories', categoryRoutes); // /api/categories
router.use('/payment', paymentRoutes); // /api/payment
router.use('/', orderRoutes); // /api/orders, /api/admin/orders

// Walkers (Legacy)
router.use('/walkers', publicWalkerRoutes); // /api/walkers
router.use('/walker', walkerDashboardRoutes); // /api/walker
router.use('/admin/walkers', walkerManagementRoutes); // /api/admin/walkers

// Upload de archivos
router.use('/upload', uploadRoutes); // /api/upload

// Utilidades
router.use('/health', healthRoutes); // /api/health
router.use('/test', testRoutes); // /api/test

module.exports = router;
