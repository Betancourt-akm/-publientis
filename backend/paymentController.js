const fetch = require("node-fetch");
require("dotenv").config();

// Obtener credenciales de PayPal desde variables de entorno
const { 
  PAYPAL_CLIENT_ID, 
  PAYPAL_CLIENT_SECRET, 
  PAYPAL_API_CLIENT, 
  PAYPAL_API_SECRET,
  PAYPAL_API 
} = process.env;

// Usar las credenciales correctas (prioridad a las nuevas)
const clientId = PAYPAL_CLIENT_ID || PAYPAL_API_CLIENT;
const clientSecret = PAYPAL_CLIENT_SECRET || PAYPAL_API_SECRET;
const base = PAYPAL_API || "https://api-m.sandbox.paypal.com";

/**
 * Maneja las respuestas de la API de PayPal
 */
async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }
  const errorMessage = await response.text();
  console.error("❌ Error PayPal:", errorMessage);
  throw new Error(errorMessage);
}

/**
 * Genera un token de acceso para autenticar con PayPal
 */
async function generateAccessToken() {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

/**
 * Crea una orden de pago en PayPal
 * Recibe: { product: { description, cost } }
 */
async function createOrder(req, res, next) {
  try {
    const { product } = req.body;

    if (!product || !product.cost) {
      return res.status(400).json({ 
        error: "Datos inválidos. Se requiere product.cost" 
      });
    }

    console.log("💳 Creando orden PayPal:", {
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
    console.log("✅ Orden creada exitosamente:", orderData.id);
    
    return res.json(orderData);
  } catch (error) {
    console.error("❌ Error al crear orden:", error.message);
    next(error);
  }
}

/**
 * Captura el pago después de que el usuario lo apruebe
 * Recibe: { orderID }
 */
async function captureOrder(req, res, next) {
  try {
    const { orderID } = req.body;
    
    if (!orderID) {
      return res.status(400).json({ 
        error: "Falta orderID en la petición" 
      });
    }

    console.log("💰 Capturando orden PayPal:", orderID);

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
    console.log("✅ Pago capturado:", {
      orderId: orderID,
      status: paymentStatus,
      captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id
    });

    return res.json(captureData);
  } catch (error) {
    console.error("❌ Error al capturar pago:", error.message);
    next(error);
  }
}

/**
 * Maneja la cancelación de un pago
 */
async function cancelPayment(req, res, next) {
  console.log("❌ Pago cancelado por el usuario");
  res.status(200).json({ 
    success: true,
    message: "Pago cancelado correctamente." 
  });
}

module.exports = { 
  createOrder, 
  captureOrder, 
  cancelPayment 
};
