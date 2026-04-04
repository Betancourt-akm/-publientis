// src/pages/PaymentFailure.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-failure-container">
      <h1>Pago Rechazado</h1>
      <p>Tu pago no fue aprobado. Por favor, intenta nuevamente.</p>
      <button onClick={() => navigate('/cart')}>Volver al Carrito</button>
      <button onClick={() => navigate('/')}>Volver al Inicio</button>
    </div>
  );
};

export default PaymentFailure;
