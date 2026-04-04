/**
 * Servicio de Notificaciones Push
 * Envía notificaciones web push cuando cambia el estado de la orden
 */

const webpush = require('web-push');

// Configurar VAPID keys (generar con: npx web-push generate-vapid-keys)
// En producción, estas claves deben estar en .env
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'TU_PUBLIC_KEY_AQUI';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'TU_PRIVATE_KEY_AQUI';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@freshface.com';

if (VAPID_PUBLIC_KEY !== 'TU_PUBLIC_KEY_AQUI' && VAPID_PRIVATE_KEY !== 'TU_PRIVATE_KEY_AQUI') {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configurado correctamente');
} else {
  console.warn('⚠️ Web Push NO configurado. Genera las VAPID keys con: npx web-push generate-vapid-keys');
}

/**
 * Modelo de suscripción de notificaciones (ejemplo simple en memoria)
 * En producción, guardar en MongoDB
 */
const subscriptions = new Map(); // userId -> array de subscriptions

/**
 * Guardar suscripción de un usuario
 */
const saveSubscription = (userId, subscription) => {
  if (!subscriptions.has(userId)) {
    subscriptions.set(userId, []);
  }
  
  const userSubs = subscriptions.get(userId);
  
  // Evitar duplicados
  const exists = userSubs.some(sub => 
    sub.endpoint === subscription.endpoint
  );
  
  if (!exists) {
    userSubs.push(subscription);
    console.log(`✅ Suscripción guardada para usuario ${userId}`);
  }
};

/**
 * Obtener suscripciones de un usuario
 */
const getUserSubscriptions = (userId) => {
  return subscriptions.get(userId) || [];
};

/**
 * Eliminar suscripción
 */
const removeSubscription = (userId, endpoint) => {
  if (subscriptions.has(userId)) {
    const userSubs = subscriptions.get(userId);
    const filtered = userSubs.filter(sub => sub.endpoint !== endpoint);
    subscriptions.set(userId, filtered);
    console.log(`🗑️ Suscripción eliminada para usuario ${userId}`);
  }
};

/**
 * Enviar notificación push a un usuario
 */
const sendPushNotification = async (userId, notification) => {
  try {
    const userSubs = getUserSubscriptions(userId);
    
    if (userSubs.length === 0) {
      console.log(`ℹ️ Usuario ${userId} no tiene suscripciones push`);
      return { success: false, message: 'No hay suscripciones' };
    }

    const payload = JSON.stringify(notification);
    const results = [];

    for (const subscription of userSubs) {
      try {
        await webpush.sendNotification(subscription, payload);
        results.push({ success: true, endpoint: subscription.endpoint });
        console.log(`✅ Push enviado a ${subscription.endpoint.substring(0, 50)}...`);
      } catch (error) {
        console.error('❌ Error enviando push:', error);
        
        // Si el endpoint es inválido, eliminarlo
        if (error.statusCode === 410) {
          removeSubscription(userId, subscription.endpoint);
        }
        
        results.push({ success: false, endpoint: subscription.endpoint, error: error.message });
      }
    }

    return {
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  } catch (error) {
    console.error('❌ Error en sendPushNotification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enviar notificación de cambio de estado de orden
 */
const notifyOrderStatusChange = async (order, oldStatus, newStatus) => {
  try {
    // Configuración de notificaciones según el estado
    const statusNotifications = {
      'Procesando': {
        title: '⚙️ Tu pedido está siendo preparado',
        body: `Pedido #${order.orderNumber} está en proceso`,
        icon: '/logo192.png',
        badge: '/badge.png',
        tag: 'order-status',
        data: {
          orderNumber: order.orderNumber,
          status: newStatus,
          url: `/track/${order.orderNumber}`
        }
      },
      'Enviado': {
        title: '🚚 Tu pedido está en camino',
        body: `Pedido #${order.orderNumber} ha sido enviado${order.trackingNumber ? ` - Tracking: ${order.trackingNumber}` : ''}`,
        icon: '/logo192.png',
        badge: '/badge.png',
        tag: 'order-status',
        data: {
          orderNumber: order.orderNumber,
          status: newStatus,
          trackingNumber: order.trackingNumber,
          url: `/track/${order.orderNumber}`
        }
      },
      'Entregado': {
        title: '🎉 ¡Tu pedido ha sido entregado!',
        body: `Pedido #${order.orderNumber} fue entregado exitosamente`,
        icon: '/logo192.png',
        badge: '/badge.png',
        tag: 'order-status',
        data: {
          orderNumber: order.orderNumber,
          status: newStatus,
          url: `/track/${order.orderNumber}`
        },
        actions: [
          {
            action: 'view',
            title: 'Ver Detalles'
          },
          {
            action: 'review',
            title: 'Dejar Reseña'
          }
        ]
      },
      'Cancelado': {
        title: '❌ Pedido cancelado',
        body: `Tu pedido #${order.orderNumber} ha sido cancelado`,
        icon: '/logo192.png',
        badge: '/badge.png',
        tag: 'order-status',
        data: {
          orderNumber: order.orderNumber,
          status: newStatus,
          url: `/track/${order.orderNumber}`
        }
      }
    };

    const notification = statusNotifications[newStatus];
    
    if (!notification) {
      console.log(`ℹ️ No hay notificación configurada para estado: ${newStatus}`);
      return { success: false, message: 'No notification configured' };
    }

    // Enviar notificación al usuario de la orden
    if (!order.userId) {
      console.warn('⚠️ Orden sin userId, no se puede enviar push');
      return { success: false, message: 'No userId in order' };
    }

    const userId = order.userId._id || order.userId;
    const result = await sendPushNotification(userId, notification);

    console.log(`📲 Notificación push enviada para orden #${order.orderNumber}: ${oldStatus} → ${newStatus}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error en notifyOrderStatusChange:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener la clave pública VAPID para el frontend
 */
const getVapidPublicKey = () => {
  return VAPID_PUBLIC_KEY;
};

module.exports = {
  saveSubscription,
  getUserSubscriptions,
  removeSubscription,
  sendPushNotification,
  notifyOrderStatusChange,
  getVapidPublicKey
};
