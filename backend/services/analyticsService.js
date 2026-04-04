/**
 * Servicio de Analytics y KPIs
 * Calcula métricas clave del negocio: Conversión, AOV, CAC, LTV, etc.
 */

const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

/**
 * CALCULAR KPIS PRINCIPALES
 */
const getMainKPIs = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calcular todos los KPIs en paralelo
    const [
      conversionRate,
      aov,
      ltv,
      cac,
      totalRevenue,
      totalOrders,
      newCustomers,
      returningCustomers
    ] = await Promise.all([
      calculateConversionRate(start, end),
      calculateAOV(start, end),
      calculateLTV(start, end),
      calculateCAC(start, end),
      getTotalRevenue(start, end),
      getTotalOrders(start, end),
      getNewCustomers(start, end),
      getReturningCustomers(start, end)
    ]);

    return {
      success: true,
      period: { startDate, endDate },
      kpis: {
        conversionRate,
        aov,
        ltv,
        cac,
        totalRevenue,
        totalOrders,
        newCustomers,
        returningCustomers,
        // KPI derivado: LTV/CAC ratio (saludable si > 3)
        ltvCacRatio: cac > 0 ? (ltv / cac).toFixed(2) : 0
      }
    };
  } catch (error) {
    console.error('❌ Error calculando KPIs:', error);
    throw error;
  }
};

/**
 * TASA DE CONVERSIÓN
 * (Órdenes completadas / Visitantes únicos) * 100
 */
const calculateConversionRate = async (startDate, endDate) => {
  try {
    // Contar órdenes completadas
    const completedOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'Pagado'
    });

    // Contar usuarios que visitaron (crearon carrito o cuenta)
    const visitors = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const rate = visitors > 0 ? (completedOrders / visitors) * 100 : 0;

    return {
      value: parseFloat(rate.toFixed(2)),
      unit: '%',
      completedOrders,
      visitors
    };
  } catch (error) {
    console.error('❌ Error calculando tasa de conversión:', error);
    return { value: 0, unit: '%', completedOrders: 0, visitors: 0 };
  }
};

/**
 * AOV - Average Order Value (Valor Promedio de Orden)
 * Total Revenue / Número de Órdenes
 */
const calculateAOV = async (startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return { value: 0, unit: 'COP', orderCount: 0 };
    }

    const aov = result[0].totalRevenue / result[0].orderCount;

    return {
      value: Math.round(aov),
      unit: 'COP',
      orderCount: result[0].orderCount,
      totalRevenue: result[0].totalRevenue
    };
  } catch (error) {
    console.error('❌ Error calculando AOV:', error);
    return { value: 0, unit: 'COP', orderCount: 0 };
  }
};

/**
 * LTV - Lifetime Value (Valor de Vida del Cliente)
 * Promedio de ingresos totales por cliente
 */
const calculateLTV = async (startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgLTV: { $avg: '$totalSpent' },
          customerCount: { $sum: 1 },
          avgOrdersPerCustomer: { $avg: '$orderCount' }
        }
      }
    ]);

    if (result.length === 0) {
      return { value: 0, unit: 'COP', customerCount: 0 };
    }

    return {
      value: Math.round(result[0].avgLTV),
      unit: 'COP',
      customerCount: result[0].customerCount,
      avgOrdersPerCustomer: parseFloat(result[0].avgOrdersPerCustomer.toFixed(2))
    };
  } catch (error) {
    console.error('❌ Error calculando LTV:', error);
    return { value: 0, unit: 'COP', customerCount: 0 };
  }
};

/**
 * CAC - Customer Acquisition Cost (Costo de Adquisición de Cliente)
 * Para simplificar, usamos un estimado basado en costos operativos
 * En producción, integrar con datos reales de marketing
 */
const calculateCAC = async (startDate, endDate) => {
  try {
    // Contar nuevos clientes en el período
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    if (newCustomers === 0) {
      return { value: 0, unit: 'COP', newCustomers: 0, estimatedMarketingCost: 0 };
    }

    // ESTIMACIÓN SIMPLIFICADA
    // En producción, obtener datos reales de gastos de marketing
    // Por ahora, usamos un estimado de $50,000 COP por cliente
    const estimatedMarketingCost = newCustomers * 50000;
    const cac = estimatedMarketingCost / newCustomers;

    return {
      value: Math.round(cac),
      unit: 'COP',
      newCustomers,
      estimatedMarketingCost,
      note: 'Estimado - Integrar con datos reales de marketing'
    };
  } catch (error) {
    console.error('❌ Error calculando CAC:', error);
    return { value: 0, unit: 'COP', newCustomers: 0 };
  }
};

/**
 * REVENUE TOTAL
 */
const getTotalRevenue = async (startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    return {
      value: result.length > 0 ? result[0].total : 0,
      unit: 'COP'
    };
  } catch (error) {
    console.error('❌ Error obteniendo revenue total:', error);
    return { value: 0, unit: 'COP' };
  }
};

/**
 * TOTAL DE ÓRDENES
 */
const getTotalOrders = async (startDate, endDate) => {
  try {
    const count = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'Pagado'
    });

    return { value: count, unit: 'órdenes' };
  } catch (error) {
    console.error('❌ Error contando órdenes:', error);
    return { value: 0, unit: 'órdenes' };
  }
};

/**
 * NUEVOS CLIENTES
 */
const getNewCustomers = async (startDate, endDate) => {
  try {
    const count = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    return { value: count, unit: 'clientes' };
  } catch (error) {
    console.error('❌ Error contando nuevos clientes:', error);
    return { value: 0, unit: 'clientes' };
  }
};

