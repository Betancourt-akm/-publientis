// controller/payment/paymentController.js

const fetch = require("node-fetch");
const Order = require("../../models/orderModel");
const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const emailService = require("../../services/emailService");
require("dotenv").config();

// Usar las variables correctas del .env
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_API_CLIENT;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_API_SECRET;
const base = "https://api-m.sandbox.paypal.com"; // Sandbox - Cambiar a "https://api-m.paypal.com" en producción

/**
 * Maneja la respuesta de PayPal.
 */
async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }
  const errorMessage = await response.text();
  throw new Error(errorMessage);
}

/**
 * Genera el token de acceso para las peticiones a PayPal.
 */
async function generateAccessToken() {
  console.log('🔐 Generando token de acceso PayPal...');
  console.log('📍 API URL:', base);
  console.log('🔑 Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : 'NO CONFIGURADO');
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  });

  const token = await handleResponse(response).then((jsonData) => jsonData.access_token);
  console.log('✅ Token de PayPal obtenido exitosamente');
  return token;
}

/**
 * Crea una orden de pago en PayPal desde una orden existente de MongoDB
 */
async function createPayPalOrder(req, res, next) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "ID de orden requerido"
      });
    }

    // Buscar la orden en la base de datos
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Verificar que la orden pertenece al usuario
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No autorizado"
      });
    }

    console.log('💳 Iniciando creación de orden PayPal...');
    console.log('📦 Orden MongoDB ID:', order._id);
    console.log('💰 Monto COP:', order.totalPrice);
    
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    // Convertir COP a USD (tasa aproximada: 1 USD = 4000 COP)
    const amountUSD = (order.totalPrice / 4000).toFixed(2);
    console.log('💵 Monto USD:', amountUSD);

    // Construcción de la orden de PayPal
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order._id.toString(),
            description: `Orden #${order._id.toString().slice(-8)} - FreshFace`,
            amount: {
              currency_code: "USD",
              value: amountUSD
            }
          }
        ],
        application_context: {
          brand_name: "FreshFace",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/cancel-order`
        }
      }),
    });

    const paypalOrder = await handleResponse(response);
    
    console.log('✅ Orden PayPal creada exitosamente');
    console.log('🆔 PayPal Order ID:', paypalOrder.id);
    console.log('🔗 Links de aprobación:', paypalOrder.links);
    
    // Guardar el ID de PayPal en la orden
    order.paypalOrderId = paypalOrder.id;
    await order.save();
    
    console.log('💾 PayPal Order ID guardado en MongoDB');

    return res.json({
      success: true,
      id: paypalOrder.id,
      data: paypalOrder
    });
  } catch (error) {
    console.error("Error creando orden PayPal:", error);
    next(error);
  }
}

/**
 * Captura un pago existente en PayPal y actualiza la orden
 */
async function capturePayPalOrder(req, res, next) {
  try {
    const { orderID } = req.body;
    
    console.log('💸 Iniciando captura de pago PayPal...');
    console.log('🆔 PayPal Order ID a capturar:', orderID);
    
    if (!orderID) {
      return res.status(400).json({ 
        success: false,
        message: "Falta orderID de PayPal"
      });
    }

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;
    console.log('📍 URL de captura:', url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await handleResponse(response);
    
    console.log('✅ Pago capturado exitosamente en PayPal');
    console.log('💳 Transaction ID:', captureData.id);
    console.log('📊 Estado de captura:', captureData.status);

    // Buscar la orden en MongoDB por paypalOrderId
    const order = await Order.findOne({ paypalOrderId: orderID });
    
    if (order) {
      console.log('📦 Orden encontrada en MongoDB:', order._id);
      console.log('🔄 Actualizando estado de la orden...');
      
      // Actualizar estado de pago
      order.paymentStatus = 'Pagado';
      order.orderStatus = 'Procesando';
      order.transactionId = captureData.id;
      order.paidAt = new Date();
      await order.save();
      
      console.log('✅ Orden actualizada en MongoDB');
      console.log('📄 Estado de pago:', order.paymentStatus);
      console.log('📄 Estado de orden:', order.orderStatus);

      // 🎯 AHORA SÍ: Reducir stock y limpiar carrito después del pago exitoso
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
        
        console.log('✅ Inventario actualizado y carrito limpiado exitosamente');
      } catch (inventoryError) {
        console.error('❌ Error actualizando inventario:', inventoryError);
        // No fallar el pago por errores de inventario, pero registrar el error
      }

      // 📧 Enviar email de confirmación de pago
      try {
        const orderWithDetails = await Order.findById(order._id).populate('userId');
        await emailService.sendPaymentConfirmation(orderWithDetails, { reference: captureData.id });
        console.log('📧 Email de confirmación de pago enviado');
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación de pago:', emailError);
        // No fallar el pago por errores de email
      }
    } else {
      console.warn('⚠️ Orden no encontrada en MongoDB con paypalOrderId:', orderID);
    }

    return res.json({
      success: true,
      message: "Pago capturado exitosamente",
      data: captureData,
      orderId: order?._id
    });
  } catch (error) {
    console.error("Error capturando pago:", error);
    next(error);
  }
}

/**
 * Cancelar pago
 */
async function cancelPayment(req, res, next) {
  try {
    return res.status(200).json({ 
      success: true,
      message: "Pago cancelado por el usuario" 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea una orden de PayPal simple (para PayPal Card)
 * No requiere Order previa en MongoDB
 * Recibe: { product: { description, cost } }
 */
async function createOrder(req, res, next) {
  try {
    const { product } = req.body;

    if (!product || !product.cost) {
      return res.status(400).json({ 
        success: false,
        error: "Datos inválidos. Se requiere product.cost" 
      });
    }

    console.log("💳 Creando orden PayPal simple (Card):", {
      description: product.description,
      cost: product.cost
    });

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: product.cost,
            },
            description: product.description || "Compra en Sako Pets",
          },
        ],
      }),
    });

    const orderData = await handleResponse(response);
    console.log("✅ Orden simple creada exitosamente:", orderData.id);
    
    return res.json(orderData);
  } catch (error) {
    console.error("❌ Error al crear orden simple:", error.message);
    next(error);
  }
}

/**
 * Captura el pago de PayPal simple (para PayPal Card)
 * Recibe: { orderID }
 * IMPORTANTE: Solo retorna datos, NO guarda en DB automáticamente
 */
async function captureOrder(req, res, next) {
  try {
    const { orderID } = req.body;
    
    if (!orderID) {
      return res.status(400).json({ 
        success: false,
        error: "Falta orderID en la petición" 
      });
    }

    console.log("💰 Capturando orden PayPal simple (Card):", orderID);

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await handleResponse(response);
    
    // Verificar que el pago fue completado
    const paymentStatus = captureData.status;
    console.log("✅ Pago simple capturado:", {
      orderId: orderID,
      status: paymentStatus,
      captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id
    });

    // NO guardamos en DB aquí - eso lo hace PaymentSuccess.jsx
    return res.json(captureData);
  } catch (error) {
    console.error("❌ Error al capturar pago simple:", error.message);
    next(error);
  }
}

module.exports = { 
  createPayPalOrder, 
  capturePayPalOrder, 
  cancelPayment,
  // Funciones simples para PayPal Card
  createOrder,
  captureOrder
};
