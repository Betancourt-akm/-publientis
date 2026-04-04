/**
 * Servicio de Notificaciones por Email
 * Sistema completo de emails para e-commerce
 */

const sendEmail = require('../utils/sendEmail');
const { formatPrice, getDeliveryDateRange, baseStyles } = require('../utils/emailTemplates');

// =========================================
// 1. CONFIRMACIÓN DE ORDEN CREADA
// =========================================
const sendOrderConfirmation = async (order, user) => {
  try {
    const itemsHTML = order.items.map(item => `
      <div style="border-bottom: 1px solid #e0e0e0; padding: 15px 0;">
        <div style="display: flex; justify-content: space-between;">
          <div><strong>${item.name}</strong><br><span style="color: #666;">Cantidad: ${item.quantity}</span></div>
          <div style="font-weight: bold; color: #667eea;">${formatPrice(item.price * item.quantity)}</div>
        </div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${baseStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div style="font-size: 48px; margin: 20px 0;">📦</div>
            <h1>¡Pedido Confirmado!</h1>
          </div>
          <div class="content">
            <p class="greeting">Hola ${user.name || order.shippingAddress.fullName},</p>
            <p>¡Gracias por tu pedido! Lo estamos procesando.</p>
            
            <div class="order-box">
              <div style="color: #666;">Número de Pedido</div>
              <div class="order-number">#${order.orderNumber}</div>
              <div style="color: #666; margin-top: 10px;">Fecha: ${new Date(order.createdAt).toLocaleDateString('es-CO')}</div>
            </div>

            <h3>Productos:</h3>
            <div style="border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px;">
              ${itemsHTML}
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; margin-top: 20px; border-radius: 5px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Subtotal:</span><span>${formatPrice(order.subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Envío:</span><span>${order.shippingCost === 0 ? 'GRATIS' : formatPrice(order.shippingCost)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>IVA (19%):</span><span>${formatPrice(order.tax)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px; border-top: 2px solid #667eea; font-size: 20px; font-weight: bold; color: #667eea;">
                <span>Total:</span><span>${formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/mis-pedidos/${order._id}" class="button">Ver Estado del Pedido</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>FreshFace E-commerce</strong></p>
            <p>¿Necesitas ayuda? <a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: order.shippingAddress.email || user.email,
      subject: `Confirmación de Pedido #${order.orderNumber}`,
      html
    });

    console.log(`✅ Email de confirmación enviado para orden #${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando confirmación de orden:', error);
    return { success: false, error: error.message };
  }
};

// =========================================
// 2. CONFIRMACIÓN DE PAGO RECIBIDO
// =========================================
const sendPaymentConfirmation = async (order, transaction) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="email-container">
          <div class="header">
            <div style="font-size: 48px; margin: 20px 0;">✅</div>
            <h1>¡Pago Confirmado!</h1>
          </div>
          <div class="content">
            <p class="greeting">¡Excelente noticia!</p>
            <p>Hemos recibido tu pago. Tu pedido ahora está siendo preparado.</p>
            
            <div class="order-box">
              <div style="color: #666;">Número de Pedido</div>
              <div class="order-number">#${order.orderNumber}</div>
              <div style="margin-top: 15px;"><strong style="color: #28a745;">Estado: ✅ Pagado</strong></div>
              ${transaction ? `<div style="margin-top: 10px; font-size: 14px; color: #666;">ID: ${transaction.reference || order.transactionId}</div>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 16px; color: #666;">Monto Pagado</div>
              <div style="font-size: 36px; font-weight: bold; color: #28a745; margin-top: 10px;">${formatPrice(order.totalPrice)}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/mis-pedidos/${order._id}" class="button">Rastrear Mi Pedido</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>FreshFace E-commerce</strong></p>
            <p>Gracias por tu compra</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: order.shippingAddress.email || order.userId.email,
      subject: `Pago Confirmado - Pedido #${order.orderNumber}`,
      html
    });

    console.log(`✅ Email de pago confirmado enviado para orden #${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando confirmación de pago:', error);
    return { success: false, error: error.message };
  }
};

// =========================================
// 3. NOTIFICACIÓN DE ENVÍO CON TRACKING
// =========================================
const sendShippingNotification = async (order) => {
  try {
    const trackingSection = order.trackingNumber ? `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #856404;">📍 Número de Seguimiento</h3>
        <div style="font-size: 20px; font-weight: bold; color: #856404; letter-spacing: 2px;">${order.trackingNumber}</div>
        <p style="margin: 15px 0 0 0; font-size: 14px;">Usa este número para rastrear tu paquete</p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastreo-y-cotizaciones/rastreo-de-envios/" 
           style="display: inline-block; padding: 15px 30px; background-color: #ffc107; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">
          🔍 Rastrear Paquete
        </a>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="email-container">
          <div class="header">
            <div style="font-size: 48px; margin: 20px 0;">🚚</div>
            <h1>¡Tu Pedido Va en Camino!</h1>
          </div>
          <div class="content">
            <p class="greeting">¡Buenas noticias ${order.shippingAddress.fullName}!</p>
            <p>Tu pedido ha sido enviado y está en camino.</p>
            
            <div class="order-box">
              <div style="color: #666;">Número de Pedido</div>
              <div class="order-number">#${order.orderNumber}</div>
              <div style="margin-top: 15px;"><strong style="color: #17a2b8;">Estado: 🚚 Enviado</strong></div>
            </div>

            ${trackingSection}

            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #0066cc;">
              <h3 style="margin: 0 0 10px 0; color: #0066cc;">⏰ Tiempo Estimado de Entrega</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold;">3-5 días hábiles</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Entre ${getDeliveryDateRange()}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/mis-pedidos/${order._id}" class="button">Ver Mi Pedido</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>FreshFace E-commerce</strong></p>
            <p>¿Preguntas? <a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: order.shippingAddress.email || order.userId.email,
      subject: `Tu pedido #${order.orderNumber} está en camino`,
      html
    });

    console.log(`✅ Email de envío enviado para orden #${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando notificación de envío:', error);
    return { success: false, error: error.message };
  }
};

// =========================================
// 4. PEDIDO ENTREGADO
// =========================================
const sendDeliveryConfirmation = async (order) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="email-container">
          <div class="header">
            <div style="font-size: 48px; margin: 20px 0;">🎉</div>
            <h1>¡Pedido Entregado!</h1>
          </div>
          <div class="content">
            <p class="greeting">¡Hola ${order.shippingAddress.fullName}!</p>
            <p style="font-size: 18px; color: #28a745; font-weight: bold;">✅ Tu pedido ha sido entregado exitosamente</p>
            
            <div class="order-box">
              <div style="color: #666;">Número de Pedido</div>
              <div class="order-number">#${order.orderNumber}</div>
              <div style="margin-top: 15px;"><strong style="color: #28a745;">Estado: ✅ Entregado</strong></div>
              <div style="margin-top: 10px; font-size: 14px; color: #666;">Fecha: ${new Date(order.deliveredAt || Date.now()).toLocaleString('es-CO')}</div>
            </div>

            <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
              <h2 style="margin: 0 0 15px 0;">¡Gracias por tu Compra!</h2>
              <p style="margin: 0;">Esperamos que disfrutes tu producto</p>
            </div>

            <div style="background-color: #fff3cd; padding: 25px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #856404;">⭐ ¿Qué te pareció?</h3>
              <p style="margin: 0 0 20px 0; color: #856404;">Tu opinión ayuda a otros compradores</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/mis-pedidos/${order._id}?review=true" 
                   style="display: inline-block; padding: 12px 30px; background-color: #ffc107; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  ⭐ Dejar una Reseña
                </a>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/productos" class="button">Continuar Comprando</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>FreshFace E-commerce</strong></p>
            <p>Gracias por confiar en nosotros</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: order.shippingAddress.email || order.userId.email,
      subject: `¡Tu pedido #${order.orderNumber} ha sido entregado!`,
      html
    });

    console.log(`✅ Email de entrega enviado para orden #${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando confirmación de entrega:', error);
    return { success: false, error: error.message };
  }
};

// =========================================
// 5. RECUPERACIÓN DE CARRITO ABANDONADO
// =========================================
const sendAbandonedCartEmail = async (cart, user) => {
  try {
    const itemsHTML = cart.items.slice(0, 3).map(item => `
      <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
        <img src="${item.productId.images[0]}" alt="${item.productId.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
        <div style="flex: 1;">
          <strong>${item.productId.name}</strong><br>
          <span style="color: #666; font-size: 14px;">Cantidad: ${item.quantity}</span><br>
          <span style="color: #667eea; font-weight: bold;">${formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="email-container">
          <div class="header">
            <div style="font-size: 48px; margin: 20px 0;">🛒</div>
            <h1>¡Dejaste algo en tu Carrito!</h1>
          </div>
          <div class="content">
            <p class="greeting">Hola ${user.name || 'Cliente'},</p>
            <p>Notamos que dejaste productos en tu carrito. <strong>¡Te están esperando!</strong></p>

            <div style="border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0;">Tu Carrito:</h3>
              ${itemsHTML}
              ${cart.items.length > 3 ? `<p style="text-align: center; color: #666; margin-top: 15px;">+ ${cart.items.length - 3} producto(s) más</p>` : ''}
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <div style="color: #666; font-size: 14px;">Total del Carrito</div>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; margin-top: 10px;">${formatPrice(cart.totalPrice)}</div>
              ${cart.totalPrice < 100000 ? 
                `<div style="margin-top: 10px; color: #28a745; font-weight: bold;">💚 ¡Agrega ${formatPrice(100000 - cart.totalPrice)} más para envío GRATIS!</div>` :
                `<div style="margin-top: 10px; color: #28a745; font-weight: bold;">✅ ¡Envío GRATIS incluido!</div>`
              }
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin: 30px 0;">
              <h2 style="margin: 0 0 10px 0;">🎁 Oferta Especial</h2>
              <p style="margin: 0 0 20px 0; font-size: 18px;"><strong>¡10% de descuento hoy!</strong></p>
              <p style="margin: 0; font-size: 14px;">Código: <strong style="background-color: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 3px;">CARRITO10</strong></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/cart" class="button" style="font-size: 18px; padding: 18px 40px;">🛒 Completar Mi Compra</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>FreshFace E-commerce</strong></p>
            <p>Este código expira en 24 horas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: '🛒 ¡Dejaste productos en tu carrito! + 10% descuento',
      html
    });

    console.log(`✅ Email de carrito abandonado enviado a ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de carrito abandonado:', error);
    return { success: false, error: error.message };
  }
};

// =========================================
// 6. CAMBIO DE ESTADO DE ORDEN
// =========================================
const sendOrderStatusChange = async (order, oldStatus, newStatus) => {
  try {
    const statusConfig = {
      'Procesando': { emoji: '⚙️', color: '#17a2b8', message: 'está siendo procesado' },
      'Enviado': { emoji: '🚚', color: '#ffc107', message: 'ha sido enviado' },
      'Entregado': { emoji: '✅', color: '#28a745', message: 'ha sido entregado' },
      'Cancelado': { emoji: '❌', color: '#dc3545', message: 'ha sido cancelado' }
    };

    const config = statusConfig[newStatus] || { emoji: '📦', color: '#667eea', message: 'ha cambiado de estado' };

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="email-container">
          <div class="header">
            <div style="font-size: 48px; margin: 20px 0;">${config.emoji}</div>
            <h1>Actualización de Pedido</h1>
          </div>
          <div class="content">
            <p class="greeting">Hola ${order.shippingAddress.fullName},</p>
            <p>Tu pedido <strong>#${order.orderNumber}</strong> ${config.message}.</p>
            
            <div style="background-color: ${config.color}22; border-left: 4px solid ${config.color}; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <div style="font-size: 14px; color: #666;">Estado del Pedido</div>
              <div style="font-size: 24px; font-weight: bold; color: ${config.color}; margin-top: 10px;">
                ${config.emoji} ${newStatus}
              </div>
              <div style="font-size: 14px; color: #666; margin-top: 10px;">
                Estado anterior: ${oldStatus}
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/mis-pedidos/${order._id}" class="button">Ver Detalles del Pedido</a>
            </div>

            ${newStatus === 'Cancelado' && order.cancelReason ? `
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0;">
                <strong>Motivo de cancelación:</strong><br>${order.cancelReason}
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p><strong>FreshFace E-commerce</strong></p>
            <p>¿Preguntas? <a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: order.shippingAddress.email || order.userId.email,
      subject: `Actualización de tu pedido #${order.orderNumber} - ${newStatus}`,
      html
    });

    console.log(`✅ Email de cambio de estado enviado para orden #${order.orderNumber}: ${oldStatus} → ${newStatus}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de cambio de estado:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendShippingNotification,
  sendDeliveryConfirmation,
  sendAbandonedCartEmail,
  sendOrderStatusChange
};
