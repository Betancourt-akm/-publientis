/**
 * Servicio de Alertas de Precio
 * Monitorea cambios de precio y notifica usuarios
 */

const PriceAlert = require('../models/priceAlertModel');
const Product = require('../models/productModel');
const emailService = require('./emailService');

/**
 * Crear alerta de precio
 */
const createPriceAlert = async (userId, productId, targetPrice, userEmail) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Verificar si ya existe una alerta activa
    const existingAlert = await PriceAlert.findOne({
      userId,
      productId,
      status: 'active'
    });

    if (existingAlert) {
      // Actualizar precio objetivo
      existingAlert.targetPrice = targetPrice;
      existingAlert.currentPrice = product.price;
      await existingAlert.save();
      return existingAlert;
    }

    // Crear nueva alerta
    const alert = await PriceAlert.create({
      userId,
      productId,
      targetPrice,
      currentPrice: product.price,
      userEmail,
      productName: product.name,
      productImage: product.images?.[0]
    });

    return alert;
  } catch (error) {
    console.error('❌ Error creando alerta de precio:', error);
    throw error;
  }
};

/**
 * Verificar alertas de precio para un producto
 */
const checkPriceAlerts = async (productId, newPrice) => {
  try {
    const alerts = await PriceAlert.find({
      productId,
      status: 'active'
    }).populate('userId');

    const triggeredAlerts = [];

    for (const alert of alerts) {
      if (alert.shouldTrigger(newPrice)) {
        // Activar alerta
        alert.status = 'triggered';
        alert.notified = true;
        alert.notifiedAt = new Date();
        await alert.save();

        // Enviar email
        await sendPriceAlertEmail(alert, newPrice);
        
        triggeredAlerts.push(alert);
      }
    }

    if (triggeredAlerts.length > 0) {
      console.log(`🔔 ${triggeredAlerts.length} alertas de precio activadas para producto ${productId}`);
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('❌ Error verificando alertas de precio:', error);
    throw error;
  }
};

/**
 * Enviar email de alerta de precio
 */
const sendPriceAlertEmail = async (alert, newPrice) => {
  try {
    const priceDropPercentage = Math.round(
      ((alert.currentPrice - newPrice) / alert.currentPrice) * 100
    );

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔔 ¡Alerta de Precio!</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">El precio bajó</p>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="font-size: 18px; color: #333; margin: 0 0 20px 0; font-weight: bold;">
                      ¡Buenas noticias! El producto que vigilas bajó de precio
                    </p>

                    <!-- Producto -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                      <tr>
                        ${alert.productImage ? `
                          <td width="120" style="padding-right: 20px;">
                            <img src="${alert.productImage}" alt="${alert.productName}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;" />
                          </td>
                        ` : ''}
                        <td style="vertical-align: top;">
                          <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${alert.productName}</h3>
                          
                          <!-- Precios -->
                          <div style="margin: 15px 0;">
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">
                              Precio anterior: 
                              <span style="text-decoration: line-through; color: #999;">
                                $${alert.currentPrice.toLocaleString('es-CO')}
                              </span>
                            </p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #28a745;">
                              Nuevo precio: $${newPrice.toLocaleString('es-CO')}
                            </p>
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">
                              Tu precio objetivo: 
                              <span style="color: #667eea; font-weight: bold;">
                                $${alert.targetPrice.toLocaleString('es-CO')}
                              </span>
                            </p>
                          </div>

                          <!-- Badge de descuento -->
                          <div style="display: inline-block; background-color: #dc3545; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                            ${priceDropPercentage}% OFF
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.FRONTEND_URL}/producto/${alert.productId}" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-size: 16px; font-weight: bold;">
                        Ver Producto
                      </a>
                    </div>

                    <p style="font-size: 14px; color: #666; text-align: center; margin: 20px 0;">
                      ⚡ ¡Aprovecha esta oferta antes de que se acabe!
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <p style="font-size: 12px; color: #666; margin: 0;">
                      Recibiste este email porque configuraste una alerta de precio.<br>
                      Esta alerta ya fue activada y no recibirás más notificaciones para este producto.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await emailService.sendEmail(
      alert.userEmail,
      `🔔 ¡Bajó de precio! ${alert.productName}`,
      emailContent
    );

    console.log(`📧 Email de alerta de precio enviado a ${alert.userEmail}`);
  } catch (error) {
    console.error('❌ Error enviando email de alerta:', error);
  }
};

/**
 * Obtener alertas de un usuario
 */
const getUserAlerts = async (userId) => {
  try {
    const alerts = await PriceAlert.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 });

    return alerts;
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    throw error;
  }
};

/**
 * Cancelar alerta
 */
const cancelAlert = async (alertId, userId) => {
  try {
    const alert = await PriceAlert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      throw new Error('Alerta no encontrada');
    }

    alert.status = 'cancelled';
    await alert.save();

    return alert;
  } catch (error) {
    console.error('❌ Error cancelando alerta:', error);
    throw error;
  }
};

module.exports = {
  createPriceAlert,
  checkPriceAlerts,
  sendPriceAlertEmail,
  getUserAlerts,
  cancelAlert
};
