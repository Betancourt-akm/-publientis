import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalTestButton = () => {
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  console.log('🧪 PayPal Test - Client ID:', clientId ? 'Configurado ✅' : 'No configurado ❌');

  // Configuración mínima para test
  const initialOptions = {
    'client-id': clientId,
    currency: 'USD',
    intent: 'capture'
  };

  const createOrder = (data, actions) => {
    console.log('🧪 Test - Creando orden de prueba...');
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '10.00'
        }
      }]
    });
  };

  const onApprove = (data, actions) => {
    console.log('🧪 Test - Orden aprobada:', data);
    return actions.order.capture().then((details) => {
      console.log('🧪 Test - Pago capturado:', details);
      alert('Pago de prueba exitoso!');
    });
  };

  const onError = (err) => {
    console.error('🧪 Test - Error:', err);
    alert('Error en el pago de prueba');
  };

  if (!clientId) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <p className="text-red-700">❌ PayPal Client ID no configurado</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h3 className="text-lg font-semibold mb-3">🧪 PayPal Test Button</h3>
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
          }}
        />
      </PayPalScriptProvider>
      <p className="text-xs text-gray-500 mt-2">
        Este es un botón de prueba con $10.00 USD
      </p>
    </div>
  );
};

export default PayPalTestButton;
