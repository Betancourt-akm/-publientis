const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { 
  getAllOrders, 
  updatePaymentStatus, 
  updateOrderStatus 
} = require('../controller/orderController');
const { checkAbandonedCarts } = require('../jobs/abandonedCartJob');
const { runAllStages, sendReminder72h, sendIncentive7d } = require('../jobs/abandonedCartAdvancedJob');
const dashboardService = require('../services/dashboardService');
const reportsService = require('../services/reportsService');
const Product = require('../models/productModel');
const authToken = require('../middleware/authToken');
const requireAdmin = require('../middleware/adminRole');

// Middleware de autenticación y verificación de rol de administrador
router.use(authToken);
router.use(requireAdmin);

// Ruta de test para verificar autenticación admin
router.get('/test', (req, res) => {
  console.log('🧪 TEST ADMIN - Usuario:', req.user ? req.user.email : 'NO USER');
  console.log('🧪 TEST ADMIN - Rol:', req.user ? req.user.role : 'NO ROLE');
  res.json({
    success: true,
    message: 'Admin authentication working correctly',
    user: {
      id: req.user?._id,
      email: req.user?.email,
      role: req.user?.role
    },
    timestamp: new Date().toISOString()
  });
});

// Rutas para gestión de órdenes (E-commerce)
router.get('/orders', getAllOrders); // GET /api/admin/orders
router.put('/orders/:id/payment-status', updatePaymentStatus); // PUT /api/admin/orders/:id/payment-status
router.put('/orders/:id/order-status', updateOrderStatus); // PUT /api/admin/orders/:id/order-status

// Rutas para gestión de paseadores
router.get('/walkers/pending', adminController.getPendingWalkers);
router.get('/walkers', adminController.getAllWalkers); // ✅ Nueva ruta para todos los walkers
router.patch('/walkers/:walkerId/approve', adminController.approveWalker);
router.patch('/walkers/:walkerId/reject', adminController.rejectWalker);

// Rutas para estadísticas del sistema
router.get('/stats', adminController.getSystemStats);

// ==========================================
// DASHBOARD - Métricas y Estadísticas
// ==========================================
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const metrics = await dashboardService.getDashboardMetrics(period);
    res.status(200).json(metrics);
  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard/recent-orders', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const orders = await dashboardService.getRecentOrders(parseInt(limit));
    res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Error obteniendo órdenes recientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard/product-metrics', async (req, res) => {
  try {
    const metrics = await dashboardService.getProductMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('❌ Error obteniendo métricas de productos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard/customer-analytics', async (req, res) => {
  try {
    const analytics = await dashboardService.getCustomerAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error('❌ Error obteniendo analytics de clientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// INVENTARIO - Gestión y Alertas
// ==========================================
router.get('/inventory/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const products = await dashboardService.getLowStockProducts(parseInt(threshold));
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos con stock bajo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory/out-of-stock', async (req, res) => {
  try {
    const products = await dashboardService.getOutOfStockProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos sin stock:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/inventory/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body; // [{productId, stock}, ...]
    
    const results = await Promise.all(
      updates.map(async ({ productId, stock }) => {
        try {
          const product = await Product.findByIdAndUpdate(
            productId,
            { stock },
            { new: true }
          );
          return { success: true, productId, product };
        } catch (error) {
          return { success: false, productId, error: error.message };
        }
      })
    );
    
    res.status(200).json({
      success: true,
      message: 'Actualización masiva completada',
      results
    });
  } catch (error) {
    console.error('❌ Error en actualización masiva:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// REPORTES DE VENTAS
// ==========================================
router.get('/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }
    
    const report = await reportsService.getSalesReport(startDate, endDate, groupBy);
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Error generando reporte de ventas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/products', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }
    
    const report = await reportsService.getProductSalesReport(startDate, endDate);
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Error generando reporte de productos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }
    
    const report = await reportsService.getCategorySalesReport(startDate, endDate);
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Error generando reporte de categorías:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/customers', async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }
    
    const report = await reportsService.getTopCustomersReport(startDate, endDate, parseInt(limit));
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Error generando reporte de clientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/consolidated', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }
    
    const report = await reportsService.getConsolidatedReport(startDate, endDate);
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Error generando reporte consolidado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/comparative', async (req, res) => {
  try {
    const { currentStart, currentEnd, previousStart, previousEnd } = req.query;
    
    if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
      return res.status(400).json({
        success: false,
        message: 'Todos los parámetros de fecha son requeridos'
      });
    }
    
    const report = await reportsService.getComparativeMetrics(
      currentStart, currentEnd, previousStart, previousEnd
    );
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Error generando reporte comparativo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CARRITOS ABANDONADOS (Testing)
// ==========================================

// Ejecutar todas las etapas del sistema avanzado
router.post('/abandoned-carts/advanced/run-all', async (req, res) => {
  try {
    console.log('🚀 Ejecución manual de todas las etapas...');
    const results = await runAllStages();
    res.status(200).json({
      success: true,
      message: 'Todas las etapas ejecutadas',
      data: results
    });
  } catch (error) {
    console.error('❌ Error ejecutando etapas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar etapas',
      error: error.message
    });
  }
});

// Ejecutar solo etapa 1: Recordatorio 72h
router.post('/abandoned-carts/advanced/reminder-72h', async (req, res) => {
  try {
    console.log('📧 Ejecutando etapa 1: Recordatorio 72h...');
    const result = await sendReminder72h();
    res.status(200).json({
      success: true,
      message: 'Recordatorio 72h ejecutado',
      data: result
    });
  } catch (error) {
    console.error('❌ Error en recordatorio 72h:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar recordatorio 72h',
      error: error.message
    });
  }
});

// Ejecutar solo etapa 2: Incentivo 7 días
router.post('/abandoned-carts/advanced/incentive-7d', async (req, res) => {
  try {
    console.log('🎁 Ejecutando etapa 2: Incentivo 7 días...');
    const result = await sendIncentive7d();
    res.status(200).json({
      success: true,
      message: 'Incentivo 7 días ejecutado',
      data: result
    });
  } catch (error) {
    console.error('❌ Error en incentivo 7 días:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar incentivo 7 días',
      error: error.message
    });
  }
});

// Sistema básico (mantener por compatibilidad)
router.post('/abandoned-carts/check', async (req, res) => {
  try {
    console.log('🔍 Ejecución manual de tarea básica de carritos abandonados...');
    const result = await checkAbandonedCarts();
    res.status(200).json({
      success: true,
      message: 'Tarea básica de carritos abandonados ejecutada',
      data: result
    });
  } catch (error) {
    console.error('❌ Error en tarea manual de carritos abandonados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar tarea de carritos abandonados',
      error: error.message
    });
  }
});

module.exports = router;
