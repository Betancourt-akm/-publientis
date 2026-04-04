/**
 * Rutas de Recomendaciones de Productos
 */

const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');
const authToken = require('../middleware/authToken');

// ==========================================
// TAMBIÉN COMPRARON
// ==========================================
router.get('/also-bought/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    const recommendations = await recommendationService.getAlsoBought(
      productId,
      parseInt(limit)
    );

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('❌ Error en also-bought:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendaciones',
      error: error.message
    });
  }
});

// ==========================================
// PRODUCTOS SIMILARES
// ==========================================
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    const recommendations = await recommendationService.getSimilarProducts(
      productId,
      parseInt(limit)
    );

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('❌ Error en similar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos similares',
      error: error.message
    });
  }
});

// ==========================================
// VISTO RECIENTEMENTE (Requiere Auth)
// ==========================================
router.get('/recently-viewed', authToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const recommendations = await recommendationService.getRecentlyViewed(
      userId,
      parseInt(limit)
    );

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('❌ Error en recently-viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos vistos',
      error: error.message
    });
  }
});

// ==========================================
// RECOMENDADOS PARA TI (Requiere Auth)
// ==========================================
router.get('/personalized', authToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      parseInt(limit)
    );

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('❌ Error en personalized:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendaciones personalizadas',
      error: error.message
    });
  }
});

// ==========================================
// TRENDING (Público)
// ==========================================
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await recommendationService.getTrendingProducts(
      parseInt(limit)
    );

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('❌ Error en trending:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos trending',
      error: error.message
    });
  }
});

// ==========================================
// DASHBOARD COMPLETO
// Combina múltiples algoritmos
// ==========================================
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { productId } = req.query;

    const dashboard = await recommendationService.getRecommendationsDashboard(
      userId,
      productId
    );

    res.status(200).json(dashboard);
  } catch (error) {
    console.error('❌ Error en dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dashboard de recomendaciones',
      error: error.message
    });
  }
});

// ==========================================
// REGISTRAR VISTA DE PRODUCTO
// ==========================================
router.post('/record-view', authToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { product } = req.body;

    await recommendationService.recordProductView(userId, product);

    res.status(200).json({
      success: true,
      message: 'Vista registrada'
    });
  } catch (error) {
    console.error('❌ Error registrando vista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar vista',
      error: error.message
    });
  }
});

module.exports = router;
