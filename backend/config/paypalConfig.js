// paypalConfig.js
// Se asume que en tu .env tengas:
// BACKEND_DOMAIN=https://tu-backend.onrender.com
// PAYPAL_API_CLIENT=AXXXXXXXXXXX
// PAYPAL_API_SECRET=EXXXXXXXXXX
// PAYPAL_API=https://api-m.sandbox.paypal.com (o la de producción) https://api-m.paypal.com

// paypalConfig.js
const axios = require("axios");

// ===============================
// Variables PayPal
// ===============================
const PAYPAL_API =
  process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";

const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;

// ===============================
// Cliente Axios
// ===============================
const paypal = axios.create({
  baseURL: PAYPAL_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// Obtener Access Token
// ===============================
async function getPayPalAccessToken() {
  if (!PAYPAL_API_CLIENT || !PAYPAL_API_SECRET) {
    throw new Error(
      "PayPal credentials missing: PAYPAL_API_CLIENT o PAYPAL_API_SECRET"
    );
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const response = await paypal.post("/v1/oauth2/token", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username: PAYPAL_API_CLIENT,
      password: PAYPAL_API_SECRET,
    },
  });

  return response.data.access_token;
}

module.exports = {
  paypal,
  getPayPalAccessToken,
  PAYPAL_API,
};

