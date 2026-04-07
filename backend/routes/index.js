const express = require('express');
const router = express.Router();

// Importar todas las rutas
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./adminRoutes');
const adminVendorRoutes = require('./adminVendorRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const vendorRoutes = require('./vendorRoutes');
const paymentRoutes = require('./paymentRoutes');
const wompiRoutes = require('./wompiRoutes');
const transactionRoutes = require('./transactionRoutes');
const trackingRoutes = require('./trackingRoutes');
const couponRoutes = require('./couponRoutes');
const searchRoutes = require('./searchRoutes');
const reviewRoutes = require('./review.routes');
const productReviewRoutes = require('./productReviewRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const seoRoutes = require('./seoRoutes');
const compareRoutes = require('./compareRoutes');
const priceAlertRoutes = require('./priceAlertRoutes');
const healthRoutes = require('./health.routes');
const uploadRoutes = require('./uploadRoutes');
const debugRoutes = require('./debugRoutes');
const academicRoutes = require('../modules/academic/routes');
const chatRoutes = require('./chat.routes');
const friendsRoutes = require('./friends.routes');
const jobOfferRoutes = require('./jobOfferRoutes');
const jobApplicationRoutes = require('./jobApplicationRoutes');
const academicProgramRoutes = require('./academicProgramRoutes');
const userProfileRoutes = require('./userProfileRoutes');
const applicationChatRoutes = require('./applicationChatRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const notificationRoutes = require('./notificationRoutes');
const favoritesRoutes = require('./favoritesRoutes');
const employabilityStatsRoutes = require('./employabilityStatsRoutes');
const cvRoutes = require('./cvRoutes');
const evaluationRoutes = require('./evaluationRoutes');
const adminStatsRoutes = require('./adminStatsRoutes');
const trackingMatrixRoutes = require('./trackingMatrixRoutes');
const hierarchyRoutes = require('./hierarchyRoutes');

console.log('🛒 Publientis Routes cargadas');

// --- Montar Enrutadores con sus Prefijos ---
// Nota: El prefijo /api se agrega en index.js principal

// Autenticación y Usuarios
router.use('/auth', authRoutes); // Ruta final: /api/auth
router.use('/users', userRoutes); // Ruta final: /api/users
router.use('/admin/vendors', adminVendorRoutes); // Ruta final: /api/admin/vendors
router.use('/admin', adminRoutes); // Ruta final: /api/admin

// E-commerce Routes
router.use('/wishlist', wishlistRoutes); // Ruta final: /api/wishlist
router.use('/products', productRoutes); // Ruta final: /api/products
router.use('/vendors', vendorRoutes); // Ruta final: /api/vendors
router.use('/cart', cartRoutes); // Ruta final: /api/cart
router.use('/orders', orderRoutes); // Ruta final: /api/orders

// Pagos y Transacciones
router.use('/payment', paymentRoutes); // Ruta final: /api/payment (PayPal)
router.use('/wompi', wompiRoutes); // Ruta final: /api/wompi (Wompi - Colombia)
router.use('/transactions', transactionRoutes); // Ruta final: /api/transactions
router.use('/tracking', trackingRoutes); // Ruta final: /api/tracking (PÚBLICO)
router.use('/coupons', couponRoutes); // Ruta final: /api/coupons
router.use('/search', searchRoutes); // Ruta final: /api/search (PÚBLICO)

// Reviews y Calificaciones
router.use('/reviews', reviewRoutes); // Ruta final: /api/reviews
router.use('/product-reviews', productReviewRoutes); // Ruta final: /api/product-reviews
router.use('/analytics', analyticsRoutes); // Ruta final: /api/analytics (Admin)
router.use('/recommendations', recommendationRoutes); // Ruta final: /api/recommendations
router.use('/seo', seoRoutes); // Ruta final: /api/seo (Público)
router.use('/compare', compareRoutes); // Ruta final: /api/compare (Público)
router.use('/price-alerts', priceAlertRoutes); // Ruta final: /api/price-alerts (Auth)
router.use('/health', healthRoutes); // Ruta final: /api/health
router.use('/upload', uploadRoutes); // Ruta final: /api/upload
router.use('/', debugRoutes); // Ruta final: /api/debug

// Academic Module (FIS Connect)
router.use('/academic', academicRoutes); // Ruta final: /api/academic

// Chat peer-to-peer
router.use('/chat', chatRoutes); // Ruta final: /api/chat

// Sistema de amigos
router.use('/friends', friendsRoutes); // Ruta final: /api/friends

// Vinculación Laboral (Publientis Core)
router.use('/jobs', jobOfferRoutes); // Ruta final: /api/jobs
router.use('/job-applications', jobApplicationRoutes); // Ruta final: /api/job-applications

// Programas Académicos y Perfiles Pedagógicos
router.use('/academic-programs', academicProgramRoutes); // Ruta final: /api/academic-programs
router.use('/profile', userProfileRoutes); // Ruta final: /api/profile
router.use('/applications', applicationChatRoutes); // Ruta final: /api/applications (chat integration)

// Suscripciones (Plan PRO para organizaciones)
router.use('/subscriptions', subscriptionRoutes); // Ruta final: /api/subscriptions

// Portafolio Profesional Pedagógico
router.use('/portfolio', portfolioRoutes); // Ruta final: /api/portfolio

// Sistema de Notificaciones Persistentes
router.use('/notifications', notificationRoutes); // Ruta final: /api/notifications

// Sistema de Favoritos/Candidatos Guardados
router.use('/favorites', favoritesRoutes); // Ruta final: /api/favorites

// Estadísticas de Empleabilidad (Faculty/Admin)
router.use('/stats/employability', employabilityStatsRoutes); // Ruta final: /api/stats/employability

// Generador de CV Pedagógico
router.use('/cv', cvRoutes); // Ruta final: /api/cv

// Sistema de Evaluaciones Post-Práctica
router.use('/evaluations', evaluationRoutes); // Ruta final: /api/evaluations

// Estadísticas y Gestión del Admin Panel
router.use('/admin/stats', adminStatsRoutes); // Ruta final: /api/admin/stats

// Matriz de Seguimiento (Dashboard Reactivo)
router.use('/admin/tracking-matrix', trackingMatrixRoutes); // Ruta final: /api/admin/tracking-matrix

// Jerarquía Académica (Universidad → Facultad → Programa)
router.use('/hierarchy', hierarchyRoutes); // Ruta final: /api/hierarchy

console.log('✅ Publientis routes registradas exitosamente.');
console.log('🛒 Productos, Carrito y Órdenes disponibles');
console.log('🎓 Academic module routes disponibles');
console.log('💼 Vinculación laboral (Jobs + Applications) disponible');
console.log('📚 Programas académicos y perfiles pedagógicos disponibles');
console.log('💎 Suscripciones PRO para organizaciones disponibles');
console.log('💬 Chat peer-to-peer disponible');
console.log('👥 Sistema de amigos disponible');
console.log('🔔 Sistema de notificaciones persistentes disponible');
console.log('⭐ Sistema de favoritos/candidatos guardados disponible');
console.log('📊 Estadísticas de empleabilidad disponible');
console.log('📄 Generador automático de CV pedagógico disponible');
console.log('⭐ Sistema de evaluaciones post-práctica disponible');

module.exports = router;
