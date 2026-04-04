import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axiosInstance from '../../../utils/axiosInstance';
import { toast } from "react-toastify";
import SummaryApi from "../../../common";
import { useNavigate } from "react-router-dom";
const PayPalPayment = ({ product }) => {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";
  const initialOptions = {
    "client-id": clientId,
    currency: "USD",
    components: "buttons",
  };
    const createOrder = async () => {
    try {
      const response = await axiosInstance.post(SummaryApi.createOrder.url, {
        product: {
          description: product?.description || "Producto sin descripción",
          cost: product?.cost,
        },
      });
      const order = response.data;
      if (!order.id) {
        throw new Error("La respuesta no contiene un order id");
      }
      return order.id;
    } catch (error) {
      toast.error("Error al crear la orden de pago");
      throw error;
    }
  };
    const onApprove = async (data) => {
    try {
      const response = await axiosInstance.post(SummaryApi.captureOrder.url, { 
        orderID: data.orderID 
      });
      const details = response.data;
      toast.success("¡Pago realizado exitosamente!", { icon: "🥳" });
      const reference = details.id || data.orderID;
      const capturedValue =
        details.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
        product.cost;
      const amountInCents = Math.round(parseFloat(capturedValue) * 100);
      navigate(
        `/payment-success?status=APPROVED&reference=${reference}&amount_in_cents=${amountInCents}`
      );
    } catch (error) {
      toast.error("El pago falló, intenta nuevamente.");
      console.error("onApprove error:", error);
      navigate("/payment-failure");
    }
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
          style={{ layout: "horizontal" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
