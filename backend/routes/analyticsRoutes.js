/**
 * Rutas de Analytics y Reportes
 */

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const authToken = require('../middleware/authToken');
const requireAdmin = require('../middleware/adminRole');

// Todas las rutas requieren autenticación de admin
router.use(authToken);
router.use(requireAdmin);

// ==========================================
// KPIS PRINCIPALES
// ==========================================
router.get('/kpis', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      // Default: últimos 30 días
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const kpis = await analyticsService.getMainKPIs(start, end);
      return res.status(200).json(kpis);
    }

    const kpis = await analyticsService.getMainKPIs(
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json(kpis);
  } catch (error) {
    console.error('❌ Error obteniendo KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener KPIs',
      error: error.message
    });
  }
});

// ==========================================
// FUNNEL DE CONVERSIÓN
// ==========================================
router.get('/funnel', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const funnel = await analyticsService.getConversionFunnel(start, end);
      return res.status(200).json(funnel);
    }

    const funnel = await analyticsService.getConversionFunnel(
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json(funnel);
  } catch (error) {
    console.error('❌ Error obteniendo funnel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener funnel de conversión',
      error: error.message
    });
  }
});

// ==========================================
// TOP PRODUCTOS
// ==========================================
router.get('/top-products', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const products = await analyticsService.getTopProducts(start, end, parseInt(limit));
      return res.status(200).json(products);
    }

    const products = await analyticsService.getTopProducts(
      new Date(startDate),
      new Date(endDate),
      parseInt(limit)
    );

    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error obteniendo top productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos más vendidos',
      error: error.message
    });
  }
});

// ==========================================
// ANÁLISIS DE CATEGORÍAS
// ==========================================
router.get('/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const analysis = await analyticsService.getCategoryAnalysis(start, end);
      return res.status(200).json(analysis);
    }

    const analysis = await analyticsService.getCategoryAnalysis(
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json(analysis);
  } catch (error) {
    console.error('❌ Error analizando categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar categorías',
      error: error.message
    });
  }
});

// ==========================================
// MÉTRICAS DE TIEMPO
// ==========================================
router.get('/time-metrics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const metrics = await analyticsService.getTimeBasedMetrics(start, end);
      return res.status(200).json(metrics);
    }

    const metrics = await analyticsService.getTimeBasedMetrics(
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json(metrics);
  } catch (error) {
    console.error('❌ Error obteniendo métricas de tiempo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de tiempo',
      error: error.message
    });
  }
});

// ==========================================
// TASA DE ABANDONO DE CARRITO
// ==========================================
router.get('/cart-abandonment', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const rate = await analyticsService.getCartAbandonmentRate(start, end);
      return res.status(200).json(rate);
    }

    const rate = await analyticsService.getCartAbandonmentRate(
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json(rate);
  } catch (error) {
    console.error('❌ Error calculando abandono de carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular tasa de abandono',
      error: error.message
    });
  }
});

// ==========================================
// DASHBOARD COMPLETO (Todos los datos)
// ==========================================
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start, end;
    if (!startDate || !endDate) {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    // Obtener todos los datos en paralelo
    const [
      kpis,
      funnel,
      topProducts,
      categoryAnalysis,
      timeMetrics,
      cartAbandonment
    ] = await Promise.all([
      analyticsService.getMainKPIs(start, end),
      analyticsService.getConversionFunnel(start, end),
      analyticsService.getTopProducts(start, end, 5),
      analyticsService.getCategoryAnalysis(start, end),
      analyticsService.getTimeBasedMetrics(start, end),
      analyticsService.getCartAbandonmentRate(start, end)
    ]);

    res.status(200).json({
      success: true,
      period: { startDate: start, endDate: end },
      data: {
        kpis: kpis.kpis,
        funnel,
        topProducts,
        categoryAnalysis,
        timeMetrics,
        cartAbandonment
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
});

module.exports = router;
