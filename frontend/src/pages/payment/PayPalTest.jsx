import React from 'react';
import PayPalDiagnostic from '../../components/payment/PayPalDiagnostic';
import PayPalTestButton from '../../components/payment/PayPalTestButton';

const PayPalTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🧪 Página de Pruebas PayPal
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diagnóstico */}
          <div>
            <PayPalDiagnostic />
          </div>
          
          {/* Botón de prueba */}
          <div>
            <PayPalTestButton />
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instrucciones de Prueba:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Verifica que el diagnóstico muestre todo en ✅</li>
            <li>2. Si hay errores ❌, sigue las soluciones sugeridas</li>
            <li>3. Prueba el botón de PayPal con $10.00 USD</li>
            <li>4. Usa las credenciales de sandbox de PayPal para probar</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🔧 Credenciales de Prueba PayPal Sandbox:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> sb-buyer@personal.example.com</p>
            <p><strong>Password:</strong> 12345678</p>
            <p><em>O crea una cuenta de prueba en developer.paypal.com</em></p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/checkout" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Volver al Checkout
          </a>
        </div>
      </div>
    </div>
  );
};

export default PayPalTest;
