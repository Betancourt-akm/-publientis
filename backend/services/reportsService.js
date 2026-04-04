/**
 * Servicio de Reportes de Ventas
 */

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { Parser } = require('json2csv');

/**
 * Generar reporte de ventas por fecha
 */
const getSalesReport = async (startDate, endDate, groupBy = 'day') => {
  try {
    let dateFormat;
    
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%V';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          orderStatus: { $ne: 'Cancelado' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return {
      success: true,
      period: { start: startDate, end: endDate },
      groupBy: groupBy,
      data: salesData
    };
  } catch (error) {
    console.error('❌ Error en getSalesReport:', error);
    throw error;
  }
};

/**
 * Reporte de ventas por producto
 */
const getProductSalesReport = async (startDate, endDate) => {
  try {
    const productSales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          orderStatus: { $ne: 'Cancelado' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          averagePrice: { $avg: '$items.price' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    return {
      success: true,
      period: { start: startDate, end: endDate },
      data: productSales,
      totalProducts: productSales.length
    };
  } catch (error) {
    console.error('❌ Error en getProductSalesReport:', error);
    throw error;
  }
};

/**
 * Reporte de ventas por categoría
 */
const getCategorySalesReport = async (startDate, endDate) => {
  try {
    // Primero, obtener todas las órdenes del período
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      orderStatus: { $ne: 'Cancelado' }
    }).populate('items.productId');
    
    // Agrupar por categoría manualmente
    const categoryMap = new Map();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId && item.productId.category) {
          const category = item.productId.category;
          
          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              category: category,
              totalQuantity: 0,
              totalRevenue: 0,
              productCount: new Set(),
              orderCount: 0
            });
          }
          
          const catData = categoryMap.get(category);
          catData.totalQuantity += item.quantity;
          catData.totalRevenue += item.price * item.quantity;
          catData.productCount.add(item.productId._id.toString());
          catData.orderCount += 1;
        }
      });
    });
    
    // Convertir a array
    const categorySales = Array.from(categoryMap.values()).map(cat => ({
      category: cat.category,
      totalQuantity: cat.totalQuantity,
      totalRevenue: cat.totalRevenue,
      uniqueProducts: cat.productCount.size,
      orderCount: cat.orderCount
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    return {
      success: true,
      period: { start: startDate, end: endDate },
      data: categorySales,
      totalCategories: categorySales.length
    };
  } catch (error) {
    console.error('❌ Error en getCategorySalesReport:', error);
    throw error;
  }
};

/**
 * Reporte de clientes top
 */
const getTopCustomersReport = async (startDate, endDate, limit = 50) => {
  try {
    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          orderStatus: { $ne: 'Cancelado' }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
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
          orderCount: 1,
          averageOrderValue: 1,
          lastOrderDate: 1
        }
      }
    ]);
    
    return {
      success: true,
      period: { start: startDate, end: endDate },
      data: topCustomers
    };
  } catch (error) {
    console.error('❌ Error en getTopCustomersReport:', error);
    throw error;
  }
};

/**
 * Reporte consolidado de ventas
 */
const getConsolidatedReport = async (startDate, endDate) => {
  try {
    const [salesByDay, productSales, categorySales, topCustomers] = await Promise.all([
      getSalesReport(startDate, endDate, 'day'),
      getProductSalesReport(startDate, endDate),
      getCategorySalesReport(startDate, endDate),
      getTopCustomersReport(startDate, endDate, 10)
    ]);
    
    // Calcular totales
    const totalSales = salesByDay.data.reduce((sum, day) => sum + day.totalSales, 0);
    const totalOrders = salesByDay.data.reduce((sum, day) => sum + day.orderCount, 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    return {
      success: true,
      period: { start: startDate, end: endDate },
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        topProduct: productSales.data[0],
        topCategory: categorySales.data[0],
        topCustomer: topCustomers.data[0]
      },
      salesByDay: salesByDay.data,
      productSales: productSales.data.slice(0, 20),
      categorySales: categorySales.data,
      topCustomers: topCustomers.data
    };
  } catch (error) {
    console.error('❌ Error en getConsolidatedReport:', error);
    throw error;
  }
};

/**
 * Exportar reporte a CSV
 */
const exportReportToCSV = (reportData, reportType) => {
  try {
    let fields, data;
    
    switch (reportType) {
      case 'sales':
        fields = ['_id', 'totalSales', 'orderCount', 'averageOrderValue'];
        data = reportData;
        break;
        
      case 'products':
        fields = ['productName', 'totalQuantity', 'totalRevenue', 'averagePrice', 'orderCount'];
        data = reportData;
        break;
        
      case 'categories':
        fields = ['category', 'totalQuantity', 'totalRevenue', 'uniqueProducts', 'orderCount'];
        data = reportData;
        break;
        
      case 'customers':
        fields = ['name', 'email', 'totalSpent', 'orderCount', 'averageOrderValue'];
        data = reportData;
        break;
        
      default:
        throw new Error('Tipo de reporte no válido');
    }
    
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    return csv;
  } catch (error) {
    console.error('❌ Error exportando CSV:', error);
    throw error;
  }
};

/**
 * Obtener métricas comparativas
 */
const getComparativeMetrics = async (currentStart, currentEnd, previousStart, previousEnd) => {
  try {
    const [currentPeriod, previousPeriod] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentStart),
              $lte: new Date(currentEnd)
            },
            orderStatus: { $ne: 'Cancelado' }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(previousStart),
              $lte: new Date(previousEnd)
            },
            orderStatus: { $ne: 'Cancelado' }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ])
    ]);
    
    const current = currentPeriod[0] || { totalSales: 0, orderCount: 0, averageOrderValue: 0 };
    const previous = previousPeriod[0] || { totalSales: 0, orderCount: 0, averageOrderValue: 0 };
    
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(2);
    };
    
    return {
      success: true,
      current: {
        period: { start: currentStart, end: currentEnd },
        ...current
      },
      previous: {
        period: { start: previousStart, end: previousEnd },
        ...previous
      },
      growth: {
        sales: parseFloat(calculateGrowth(current.totalSales, previous.totalSales)),
        orders: parseFloat(calculateGrowth(current.orderCount, previous.orderCount)),
        averageOrderValue: parseFloat(calculateGrowth(current.averageOrderValue, previous.averageOrderValue))
      }
    };
  } catch (error) {
    console.error('❌ Error en getComparativeMetrics:', error);
    throw error;
  }
};

module.exports = {
  getSalesReport,
  getProductSalesReport,
  getCategorySalesReport,
  getTopCustomersReport,
  getConsolidatedReport,
  exportReportToCSV,
  getComparativeMetrics
};
