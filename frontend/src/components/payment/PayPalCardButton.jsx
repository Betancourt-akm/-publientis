import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SummaryApi from "../../common";

/**
 * Componente de botón PayPal Card optimizado para Sako Pets
 * @param {Object} props
 * @param {Object} props.product - Objeto con descripción y costo del producto
 * @param {string} props.product.description - Descripción del pedido
 * @param {number} props.product.cost - Costo en USD
 * @param {Object} props.cart - Carrito completo (opcional, para guardar en PaymentSuccess)
 * @param {Object} props.shippingInfo - Información de envío (opcional)
 */
const PayPalCardButton = ({ product, cart, shippingInfo }) => {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";

  const initialOptions = {
    "client-id": clientId,
    currency: "USD",
    components: "buttons",
  };

  /**
   * Crea la orden en PayPal
   */
  const createOrder = () => {
    return fetch(SummaryApi.createOrder.url, {
      method: SummaryApi.createOrder.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: {
          description: product?.description || "Compra en Sako Pets",
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
        console.log("✅ Orden creada:", order.id);
        return order.id;
      })
      .catch((error) => {
        console.error("❌ Error al crear orden:", error);
        toast.error("Error al crear la orden de pago");
        throw error;
      });
  };

  /**
   * Captura el pago después de la aprobación del usuario
   */
  const onApprove = (data) => {
    return fetch(SummaryApi.captureOrder.url, {
      method: SummaryApi.captureOrder.method,
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
        console.log("✅ Pago capturado:", details);
        
        // Verificar que el pago esté COMPLETED
        const status = details.status;
        if (status !== "COMPLETED") {
          throw new Error(`Pago no completado. Estado: ${status}`);
        }

        toast.success("¡Pago exitoso!");
        
        // Extraer información del pago
        const reference = details.id || data.orderID;
        const capturedValue =
          details.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
          product.cost;
        const amountInCents = Math.round(parseFloat(capturedValue) * 100);

        // Redirigir a PaymentSuccess con parámetros
        // PaymentSuccess se encargará de guardar en la base de datos
        navigate(
          `/payment-success?status=APPROVED&reference=${reference}&amount_in_cents=${amountInCents}&payment_method=paypal`
        );
      })
      .catch((error) => {
        console.error("❌ Error al capturar pago:", error);
        toast.error("El pago falló, intenta nuevamente.");
        navigate("/payment-failure");
      });
  };

  /**
   * Maneja errores del proceso de pago
   */
  const onError = (err) => {
    console.error("❌ Error PayPal:", err);
    toast.error("Ocurrió un error en el procesamiento del pago.");
    // No redirigir automáticamente en error, dejar que el usuario lo intente de nuevo
  };

  /**
   * Se ejecuta cuando el usuario cancela el pago
   */
  const onCancel = () => {
    console.log("⚠️ Pago cancelado por el usuario");
    toast.info("Pago cancelado");
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="paypal-card-button-container">
        <PayPalButtons
          fundingSource="card"
          style={{ 
            layout: "horizontal",
            label: "pay",
            height: 48
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalCardButton;
