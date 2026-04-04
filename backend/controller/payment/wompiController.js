// controller/payment/wompiController.js - Controlador de pagos Wompi para Colombia

const Order = require("../../models/orderModel");
const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const emailService = require("../../services/emailService");
const {
  createWompiTransaction,
  getWompiTransaction,
  validateWompiWebhook,
  processWompiTransactionStatus,
  getWompiAcceptanceToken,
  WOMPI_PUBLIC_KEY,
} = require("../../config/wompiConfig");

/**
 * Obtener el token de aceptación de Wompi
 * Este token se usa en el frontend para mostrar el widget de pago
 */
async function getAcceptanceToken(req, res, next) {
  try {
    console.log('🔐 Obteniendo token de aceptación de Wompi...');
    
    const acceptanceToken = await getWompiAcceptanceToken();
    
    console.log('✅ Token de aceptación obtenido exitosamente');
    
    return res.json({
      success: true,
      acceptanceToken,
      publicKey: WOMPI_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("❌ Error obteniendo token de aceptación:", error);
    next(error);
  }
}

/**
 * Crear transacción de pago en Wompi desde una orden existente de MongoDB
 */
async function createWompiOrder(req, res, next) {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "ID de orden requerido"
      });
    }

    // Buscar la orden en la base de datos
    const order = await Order.findById(orderId).populate('userId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Verificar que la orden pertenece al usuario
    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No autorizado"
      });
    }

    console.log('💳 Iniciando creación de transacción Wompi...');
    console.log('📦 Orden MongoDB ID:', order._id);
    console.log('💰 Monto COP:', order.totalPrice);

    // Wompi maneja centavos (ej: $10.000 COP = 1000000 centavos)
    const amountInCents = Math.round(order.totalPrice * 100);
    console.log('💵 Monto en centavos:', amountInCents);

    // Crear la transacción en Wompi
    const transactionData = {
      amountInCents,
      currency: "COP",
      customerEmail: order.userId.email,
      reference: `ORDER-${order._id.toString()}`,
      paymentMethod: paymentMethod || {
        type: "CARD",
        installments: 1,
      },
      redirectUrl: `${process.env.FRONTEND_URL}/payment-success`,
    };

    const wompiTransaction = await createWompiTransaction(transactionData);
    
    console.log('✅ Transacción Wompi creada exitosamente');
    console.log('🆔 Wompi Transaction ID:', wompiTransaction.data.id);
    
    // Guardar el ID de Wompi en la orden
    order.wompiTransactionId = wompiTransaction.data.id;
    order.paymentMethod = 'Wompi';
    await order.save();
    
    console.log('💾 Wompi Transaction ID guardado en MongoDB');

    return res.json({
      success: true,
      transactionId: wompiTransaction.data.id,
      data: wompiTransaction.data,
      checkoutUrl: wompiTransaction.data.payment_link_url,
    });
  } catch (error) {
    console.error("❌ Error creando transacción Wompi:", error);
    next(error);
  }
}

/**
 * Verificar estado de transacción Wompi y actualizar la orden
 */
async function verifyWompiTransaction(req, res, next) {
  try {
    const { transactionId } = req.params;
    
    console.log('🔍 Verificando estado de transacción Wompi...');
    console.log('🆔 Transaction ID:', transactionId);
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false,
        message: "Falta transactionId"
      });
    }

    // Consultar el estado en Wompi
    const transaction = await getWompiTransaction(transactionId);
    
    console.log('✅ Estado de transacción obtenido');
    console.log('📊 Estado:', transaction.status);
    console.log('💳 Referencia:', transaction.reference);

    // Buscar la orden en MongoDB por wompiTransactionId
    const order = await Order.findOne({ wompiTransactionId: transactionId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    console.log('📦 Orden encontrada en MongoDB:', order._id);

    // Procesar el estado de la transacción
    const statusInfo = processWompiTransactionStatus(transaction.status);
    
    // Si el pago fue aprobado, actualizar la orden
    if (statusInfo.success && transaction.status === 'APPROVED') {
      console.log('🔄 Actualizando orden como pagada...');
      
      order.paymentStatus = 'Pagado';
      order.orderStatus = 'Procesando';
      order.transactionId = transactionId;
      order.paidAt = new Date();
      await order.save();
      
      console.log('✅ Orden actualizada en MongoDB');

      // Reducir stock y limpiar carrito
      console.log('🔄 Procesando inventario y limpiando carrito...');
      
      try {
        // Reducir stock de productos
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { 
              stock: -item.quantity,
              salesCount: item.quantity,
            },
          });
          console.log(`📦 Stock reducido para producto ${item.name}: -${item.quantity}`);
        }
        
        // Limpiar carrito del usuario
        const cart = await Cart.findOne({ userId: order.userId });
        if (cart) {
          cart.items = [];
          await cart.save();
          console.log('🛒 Carrito limpiado para usuario:', order.userId);
        }
        
        console.log('✅ Inventario actualizado y carrito limpiado');
      } catch (inventoryError) {
        console.error('❌ Error actualizando inventario:', inventoryError);
      }

      // Enviar email de confirmación
      try {
        const orderWithDetails = await Order.findById(order._id).populate('userId');
        await emailService.sendPaymentConfirmation(orderWithDetails, { 
          reference: transactionId,
          paymentMethod: 'Wompi'
        });
        console.log('📧 Email de confirmación enviado');
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
      }
    }

    return res.json({
      success: statusInfo.success,
      message: statusInfo.message,
      transaction: transaction,
      order: order,
      statusInfo: statusInfo,
    });
  } catch (error) {
    console.error("❌ Error verificando transacción Wompi:", error);
    next(error);
  }
}

