import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../../common';

// Componente interno que usa usePayPalScriptReducer
const PayPalButtonWrapper = ({ orderId, totalAmount, isDirectFlow, checkoutData, onCreateOrder, onApproveOrder, onCancelOrder, onErrorOrder, clientId }) => {
  const [{ isResolved, isPending, isRejected }] = usePayPalScriptReducer();
  const [loading, setLoading] = useState(false);

  // Crear wrappers que manejen el estado de loading
  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const result = await onCreateOrder();
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleApprove = async (data) => {
    setLoading(true);
    try {
      await onApproveOrder(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  console.log('🔍 PayPal Script State - Resolved:', isResolved, 'Pending:', isPending, 'Rejected:', isRejected);

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Cargando PayPal...</span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">❌</div>
          <p className="text-red-700 font-semibold">Error al cargar PayPal</p>
          <p className="text-red-600 text-sm mt-1">
            Verifica tu conexión a internet
          </p>
          <div className="mt-3 space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              🔄 Reintentar
            </button>
            <div className="text-xs text-red-500 space-y-1">
              <p>Client ID: {clientId ? '✅ Configurado' : '❌ No configurado'}</p>
              <p>Entorno: Sandbox</p>
              <p>Verifica que no haya bloqueadores de anuncios activos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResolved) {
    return (
      <>
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Procesando pago...</p>
            </div>
          </div>
        )}
        <div className="mb-3 p-3 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold text-center">
            💳 Paga con tu Tarjeta de Crédito/Débito
          </p>
        </div>
        <PayPalButtons
          style={{
            layout: 'vertical',
            height: 55,
            color: 'blue',
            shape: 'rect',
            label: 'pay'
          }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onCancel={onCancelOrder}
          onError={onErrorOrder}
          disabled={loading}
          forceReRender={[orderId, totalAmount, isDirectFlow ? JSON.stringify(checkoutData) : null]}
        />
      </>
    );
  }

  return null;
};

const PayPalCheckoutButton = ({ orderId, totalAmount, checkoutData, cartData }) => {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || '';

  // Determinar si es flujo directo (sin orden previa) o flujo con orden existente
  const isDirectFlow = !orderId && checkoutData && cartData;
  
  console.log('💳 PayPal Button - Flujo:', isDirectFlow ? 'DIRECTO' : 'CON ORDEN PREVIA');
  console.log('💳 PayPal Button - Order ID:', orderId);
  console.log('💳 PayPal Button - Total Amount:', totalAmount);
  console.log('💳 PayPal Button - Client ID configurado:', clientId ? 'Sí ✅' : 'No ❌');

  // ✅ Configuración simplificada para debugging
  const initialOptions = {
    'client-id': clientId,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
    'disable-funding': 'paylater,venmo'
  };
  
  console.log('⚙️ PayPal Initial Options:', initialOptions);

  const createOrder = async () => {
    try {
      if (isDirectFlow) {
        // FLUJO DIRECTO: Crear orden y luego orden de PayPal
        console.log('🔄 Flujo directo: Creando orden en base de datos...');
        
        // Primero crear la orden en la base de datos
        const orderResponse = await fetch(SummaryApi.createOrder.url, {
          method: SummaryApi.createOrder.method,
          credentials: SummaryApi.createOrder.credentials,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shippingAddress: {
              fullName: checkoutData.fullName,
              phone: checkoutData.phone,
              email: checkoutData.email,
              address: checkoutData.address,
              city: checkoutData.city,
              postalCode: checkoutData.postalCode,
              country: checkoutData.country,
            },
            paymentMethod: checkoutData.paymentMethod,
            notes: checkoutData.notes,
          }),
        });

        const orderData = await orderResponse.json();
        console.log('📦 Orden creada:', orderData);

        if (!orderData.success) {
          throw new Error(orderData.message || 'Error al crear la orden');
        }

        // Ahora crear la orden de PayPal
        console.log('🔄 Creando orden PayPal para Order ID:', orderData.data._id);
        
        const paypalResponse = await fetch(SummaryApi.createPayPalOrder.url, {
          method: SummaryApi.createPayPalOrder.method,
          credentials: SummaryApi.createPayPalOrder.credentials,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: orderData.data._id }),
        });

        const paypalData = await paypalResponse.json();
        console.log('📦 Respuesta crear orden PayPal:', paypalData);

        if (!paypalData.success) {
          throw new Error(paypalData.message || 'Error al crear la orden de PayPal');
        }

        console.log('✅ Orden PayPal creada exitosamente. PayPal Order ID:', paypalData.id);
        return paypalData.id;
        
      } else {
        // FLUJO CON ORDEN EXISTENTE
        console.log('🔄 Creando orden PayPal para Order ID existente:', orderId);
        
        const response = await fetch(SummaryApi.createPayPalOrder.url, {
          method: SummaryApi.createPayPalOrder.method,
          credentials: SummaryApi.createPayPalOrder.credentials,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json();
        console.log('📦 Respuesta crear orden PayPal:', data);

        if (!data.success) {
          throw new Error(data.message || 'Error al crear la orden de PayPal');
        }

        console.log('✅ Orden PayPal creada exitosamente. PayPal Order ID:', data.id);
        return data.id;
      }
    } catch (error) {
      console.error('❌ Error creando orden PayPal:', error);
      toast.error(error.message || 'Error al iniciar el pago con PayPal');
      throw error;
    }
  };

  const onApprove = async (data) => {
    try {
      console.log('✅ Usuario aprobó el pago en PayPal. Order ID:', data.orderID);
      console.log('🔄 Capturando pago...');
      
      const response = await fetch(SummaryApi.capturePayment.url, {
        method: SummaryApi.capturePayment.method,
        credentials: 'include', // ✅ CRÍTICO: Enviar cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      const captureData = await response.json();
      console.log('📦 Respuesta captura de pago:', captureData);

      if (!captureData.success) {
        throw new Error(captureData.message || 'Error al procesar el pago');
      }

      console.log('✅ Pago capturado exitosamente');
      toast.success('¡Pago realizado exitosamente! 🎉');
      
      // Redirigir a página de éxito con el ID de la orden
      setTimeout(() => {
        navigate(`/payment-success?orderId=${captureData.orderId}`);
      }, 500);
    } catch (error) {
      console.error('❌ Error capturando pago:', error);
      toast.error(error.message || 'Error al procesar el pago');
      navigate('/cancel-order');
    }
  };

  const onCancel = () => {
    toast.info('Pago cancelado');
    navigate('/cancel-order');
  };

  const onError = (err) => {
    console.error('Error en PayPal:', err);
    toast.error('Ocurrió un error al procesar el pago');
    navigate('/cancel-order');
  };

  if (!clientId) {
    return (
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 text-center">
        <div className="text-5xl mb-3">❌</div>
        <p className="text-red-700 font-bold text-lg mb-2">PayPal Client ID no configurado</p>
        <p className="text-sm text-red-600 mb-3">Verifica tu archivo .env</p>
        <div className="bg-white rounded p-3 text-left text-xs font-mono text-gray-700">
          <p>Debe existir:</p>
          <p className="mt-1 text-blue-600">REACT_APP_PAYPAL_CLIENT_ID=tu_client_id</p>
        </div>
      </div>
    );
  }

  // Validaciones para flujo directo
  if (isDirectFlow) {
    if (!checkoutData || !cartData) {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-yellow-700 font-bold text-lg">Datos de checkout incompletos</p>
          <p className="text-sm text-yellow-600 mt-2">Completa todos los campos requeridos</p>
        </div>
      );
    }

    // Validar campos requeridos
    const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => !checkoutData[field]?.trim());
    
    if (missingFields.length > 0) {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-yellow-700 font-bold text-lg">Campos requeridos faltantes</p>
          <p className="text-sm text-yellow-600 mt-2">
            Completa: {missingFields.join(', ')}
          </p>
        </div>
      );
    }
  }

  // Validación para flujo con orden existente
  if (!isDirectFlow && !orderId) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <p className="text-yellow-700 font-bold text-lg">No se proporcionó Order ID</p>
        <p className="text-sm text-yellow-600 mt-2">Crea la orden primero</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtonWrapper
          orderId={orderId}
          totalAmount={totalAmount}
          isDirectFlow={isDirectFlow}
          checkoutData={checkoutData}
          onCreateOrder={createOrder}
          onApproveOrder={onApprove}
          onCancelOrder={onCancel}
          onErrorOrder={onError}
          clientId={clientId}
        />
      </PayPalScriptProvider>
      
      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-500 text-center">
          🔒 Pago 100% seguro procesado por PayPal
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <span>💳 Acepta Visa, Mastercard, American Express</span>
        </div>
        <p className="text-xs text-gray-400 text-center italic">
          * Usa PayPal o tu tarjeta de crédito/débito
        </p>
      </div>
    </div>
  );
};

export default PayPalCheckoutButton;
