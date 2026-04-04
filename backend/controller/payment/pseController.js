// controller/payment/pseController.js

const Order = require("../../models/orderModel");

/**
 * Webhook de confirmación de pago de ePayco
 * Este endpoint es llamado por ePayco cuando el pago es procesado
 */
async function epaycoConfirmation(req, res) {
  try {
    console.log('📩 Confirmación de ePayco recibida:', req.body);

    const {
      x_cust_id_cliente,
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_response,
      x_approval_code,
      x_transaction_state,
      x_extra1, // Order ID de MongoDB
      x_extra2, // User ID
      x_extra3, // Payment method
    } = req.body;

    // Validar firma de seguridad (opcional pero recomendado)
    // const expectedSignature = generateSignature(...);
    // if (x_signature !== expectedSignature) {
    //   return res.status(400).json({ success: false, message: 'Firma inválida' });
    // }

    // Buscar la orden en MongoDB
    const order = await Order.findById(x_extra1);

    if (!order) {
      console.error('❌ Orden no encontrada:', x_extra1);
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    // Actualizar estado de la orden según respuesta de ePayco
    if (x_response === 'Aceptada' && x_transaction_state === 'Aceptada') {
      // Pago exitoso
      order.paymentStatus = 'Pagado';
      order.orderStatus = 'Procesando';
      order.transactionId = x_transaction_id;
      order.ePaycoRef = x_ref_payco;
      order.paidAt = new Date();
      
      console.log('✅ Pago PSE exitoso. Orden:', order.orderNumber);
    } else if (x_response === 'Rechazada' || x_transaction_state === 'Rechazada') {
      // Pago rechazado
      order.paymentStatus = 'Rechazado';
      order.transactionId = x_transaction_id;
      order.ePaycoRef = x_ref_payco;
      
      console.log('❌ Pago PSE rechazado. Orden:', order.orderNumber);
    } else if (x_response === 'Pendiente' || x_transaction_state === 'Pendiente') {
      // Pago pendiente
      order.paymentStatus = 'Pendiente';
      order.transactionId = x_transaction_id;
      order.ePaycoRef = x_ref_payco;
      
      console.log('⏳ Pago PSE pendiente. Orden:', order.orderNumber);
    }

    await order.save();

    // ePayco espera una respuesta específica
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando confirmación de ePayco:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Verificar estado de transacción PSE
 * Este endpoint puede ser llamado desde el frontend para verificar el estado
 */
async function verifyPSETransaction(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    return res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      ePaycoRef: order.ePaycoRef,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      }
    });
  } catch (error) {
    console.error('Error verificando transacción PSE:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  epaycoConfirmation,
  verifyPSETransaction,
};