/**
 * Webhook para recibir notificaciones de Wompi
 * Wompi envía eventos cuando cambia el estado de una transacción
 */
async function wompiWebhook(req, res, next) {
  try {
    console.log('📨 Webhook recibido de Wompi');
    
    const event = req.body;
    const signature = req.headers['x-wompi-signature'];

    // Validar la firma del webhook
    if (!validateWompiWebhook(event, signature)) {
      console.error('⚠️ Firma de webhook inválida');
      return res.status(401).json({
        success: false,
        message: "Firma inválida"
      });
    }

    console.log('✅ Firma de webhook validada');
    console.log('📊 Evento:', event.event);
    console.log('🆔 Transaction ID:', event.data.transaction.id);

    // Procesar eventos de transacción
    if (event.event === 'transaction.updated') {
      const transaction = event.data.transaction;
      const transactionId = transaction.id;
      
      // Buscar la orden
      const order = await Order.findOne({ wompiTransactionId: transactionId });
      
      if (order) {
        console.log('📦 Orden encontrada:', order._id);
        
        const statusInfo = processWompiTransactionStatus(transaction.status);
        
        // Actualizar según el estado
        if (statusInfo.success && transaction.status === 'APPROVED') {
          order.paymentStatus = 'Pagado';
          order.orderStatus = 'Procesando';
          order.transactionId = transactionId;
          order.paidAt = new Date();
          await order.save();
          
          console.log('✅ Orden actualizada por webhook');
          
          // Procesar inventario si no se ha hecho
          if (order.paymentStatus === 'Pagado') {
            try {
              for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                  $inc: { 
                    stock: -item.quantity,
                    salesCount: item.quantity,
                  },
                });
              }
              
              const cart = await Cart.findOne({ userId: order.userId });
              if (cart) {
                cart.items = [];
                await cart.save();
              }
              
              console.log('✅ Inventario procesado por webhook');
            } catch (error) {
              console.error('❌ Error procesando inventario en webhook:', error);
            }
          }
        } else if (transaction.status === 'DECLINED' || transaction.status === 'VOIDED') {
          order.paymentStatus = 'Rechazado';
          order.orderStatus = 'Cancelado';
          await order.save();
          console.log('⚠️ Orden marcada como rechazada/cancelada');
        }
      } else {
        console.warn('⚠️ Orden no encontrada para transaction:', transactionId);
      }
    }

    // Responder 200 OK a Wompi para confirmar recepción
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error procesando webhook de Wompi:", error);
    // Siempre responder 200 a Wompi para evitar reintentos innecesarios
    return res.status(200).json({ received: true, error: error.message });
  }
}

/**
 * Crear una transacción simple de Wompi
 * Para pagos directos sin orden previa en MongoDB
 */
async function createSimpleTransaction(req, res, next) {
  try {
    const { amount, description, customerEmail } = req.body;

    if (!amount || !customerEmail) {
      return res.status(400).json({ 
        success: false,
        message: "Se requiere amount y customerEmail" 
      });
    }

    console.log("💳 Creando transacción simple Wompi:", {
      amount,
      description
    });

    const amountInCents = Math.round(amount * 100);
    const reference = `SIMPLE-${Date.now()}`;

    const transactionData = {
      amountInCents,
      currency: "COP",
      customerEmail,
      reference,
      paymentMethod: {
        type: "CARD",
        installments: 1,
      },
      redirectUrl: `${process.env.FRONTEND_URL}/payment-success`,
    };

    const wompiTransaction = await createWompiTransaction(transactionData);
    
    console.log("✅ Transacción simple creada exitosamente:", wompiTransaction.data.id);
    
    return res.json({
      success: true,
      transactionId: wompiTransaction.data.id,
      data: wompiTransaction.data,
      checkoutUrl: wompiTransaction.data.payment_link_url,
    });
  } catch (error) {
    console.error("❌ Error al crear transacción simple:", error);
    next(error);
  }
}

module.exports = { 
  getAcceptanceToken,
  createWompiOrder, 
  verifyWompiTransaction,
  wompiWebhook,
  createSimpleTransaction,
};
