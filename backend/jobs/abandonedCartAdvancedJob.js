/**
 * Sistema Avanzado de Carritos Abandonados con Múltiples Etapas
 * Etapa 1: Recordatorio a las 72h
 * Etapa 2: Cupón de incentivo a los 7 días
 */

const cron = require('node-cron');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const emailService = require('../services/emailService');

/**
 * ETAPA 1: Enviar recordatorio a las 72 horas (3 días)
 */
const sendReminder72h = async () => {
  try {
    console.log('🔍 Buscando carritos abandonados de 72h...');
    
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Buscar carritos abandonados hace 72h que NO tienen email de recordatorio
    const abandonedCarts = await Cart.find({
      items: { $exists: true, $ne: [] },
      updatedAt: { 
        $gte: seventyTwoHoursAgo,
        $lte: twentyFourHoursAgo // Entre 24h y 72h
      },
      'abandonmentStages.reminder72h.sent': false
    }).populate('userId').populate('items.productId');

    console.log(`📊 Encontrados ${abandonedCarts.length} carritos para recordatorio de 72h`);
    
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const cart of abandonedCarts) {
      if (!cart.userId || !cart.userId.email) {
        console.log(`⚠️ Carrito ${cart._id} sin usuario o email`);
        continue;
      }

      try {
        // Enviar email de recordatorio simple
        await emailService.sendAbandonedCartEmail(cart, cart.userId);
        
        // Marcar como enviado
        cart.abandonmentStages.reminder72h = {
          sent: true,
          sentAt: new Date(),
          opened: false
        };
        await cart.save();
        
        emailsSent++;
        console.log(`✅ Recordatorio 72h enviado a ${cart.userId.email}`);
      } catch (error) {
        emailsFailed++;
        console.error(`❌ Error enviando recordatorio a ${cart.userId.email}:`, error.message);
      }
    }

    const result = {
      stage: 'reminder_72h',
      total: abandonedCarts.length,
      sent: emailsSent,
      failed: emailsFailed
    };

    console.log(`
      📊 Resumen Etapa 1 (72h):
      - Total encontrados: ${result.total}
      - Emails enviados: ${result.sent}
      - Emails fallidos: ${result.failed}
    `);
    
    return result;
  } catch (error) {
    console.error('❌ Error en sendReminder72h:', error);
    throw error;
  }
};

/**
 * ETAPA 2: Enviar cupón de incentivo a los 7 días
 */
