// wompiConfig.js - Configuración de Wompi para pagos en Colombia

require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

// Validar variables de entorno requeridas
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
const WOMPI_API_URL = process.env.WOMPI_API_URL || "https://production.wompi.co/v1";
const WOMPI_EVENTS_URL = process.env.WOMPI_EVENTS_URL;

if (!WOMPI_PUBLIC_KEY || !WOMPI_PRIVATE_KEY) {
  console.warn("⚠️  Credenciales de Wompi no configuradas. Los pagos con Wompi no estarán disponibles.");
}

// Cliente Axios configurado para Wompi
const wompi = axios.create({
  baseURL: WOMPI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Obtener token de aceptación de Wompi
 * Este token se usa en el frontend para el widget de pago
 */
async function getWompiAcceptanceToken() {
  try {
    const response = await wompi.get("/merchants/" + WOMPI_PUBLIC_KEY);
    return response.data.data.presigned_acceptance.acceptance_token;
  } catch (error) {
    console.error("Error obteniendo token de aceptación de Wompi:", error.message);
    throw new Error("No se pudo obtener el token de aceptación de Wompi");
  }
}

/**
 * Crear transacción en Wompi
 * @param {Object} transactionData - Datos de la transacción
 * @returns {Object} Respuesta de Wompi con los datos de la transacción
 */
async function createWompiTransaction(transactionData) {
  const {
    amountInCents,
    currency,
    customerEmail,
    reference,
    paymentMethod,
    redirectUrl,
  } = transactionData;

  try {
    const response = await wompi.post("/transactions", {
      amount_in_cents: amountInCents,
      currency: currency || "COP",
      customer_email: customerEmail,
      reference: reference,
      payment_method: paymentMethod,
      redirect_url: redirectUrl,
      public_key: WOMPI_PUBLIC_KEY,
    }, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creando transacción en Wompi:", error.response?.data || error.message);
    throw new Error("No se pudo crear la transacción en Wompi");
  }
}

/**
 * Consultar estado de una transacción en Wompi
 * @param {String} transactionId - ID de la transacción
 * @returns {Object} Estado de la transacción
 */
async function getWompiTransaction(transactionId) {
  try {
    const response = await wompi.get(`/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error consultando transacción en Wompi:", error.response?.data || error.message);
    throw new Error("No se pudo consultar la transacción en Wompi");
  }
}

/**
 * Generar firma de integridad para validar webhooks de Wompi
 * @param {Object} event - Evento recibido de Wompi
 * @returns {String} Firma de integridad generada
 */
function generateWompiIntegritySignature(event) {
  const { id, status, amount_in_cents, currency, reference, customer_email } = event.data.transaction;
  
  const concatenatedString = 
    `${reference}${amount_in_cents}${currency}${status}${WOMPI_INTEGRITY_SECRET}`;
  
  return crypto.createHash("sha256").update(concatenatedString).digest("hex");
}

/**
 * Validar firma de integridad de un evento de Wompi
 * @param {Object} event - Evento recibido de Wompi
 * @param {String} receivedSignature - Firma recibida en el webhook
 * @returns {Boolean} True si la firma es válida
 */
function validateWompiWebhook(event, receivedSignature) {
  const generatedSignature = generateWompiIntegritySignature(event);
  return generatedSignature === receivedSignature;
}

/**
 * Procesar diferentes estados de transacciones Wompi
 * @param {String} status - Estado de la transacción
 * @returns {Object} Información sobre el estado procesado
 */
function processWompiTransactionStatus(status) {
  const statusMap = {
    APPROVED: {
      success: true,
      message: "Pago aprobado exitosamente",
      description: "La transacción fue aprobada y el pago se completó",
    },
    PENDING: {
      success: false,
      pending: true,
      message: "Pago pendiente",
      description: "La transacción está siendo procesada",
    },
    DECLINED: {
      success: false,
      message: "Pago rechazado",
      description: "La transacción fue rechazada por el banco o la entidad financiera",
    },
    VOIDED: {
      success: false,
      message: "Pago anulado",
      description: "La transacción fue anulada",
    },
    ERROR: {
      success: false,
      message: "Error en el pago",
      description: "Ocurrió un error durante el procesamiento del pago",
    },
  };

  return statusMap[status] || {
    success: false,
    message: "Estado desconocido",
    description: `Estado de transacción no reconocido: ${status}`,
  };
}

module.exports = {
  wompi,
  WOMPI_PUBLIC_KEY,
  WOMPI_PRIVATE_KEY,
  WOMPI_EVENTS_SECRET,
  WOMPI_INTEGRITY_SECRET,
  WOMPI_API_URL,
  WOMPI_EVENTS_URL,
  getWompiAcceptanceToken,
  createWompiTransaction,
  getWompiTransaction,
  generateWompiIntegritySignature,
  validateWompiWebhook,
  processWompiTransactionStatus,
};
