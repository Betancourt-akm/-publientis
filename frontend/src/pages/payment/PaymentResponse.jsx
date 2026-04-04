// src/pages/PaymentResponse.js
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentResponse = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Procesar los parámetros de la URL
  const query = new URLSearchParams(location.search);
  const refPayco = query.get('ref_payco');

  if (refPayco) {
    // Puedes mostrar información al usuario o redirigir
    navigate('/payment-success');
  } else {
    navigate('/payment-failure');
  }

  return null;
};

export default PaymentResponse;
