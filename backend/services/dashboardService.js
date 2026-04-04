/**
 * Servicio de Dashboard - Métricas y Estadísticas del Admin
 */

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

/**
 * Obtener métricas generales del dashboard
 */
const getDashboardMetrics = async (dateRange = 'month') => {
  try {
    const now = new Date();
    let startDate;

    // Definir rango de fechas
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // 1. Métricas de Ventas
    const ordersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Entregado'] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$orderStatus', ['Pendiente', 'Procesando']] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelado'] }, 1, 0] }
          },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const sales = ordersData[0] || {
      totalSales: 0,
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0
    };

    // 2. Comparación con periodo anterior
    const previousPeriodStart = new Date(startDate);
    const periodDiff = now - startDate;
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDiff);

    const previousSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const previousTotal = previousSales[0]?.totalSales || 0;
    const salesGrowth = previousTotal > 0 
      ? ((sales.totalSales - previousTotal) / previousTotal * 100).toFixed(2)
      : 100;

    // 3. Productos
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // 4. Usuarios
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newUsersThisPeriod = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate }
    });

    // 5. Top Productos Vendidos
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'Cancelado' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // 6. Ventas por Día (últimos 30 días)
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 7. Ventas por Estado
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    return {
      success: true,
      data: {
        // Métricas principales
        sales: {
          total: sales.totalSales,
          growth: parseFloat(salesGrowth),
          orders: sales.totalOrders,
          averageOrderValue: sales.averageOrderValue,
          completed: sales.completedOrders,
          pending: sales.pendingOrders,
          cancelled: sales.cancelledOrders
        },
        
        // Productos
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        
        // Usuarios
        users: {
          total: totalUsers,
          newThisPeriod: newUsersThisPeriod
        },
        
        // Charts data
        topProducts: topProducts,
        dailySales: dailySales,
        ordersByStatus: ordersByStatus,
        
        // Metadata
        period: dateRange,
        startDate: startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    console.error('❌ Error en getDashboardMetrics:', error);
    throw error;
  }
};

/**
 * Obtener productos con stock bajo
 */
const getLowStockProducts = async (threshold = 10) => {
  try {
    const products = await Product.find({
      stock: { $lte: threshold, $gt: 0 }
    })
      .select('name stock price category images')
      .sort({ stock: 1 })
      .limit(20);

    return {
      success: true,
      data: products,
      count: products.length
    };
  } catch (error) {
    console.error('❌ Error en getLowStockProducts:', error);
    throw error;
  }
};

/**
 * Obtener productos sin stock
 */
const getOutOfStockProducts = async () => {
  try {
    const products = await Product.find({ stock: 0 })
      .select('name category price images updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20);

    return {
      success: true,
      data: products,
      count: products.length
    };
  } catch (error) {
    console.error('❌ Error en getOutOfStockProducts:', error);
    throw error;
  }
};

/**
 * Obtener órdenes recientes
 */
const getRecentOrders = async (limit = 10) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .select('orderNumber totalAmount orderStatus paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    return {
      success: true,
      data: orders
    };
  } catch (error) {
    console.error('❌ Error en getRecentOrders:', error);
    throw error;
  }
};

/**
 * Obtener métricas de productos
 */
const getProductMetrics = async () => {
  try {
    // Total por categoría
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Productos más valorados
    const topRatedProducts = await Product.find({ rating: { $gte: 4.5 } })
      .select('name price rating reviewCount images')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10);

    return {
      success: true,
      data: {
        byCategory: productsByCategory,
        topRated: topRatedProducts
      }
    };
  } catch (error) {
    console.error('❌ Error en getProductMetrics:', error);
    throw error;
  }
};

/**
 * Obtener análisis de clientes
 */
const getCustomerAnalytics = async () => {
  try {
    // Top clientes por gasto total
    const topCustomers = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'Cancelado' }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    return {
      success: true,
      data: {
        topCustomers
      }
    };
  } catch (error) {
    console.error('❌ Error en getCustomerAnalytics:', error);
    throw error;
  }
};

module.exports = {
  getDashboardMetrics,
  getLowStockProducts,
  getOutOfStockProducts,
  getRecentOrders,
  getProductMetrics,
  getCustomerAnalytics
};
