/**
 * Cron Job para Carritos Abandonados
 * Se ejecuta diariamente para enviar emails de recuperación
 */

const cron = require('node-cron');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const emailService = require('../services/emailService');

/**
 * Buscar carritos abandonados y enviar emails
 * Criterios:
 * - Carrito con items
 * - Última actualización hace más de 24 horas
 * - No se ha enviado email en las últimas 24 horas
 */
const checkAbandonedCarts = async () => {
  try {
    console.log('🔍 Buscando carritos abandonados...');
    
    // Fecha límite: hace 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Buscar carritos con productos, actualizados hace más de 24h
    const abandonedCarts = await Cart.find({
      items: { $exists: true, $ne: [] },
      updatedAt: { $lt: twentyFourHoursAgo },
      // Campo para controlar si ya se envió email
      abandonedEmailSent: { $ne: true },
      // O si se envió, que haya sido hace más de 7 días
      $or: [
        { lastAbandonedEmailSentAt: { $exists: false } },
        { lastAbandonedEmailSentAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    }).populate('userId').populate('items.productId');

    console.log(`📊 Se encontraron ${abandonedCarts.length} carritos abandonados`);
    
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const cart of abandonedCarts) {
      if (!cart.userId || !cart.userId.email) {
        console.log(`⚠️ Carrito ${cart._id} sin usuario o email`);
        continue;
      }

      try {
        // Enviar email de recuperación
        await emailService.sendAbandonedCartEmail(cart, cart.userId);
        
        // Marcar que se envió el email
        cart.abandonedEmailSent = true;
        cart.lastAbandonedEmailSentAt = new Date();
        await cart.save();
        
        emailsSent++;
        console.log(`✅ Email enviado a ${cart.userId.email}`);
      } catch (error) {
        emailsFailed++;
        console.error(`❌ Error enviando email a ${cart.userId.email}:`, error.message);
      }
    }

    console.log(`
      📊 Resumen de Carritos Abandonados:
      - Total encontrados: ${abandonedCarts.length}
      - Emails enviados: ${emailsSent}
      - Emails fallidos: ${emailsFailed}
    `);
    
    return {
      total: abandonedCarts.length,
      sent: emailsSent,
      failed: emailsFailed
    };
  } catch (error) {
    console.error('❌ Error en checkAbandonedCarts:', error);
    throw error;
  }
};

/**
 * Configurar cron job
 * Se ejecuta todos los días a las 10:00 AM
 */
const startAbandonedCartJob = () => {
  // Ejecutar todos los días a las 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Iniciando tarea de carritos abandonados...');
    await checkAbandonedCarts();
  }, {
    scheduled: true,
    timezone: "America/Bogota" // Ajusta según tu zona horaria
  });

  console.log('✅ Cron job de carritos abandonados configurado (diario a las 10:00 AM)');
};

// También exportar la función para poder ejecutarla manualmente
module.exports = {
  startAbandonedCartJob,
  checkAbandonedCarts
};
