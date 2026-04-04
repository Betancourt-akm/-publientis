import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import SummaryApi from "../common";
import { useNavigate } from "react-router-dom";
const PayPalPayment = ({ product }) => {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";
  const initialOptions = {
    "client-id": clientId,
    currency: "USD",
    components: "buttons",
    "enable-funding": "card", // ✅ Habilitar pago con tarjeta
    intent: "capture",
  };
  const createOrder = () => {
    return fetch(SummaryApi.createOrder.url, {
      method: SummaryApi.createOrder.method,
      credentials: 'include', // ✅ CRÍTICO: Enviar cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: {
          description: product?.description || "Producto sin descripción",
          cost: product?.cost,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al crear la orden");
        }
        return response.json();
      })
      .then((order) => {
       
        if (!order.id) {
          throw new Error("La respuesta no contiene un order id");
        }
        return order.id;
      })
      .catch((error) => {
        toast.error("Error al crear la orden de pago");
        throw error;
      });
  };
  const onApprove = (data) => {
    return fetch(SummaryApi.captureOrder.url, {
      method: SummaryApi.captureOrder.method,
      credentials: 'include', // ✅ CRÍTICO: Enviar cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: data.orderID }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al capturar el pago");
        }
        return response.json();
      })
      .then((details) => {
       
        toast.success("¡Pago realizado exitosamente!", { icon: "🥳" });
        const reference = details.id || data.orderID;
        const capturedValue =
          details.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
          product.cost;
        const amountInCents = Math.round(parseFloat(capturedValue) * 100);
        navigate(
          `/payment-success?status=APPROVED&reference=${reference}&amount_in_cents=${amountInCents}`
        );
      })
      .catch((error) => {
        toast.error("El pago falló, intenta nuevamente.");
        console.error("onApprove error:", error);
        navigate("/payment-failure");
      });
  };

  const onError = (err) => {
    toast.error("Ocurrió un error en el procesamiento del pago.");
    console.error("PayPal Buttons Error:", err);
    navigate("/payment-failure");
  };
  return (
    <PayPalScriptProvider options={initialOptions}>
      <div>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 50,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
        <p className="text-xs text-gray-500 text-center mt-2">
          🔒 Pago seguro - 💳 Tarjeta o 🔵 PayPal
        </p>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
