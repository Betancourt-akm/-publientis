const express = require('express');
const router = express.Router();
const {
  getVerifiedWalkers,
  getWalkerById,
  searchWalkers
} = require('../controller/walker/publicWalkerController');

/**
 * 🌐 RUTAS PÚBLICAS DE WALKERS
 * 
 * ⚠️  IMPORTANTE: Estas rutas NO requieren autenticación
 * ✅ SOLO sirven datos públicos no sensibles del modelo Walker
 * ❌ NUNCA exponen: address, phone, idDocument, documentos
 * 
 * Propósito: Alimentar la página /paseadores y búsquedas públicas
 */

// 📡 Ruta de prueba para verificar funcionamiento
router.get('/test', (req, res) => {
  res.json({
    message: 'Public Walker API is working!',
    timestamp: new Date().toISOString(),
    version: '2.0',
    endpoints: [
      'GET /verified - Lista de walkers verificados',
      'GET /search - Búsqueda con filtros',
      'GET /:id - Detalle de walker específico'
    ],
    security: 'Solo datos públicos no sensibles'
  });
});

/**
 * GET /api/walkers/verified
 * 📋 Obtiene todos los paseadores verificados y publicados
 * 
 * @route GET /api/walkers/verified
 * @access Public
 * @returns {Object} Lista de walkers públicos (sin datos sensibles)
 * @example
 * {
 *   "success": true,
 *   "data": [...walkers],
 *   "meta": { "total": 5, "timestamp": "..." }
 * }
 */
console.log('🌐 Registrando ruta GET /verified para walkers públicos...');
router.get('/verified', getVerifiedWalkers);

/**
 * GET /api/walkers/search
 * 🔍 Búsqueda avanzada de paseadores con filtros y geolocalización
 * 
 * @route GET /api/walkers/search
 * @access Public
 * @query {string} city - Ciudad
 * @query {string} neighborhood - Barrio
 * @query {string} service - Servicio
 * @query {number} minRating - Rating mínimo (0-5)
 * @query {number} maxDistance - Distancia máxima en km
 * @query {number} lat - Latitud
 * @query {number} lng - Longitud
 * @query {string} petType - Tipo de mascota
 * @query {number} page - Página (default: 1)
 * @query {number} limit - Límite por página (default: 20, max: 50)
 * @returns {Object} Lista filtrada de walkers con paginación
 * @example
 * {
 *   "success": true,
 *   "data": [...walkers],
 *   "pagination": { "page": 1, "total": 10, ... },
 *   "meta": { "searchDuration": "45ms", ... }
 * }
 */
console.log('🔍 Registrando ruta GET /search para búsqueda de walkers...');
router.get('/search', searchWalkers);

/**
 * GET /api/walkers/:id
 * 👤 Obtiene el detalle completo de un paseador específico
 * 
 * @route GET /api/walkers/:id
 * @access Public
 * @param {string} id - ID del walker (ObjectId de MongoDB)
 * @returns {Object} Detalles del walker público (sin datos sensibles)
 * @example
 * {
 *   "success": true,
 *   "data": {
 *     "id": "...",
 *     "fullName": "Juan Pérez",
 *     "city": "Medellín",
 *     "neighborhood": "El Poblado",
 *     "services": [...],
 *     "rating": 4.8,
 *     "availability": {...}
 *   }
 * }
 */
console.log('👤 Registrando ruta GET /:id para detalle de walker...');
router.get('/:id', getWalkerById);

// 📊 Log de resumen de rutas públicas registradas
console.log('✅ Rutas Públicas de Walker registradas exitosamente:');
console.log('   - GET    /test        (Verificación de API)');
console.log('   - GET    /verified    (Lista de walkers verificados)');
console.log('   - GET    /search      (Búsqueda con filtros y geolocalización)');
console.log('   - GET    /:id         (Detalle de walker específico)');
console.log('🔒 SEGURIDAD: Solo datos públicos no sensibles del modelo Walker');

module.exports = router;
