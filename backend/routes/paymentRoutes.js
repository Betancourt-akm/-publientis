const express = require('express');
const router = express.Router();
const {
  createPayPalOrder,
  capturePayPalOrder,
  cancelPayment,
  createOrder,
  captureOrder
} = require('../controller/payment/paymentController');
const {
  epaycoConfirmation,
  verifyPSETransaction
} = require('../controller/payment/pseController');
const authToken = require('../middleware/authToken');

// ========== TEST PayPal Connection ==========
// Verificar conexión con PayPal Sandbox (NO requiere autenticación)
router.get('/test-paypal-connection', async (req, res) => {
  try {
    const fetch = require('node-fetch');
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_API_CLIENT;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_API_SECRET;
    const base = "https://api-m.sandbox.paypal.com";
    
    console.log('🧪 TEST: Verificando conexión con PayPal Sandbox...');
    console.log('📍 URL:', base);
    console.log('🔑 Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : '❌ NO CONFIGURADO');
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return res.json({
        success: false,
        message: '❌ Credenciales de PayPal no configuradas',
        details: {
          clientId: !!PAYPAL_CLIENT_ID,
          clientSecret: !!PAYPAL_CLIENT_SECRET
        }
      });
    }
    
    // Intentar obtener token de acceso
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      console.log('✅ Conexión con PayPal Sandbox exitosa');
      return res.json({
        success: true,
        message: '✅ Conexión con PayPal Sandbox ACTIVA',
        details: {
          environment: 'Sandbox',
          apiUrl: base,
          tokenReceived: true,
          tokenType: data.token_type,
          expiresIn: data.expires_in + ' segundos',
          scope: data.scope
        }
      });
    } else {
      console.error('❌ Error al conectar con PayPal:', data);
      return res.json({
        success: false,
        message: '❌ Error al conectar con PayPal',
        error: data
      });
    }
  } catch (error) {
    console.error('❌ Error en test de PayPal:', error);
    res.status(500).json({
      success: false,
      message: '❌ Error al verificar conexión',
      error: error.message
    });
  }
});

// ========== PayPal ==========
// Crear orden de PayPal (requiere autenticación)
router.post('/create-paypal-order', authToken, createPayPalOrder);

// Capturar pago de PayPal
router.post('/capture-order', capturePayPalOrder);

// Cancelar pago
router.get('/cancel-payment', cancelPayment);

// ========== PayPal Card (Simple) ==========
// Crear orden simple para PayPal Card (NO requiere Order previa)
router.post('/create-order', createOrder);

// Capturar pago simple de PayPal Card
router.post('/capture-payment', captureOrder);

// ========== PSE (ePayco) ==========
// Webhook de confirmación de ePayco (NO requiere autenticación - llamado por ePayco)
router.post('/epayco-confirmation', epaycoConfirmation);

// Verificar estado de transacción PSE (requiere autenticación)
router.get('/verify-pse/:orderId', authToken, verifyPSETransaction);

module.exports = router;