const sendIncentive7d = async () => {
  try {
    console.log('🔍 Buscando carritos abandonados de 7 días...');
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    // Buscar carritos abandonados hace 7 días que NO tienen cupón de incentivo
    const abandonedCarts = await Cart.find({
      items: { $exists: true, $ne: [] },
      updatedAt: { 
        $gte: sevenDaysAgo,
        $lte: sixDaysAgo // Entre 6 y 7 días
      },
      'abandonmentStages.incentive7d.sent': false
    }).populate('userId').populate('items.productId');

    console.log(`📊 Encontrados ${abandonedCarts.length} carritos para incentivo de 7 días`);
    
    let emailsSent = 0;
    let emailsFailed = 0;
    let couponsCreated = 0;

    for (const cart of abandonedCarts) {
      if (!cart.userId || !cart.userId.email) {
        console.log(`⚠️ Carrito ${cart._id} sin usuario o email`);
        continue;
      }

      try {
        // Generar cupón personalizado
        const couponCode = `CART15-${cart.userId._id.toString().slice(-6).toUpperCase()}`;
        
        // Verificar si el cupón ya existe
        let coupon = await Coupon.findOne({ code: couponCode });
        
        if (!coupon) {
          // Crear cupón de 15% de descuento válido por 7 días
          coupon = await Coupon.create({
            code: couponCode,
            description: `15% de descuento especial - Tu carrito te espera`,
            discountType: 'percentage',
            discountValue: 15,
            minPurchaseAmount: 0,
            maxDiscountAmount: 50000, // Máximo $50,000 de descuento
            startDate: new Date(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Válido 7 días
            usageLimit: 1,
            usagePerUser: 1,
            isActive: true
          });
          couponsCreated++;
          console.log(`🎫 Cupón creado: ${couponCode}`);
        }

        // Enviar email con cupón especial
        await sendIncentiveEmail(cart, cart.userId, couponCode);
        
        // Marcar como enviado
        cart.abandonmentStages.incentive7d = {
          sent: true,
          sentAt: new Date(),
          couponCode: couponCode,
          opened: false
        };
        await cart.save();
        
        emailsSent++;
        console.log(`✅ Incentivo 7d enviado a ${cart.userId.email} con cupón ${couponCode}`);
      } catch (error) {
        emailsFailed++;
        console.error(`❌ Error enviando incentivo a ${cart.userId.email}:`, error.message);
      }
    }

    const result = {
      stage: 'incentive_7d',
      total: abandonedCarts.length,
      sent: emailsSent,
      failed: emailsFailed,
      couponsCreated
    };

    console.log(`
      📊 Resumen Etapa 2 (7 días):
      - Total encontrados: ${result.total}
      - Emails enviados: ${result.sent}
      - Emails fallidos: ${result.failed}
      - Cupones creados: ${result.couponsCreated}
    `);
    
    return result;
  } catch (error) {
    console.error('❌ Error en sendIncentive7d:', error);
    throw error;
  }
};

/**
 * Email personalizado para etapa 2 con cupón
 */
const sendIncentiveEmail = async (cart, user, couponCode) => {
  const sendEmail = require('../utils/sendEmail');
  
  // Calcular productos y total
  const productsList = cart.items.slice(0, 3).map(item => `
    <li style="margin-bottom: 10px;">
      <strong>${item.productId?.name || 'Producto'}</strong> x${item.quantity}
      <br>
      <span style="color: #666;">$${(item.price * item.quantity).toLocaleString('es-CO')}</span>
    </li>
  `).join('');

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const moreProducts = cart.items.length > 3 ? `<p style="color: #666;">...y ${cart.items.length - 3} productos más</p>` : '';

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎁 ¡Última Oportunidad!</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">15% de descuento especial solo para ti</p>
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hola <strong>${user.name}</strong>,</p>
                  
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
                    Notamos que dejaste algunos productos en tu carrito hace una semana. 
                    <strong>¡No te preocupes, los guardamos para ti!</strong>
                  </p>

                  <!-- Cupón Destacado -->
                  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
                    <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tu Código Exclusivo</p>
                    <div style="background-color: #ffffff; display: inline-block; padding: 15px 30px; border-radius: 8px; margin: 10px 0;">
                      <p style="font-size: 32px; font-weight: bold; color: #f5576c; margin: 0; letter-spacing: 2px;">${couponCode}</p>
                    </div>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">
                      15% de descuento
                    </p>
                    <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px;">
                      Válido por 7 días • Descuento máximo $50,000
                    </p>
                  </div>

                  <!-- Productos en Carrito -->
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Tu Carrito (${totalItems} productos):</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      ${productsList}
                    </ul>
                    ${moreProducts}
                    <div style="border-top: 2px solid #dee2e6; margin-top: 15px; padding-top: 15px;">
                      <p style="font-size: 18px; font-weight: bold; color: #333; margin: 0;">
                        Total: $${cart.totalPrice.toLocaleString('es-CO')}
                      </p>
                      <p style="font-size: 14px; color: #28a745; margin: 5px 0 0 0; font-weight: bold;">
                        Con cupón: $${Math.round(cart.totalPrice * 0.85).toLocaleString('es-CO')} 
                        <span style="color: #dc3545;">¡Ahorras $${Math.round(cart.totalPrice * 0.15).toLocaleString('es-CO')}!</span>
                      </p>
                    </div>
                  </div>

                  <!-- CTA -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/cart" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                      🛒 Completar Mi Compra
                    </a>
                  </div>

                  <p style="font-size: 14px; color: #666; text-align: center; margin: 20px 0;">
                    ⏰ Este cupón expira en 7 días<br>
                    ¡No dejes pasar esta oportunidad!
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                  <p style="font-size: 12px; color: #666; margin: 0;">
                    Recibiste este email porque dejaste productos en tu carrito.<br>
                    <a href="${process.env.FRONTEND_URL}" style="color: #667eea;">Visitar tienda</a>
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

  await sendEmail({
    to: user.email,
    subject: `🎁 ¡${user.name}, tu cupón del 15% te espera! - Código: ${couponCode}`,
    html: emailContent
  });
};

/**
 * Configurar cron jobs
 */
const startAbandonedCartAdvancedJobs = () => {
  // Job 1: Recordatorio de 72h - Se ejecuta cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Ejecutando job de recordatorio 72h...');
    await sendReminder72h();
  }, {
    scheduled: true,
    timezone: "America/Bogota"
  });

  // Job 2: Incentivo de 7 días - Se ejecuta diariamente a las 11:00 AM
  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ Ejecutando job de incentivo 7 días...');
    await sendIncentive7d();
  }, {
    scheduled: true,
    timezone: "America/Bogota"
  });

  console.log('✅ Jobs avanzados de carritos abandonados configurados:');
  console.log('   - Recordatorio 72h: Cada 6 horas');
  console.log('   - Incentivo 7 días: Diario a las 11:00 AM');
};

/**
 * Ejecutar ambas etapas manualmente (para testing)
 */
const runAllStages = async () => {
  console.log('🚀 Ejecutando todas las etapas...\n');
  
  const results = {
    reminder72h: await sendReminder72h(),
    incentive7d: await sendIncentive7d()
  };
  
  console.log('\n📊 RESUMEN COMPLETO:');
  console.log('Etapa 1 (72h):', results.reminder72h);
  console.log('Etapa 2 (7d):', results.incentive7d);
  
  return results;
};

module.exports = {
  startAbandonedCartAdvancedJobs,
  sendReminder72h,
  sendIncentive7d,
  runAllStages
};