/**
 * CLIENTES RECURRENTES
 */
const getReturningCustomers = async (startDate, endDate) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: {
          orderCount: { $gt: 1 }
        }
      },
      {
        $count: 'returningCustomers'
      }
    ]);

    return {
      value: result.length > 0 ? result[0].returningCustomers : 0,
      unit: 'clientes'
    };
  } catch (error) {
    console.error('❌ Error contando clientes recurrentes:', error);
    return { value: 0, unit: 'clientes' };
  }
};

/**
 * FUNNEL DE CONVERSIÓN
 * Trackea el journey del usuario desde visita hasta compra
 */
const getConversionFunnel = async (startDate, endDate) => {
  try {
    // Paso 1: Visitantes (usuarios registrados)
    const visitors = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Paso 2: Usuarios que agregaron al carrito
    const usersWithCart = await Cart.countDocuments({
      updatedAt: { $gte: startDate, $lte: endDate },
      items: { $exists: true, $ne: [] }
    });

    // Paso 3: Usuarios que iniciaron checkout (crearon orden)
    const checkoutStarted = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Paso 4: Órdenes completadas (pagadas)
    const ordersCompleted = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'Pagado'
    });

    // Calcular tasas de conversión entre pasos
    const cartRate = visitors > 0 ? (usersWithCart / visitors) * 100 : 0;
    const checkoutRate = usersWithCart > 0 ? (checkoutStarted / usersWithCart) * 100 : 0;
    const completionRate = checkoutStarted > 0 ? (ordersCompleted / checkoutStarted) * 100 : 0;
    const overallRate = visitors > 0 ? (ordersCompleted / visitors) * 100 : 0;

    return {
      success: true,
      funnel: [
        {
          step: 1,
          name: 'Visitantes',
          count: visitors,
          percentage: 100,
          dropOff: 0
        },
        {
          step: 2,
          name: 'Agregaron al Carrito',
          count: usersWithCart,
          percentage: parseFloat(cartRate.toFixed(2)),
          dropOff: parseFloat((100 - cartRate).toFixed(2))
        },
        {
          step: 3,
          name: 'Iniciaron Checkout',
          count: checkoutStarted,
          percentage: parseFloat(checkoutRate.toFixed(2)),
          dropOff: parseFloat((100 - checkoutRate).toFixed(2))
        },
        {
          step: 4,
          name: 'Completaron Compra',
          count: ordersCompleted,
          percentage: parseFloat(completionRate.toFixed(2)),
          dropOff: parseFloat((100 - completionRate).toFixed(2))
        }
      ],
      overallConversionRate: parseFloat(overallRate.toFixed(2))
    };
  } catch (error) {
    console.error('❌ Error calculando funnel de conversión:', error);
    throw error;
  }
};

/**
 * PRODUCTOS MÁS VENDIDOS
 */
const getTopProducts = async (startDate, endDate, limit = 10) => {
  try {
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          category: '$product.category',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    return {
      success: true,
      products: topProducts
    };
  } catch (error) {
    console.error('❌ Error obteniendo top productos:', error);
    throw error;
  }
};

/**
 * ANÁLISIS DE CATEGORÍAS
 */
const getCategoryAnalysis = async (startDate, endDate) => {
  try {
    const categoryStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return {
      success: true,
      categories: categoryStats.map(cat => ({
        category: cat._id,
        revenue: cat.totalRevenue,
        quantity: cat.totalQuantity,
        orders: cat.orderCount
      }))
    };
  } catch (error) {
    console.error('❌ Error analizando categorías:', error);
    throw error;
  }
};

/**
 * MÉTRICAS DE TIEMPO
 * Análisis por hora del día / día de la semana
 */
const getTimeBasedMetrics = async (startDate, endDate) => {
  try {
    const ordersByHour = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const ordersByDayOfWeek = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Pagado'
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return {
      success: true,
      byHour: ordersByHour.map(h => ({
        hour: h._id,
        orders: h.count,
        revenue: h.revenue
      })),
      byDayOfWeek: ordersByDayOfWeek.map(d => ({
        day: d._id,
        dayName: dayNames[d._id - 1],
        orders: d.count,
        revenue: d.revenue
      }))
    };
  } catch (error) {
    console.error('❌ Error obteniendo métricas de tiempo:', error);
    throw error;
  }
};

/**
 * TASA DE ABANDONO DE CARRITO
 */
const getCartAbandonmentRate = async (startDate, endDate) => {
  try {
    const cartsCreated = await Cart.countDocuments({
      updatedAt: { $gte: startDate, $lte: endDate },
      items: { $exists: true, $ne: [] }
    });

    const cartsCompleted = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'Pagado'
    });

    const abandonmentRate = cartsCreated > 0 
      ? ((cartsCreated - cartsCompleted) / cartsCreated) * 100 
      : 0;

    return {
      success: true,
      abandonmentRate: parseFloat(abandonmentRate.toFixed(2)),
      cartsCreated,
      cartsCompleted,
      cartsAbandoned: cartsCreated - cartsCompleted
    };
  } catch (error) {
    console.error('❌ Error calculando abandono de carrito:', error);
    throw error;
  }
};

module.exports = {
  getMainKPIs,
  calculateConversionRate,
  calculateAOV,
  calculateLTV,
  calculateCAC,
  getConversionFunnel,
  getTopProducts,
  getCategoryAnalysis,
  getTimeBasedMetrics,
  getCartAbandonmentRate
};
