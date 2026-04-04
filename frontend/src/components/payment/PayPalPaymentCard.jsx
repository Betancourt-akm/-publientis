

import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import SummaryApi from "../common";
import { useNavigate } from "react-router-dom";
const PayPalPaymentCard = ({ product }) => {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";

  const initialOptions = {
    "client-id": clientId,
    currency: "USD",
    components: "buttons",
    "enable-funding": "card", // ✅ Habilitar pago con tarjeta
    "disable-funding": "paypal,paylater,venmo", // ❌ SOLO tarjeta - deshabilitar cuenta PayPal
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
        toast.success("¡Pago con tarjeta exitoso!");
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
        navigate("/payment-failure");
      });
  };

  const onError = (err) => {
    toast.error("Ocurrió un error en el procesamiento del pago con tarjeta.");
    console.error("PayPal Card Error =>", err);
    navigate("/payment-failure");
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div>
        <PayPalButtons
          fundingSource="card"
          style={{ 
            layout: "horizontal",
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 50
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
        <p className="text-xs text-gray-500 text-center mt-2">
          💳 Pago seguro solo con tarjeta de crédito/débito
        </p>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalPaymentCard;
