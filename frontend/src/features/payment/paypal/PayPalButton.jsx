import React, { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axiosInstance from '../../../utils/axiosInstance';
import SummaryApi from "../common"; 
import { useNavigate } from "react-router-dom";


const PayPalButton = ({ totalAmount, currency = "USD", docType, docNumber, buyerName, buyerLastName, buyerEmail, reservationDetails }) => {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID; 
    if (CLIENT_ID) {
      setClientId(CLIENT_ID);
    } else {
  
      setClientId("YOUR-SANDBOX-CLIENT-ID");
    }
  }, []);

  if (!clientId) {
    return <div>Cargando PayPal...</div>;
  }

 
  const createOrderBackend = async () => {
    try {
      const payload = {
        amount: totalAmount,
        currency,
        buyerEmail,
        buyerName,
        buyerLastName,
        docType,
        docNumber,
        reservationDetails,
      };
      console.log("createOrder payload:", payload);

      const response = await axiosInstance.post(SummaryApi.createOrder.url, payload);
      const data = response.data;
      console.log("Orden creada en backend:", data);
      return data.id; 
    } catch (error) {
      console.error("Error creando la orden en backend:", error);
      throw error;
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: currency, 
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        fundingSource={undefined} 
        createOrder={async () => {
          const orderID = await createOrderBackend();
          return orderID; 
        }}
        onApprove={async (data, actions) => {
          try {
            console.log("onApprove data:", data);
         
            const referenceCode = ""; 
         
            const captureUrl = `${SummaryApi.captureOrder.url}?orderID=${data.orderID}&referenceCode=${referenceCode}`;
            console.log("Llamando a:", captureUrl);
            const response = await axiosInstance.post(captureUrl);
            if (response.redirected) {
              
              window.location.href = response.url;
            } else {
              console.log("Respuesta no redirigida. Checar logs");
            }
          } catch (error) {
            console.error("onApprove error:", error);
      
          }
        }}
        onCancel={(data) => {
          console.log("onCancel data:", data);
          window.location.href = SummaryApi.cancelPayment.url; 
        
        }}
        onError={(err) => {
          console.error("onError PayPal Buttons:", err);
          navigate("/payment-failure");
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
