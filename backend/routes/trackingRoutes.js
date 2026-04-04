/**
 * Rutas Públicas de Tracking de Pedidos
 * No requieren autenticación - cualquiera con el número de orden puede rastrear
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const { getTrackingInfo } = require('../services/shippingService');

/**
 * Rastrear pedido por número de orden (público)
 * GET /api/tracking/:orderNumber
 */
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    console.log(`🔍 Consulta de tracking público para orden: ${orderNumber}`);

    // Buscar la orden por número de orden (no por ID)
    const order = await Order.findOne({ orderNumber: orderNumber })
      .select('orderNumber orderStatus paymentStatus trackingNumber shippingAddress items createdAt updatedAt deliveredAt')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada. Verifica el número de orden.'
      });
    }

    // Información básica de la orden (sin datos sensibles)
    const orderInfo = {
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveredAt: order.deliveredAt,
      shippingAddress: {
        city: order.shippingAddress.city,
        // No exponer dirección completa por seguridad
      },
      itemCount: order.items.length
    };

    // Si hay tracking number, obtener info de la transportadora
    let trackingData = null;
    if (order.trackingNumber && order.trackingNumber !== 'null') {
      try {
        const trackingResult = await getTrackingInfo(order.trackingNumber);
        if (trackingResult.success) {
          trackingData = trackingResult.tracking;
        }
      } catch (trackingError) {
        console.error('⚠️ Error obteniendo tracking de transportadora:', trackingError);
        // No fallar la respuesta si el tracking externo falla
      }
    }

    res.status(200).json({
      success: true,
      data: {
        order: orderInfo,
        tracking: trackingData,
        timeline: generateOrderTimeline(order, trackingData)
      }
    });

  } catch (error) {
    console.error('❌ Error en tracking público:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar el estado del pedido',
      error: error.message
    });
  }
});

/**
 * Generar timeline completo del pedido combinando datos de orden y tracking
 */
const generateOrderTimeline = (order, trackingData) => {
  const timeline = [];

  // 1. Pedido Creado
  timeline.push({
    id: 1,
    date: order.createdAt,
    title: 'Pedido Creado',
    description: `Pedido #${order.orderNumber} creado exitosamente`,
    status: 'completed',
    icon: '📝'
  });

  // 2. Pago (si está pagado)
  if (order.paymentStatus === 'Pagado') {
    timeline.push({
      id: 2,
      date: order.updatedAt,
      title: 'Pago Confirmado',
      description: 'Tu pago ha sido procesado correctamente',
      status: 'completed',
      icon: '✅'
    });
  } else {
    timeline.push({
      id: 2,
      date: null,
      title: 'Pago Pendiente',
      description: 'Esperando confirmación de pago',
      status: order.paymentStatus === 'Fallido' ? 'error' : 'pending',
      icon: '⏳'
    });
  }

  // 3. Procesando
  if (['Procesando', 'Enviado', 'Entregado'].includes(order.orderStatus)) {
    timeline.push({
      id: 3,
      date: order.updatedAt,
      title: 'Preparando Pedido',
      description: 'Tu pedido está siendo preparado para envío',
      status: 'completed',
      icon: '📦'
    });
  } else {
    timeline.push({
      id: 3,
      date: null,
      title: 'Preparando Pedido',
      description: 'En espera de preparación',
      status: 'pending',
      icon: '📦'
    });
  }

  // 4. Enviado (con info de tracking si existe)
  if (['Enviado', 'Entregado'].includes(order.orderStatus)) {
    timeline.push({
      id: 4,
      date: order.updatedAt,
      title: 'Pedido Enviado',
      description: order.trackingNumber 
        ? `En camino - Tracking: ${order.trackingNumber}`
        : 'Tu pedido está en camino',
      status: 'completed',
      icon: '🚚',
      trackingNumber: order.trackingNumber
    });

    // Agregar eventos de tracking de la transportadora
    if (trackingData && trackingData.timeline) {
      trackingData.timeline.forEach((event, index) => {
        timeline.push({
          id: `tracking-${index}`,
          date: event.date,
          title: event.status,
          description: `${event.location} - ${event.description}`,
          status: 'completed',
          icon: '📍',
          isTrackingEvent: true
        });
      });
    }
  } else {
    timeline.push({
      id: 4,
      date: null,
      title: 'Envío',
      description: 'Pendiente de envío',
      status: 'pending',
      icon: '🚚'
    });
  }

  // 5. Entregado
  if (order.orderStatus === 'Entregado') {
    timeline.push({
      id: 5,
      date: order.deliveredAt || order.updatedAt,
      title: '¡Entregado!',
      description: 'Tu pedido ha sido entregado exitosamente',
      status: 'completed',
      icon: '🎉'
    });
  } else if (order.orderStatus === 'Cancelado') {
    timeline.push({
      id: 5,
      date: order.updatedAt,
      title: 'Cancelado',
      description: 'El pedido fue cancelado',
      status: 'error',
      icon: '❌'
    });
  } else {
    timeline.push({
      id: 5,
      date: null,
      title: 'Entrega',
      description: 'Pendiente de entrega',
      status: 'pending',
      icon: '🏠'
    });
  }

  // Ordenar por fecha (nulls al final)
  timeline.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  return timeline;
};

/**
 * Endpoint para refrescar tracking de transportadora
 * GET /api/tracking/:orderNumber/refresh
 */
router.get('/:orderNumber/refresh', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber }).select('trackingNumber').lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (!order.trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Esta orden no tiene número de seguimiento asignado'
      });
    }

    // Forzar consulta fresca a la API de la transportadora
    const trackingResult = await getTrackingInfo(order.trackingNumber);

    res.status(200).json({
      success: trackingResult.success,
      data: trackingResult.tracking || null,
      message: trackingResult.success 
        ? 'Información de tracking actualizada' 
        : 'No se pudo obtener información de tracking'
    });

  } catch (error) {
    console.error('❌ Error refrescando tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar información de tracking'
    });
  }
});

module.exports = router;
