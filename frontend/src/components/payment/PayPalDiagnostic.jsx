import React, { useState, useEffect } from 'react';

const PayPalDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    clientId: '',
    environment: '',
    networkTest: 'pending',
    scriptTest: 'pending'
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
      const environment = process.env.REACT_APP_PAYPAL_ENVIRONMENT;

      setDiagnostics(prev => ({
        ...prev,
        clientId: clientId || 'No configurado',
        environment: environment || 'No configurado'
      }));

      // Test de conectividad a PayPal
      try {
        const response = await fetch('https://www.paypal.com/sdk/js?client-id=test', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        setDiagnostics(prev => ({
          ...prev,
          networkTest: 'success'
        }));
      } catch (error) {
        console.error('Network test failed:', error);
        setDiagnostics(prev => ({
          ...prev,
          networkTest: 'failed'
        }));
      }

      // Test de carga del script
      try {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = () => {
          setDiagnostics(prev => ({
            ...prev,
            scriptTest: 'success'
          }));
        };
        script.onerror = () => {
          setDiagnostics(prev => ({
            ...prev,
            scriptTest: 'failed'
          }));
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Script test failed:', error);
        setDiagnostics(prev => ({
          ...prev,
          scriptTest: 'failed'
        }));
      }
    };

    runDiagnostics();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        🔍 Diagnóstico PayPal
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">Client ID:</span>
          <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
            {diagnostics.clientId.length > 20 
              ? `${diagnostics.clientId.substring(0, 20)}...` 
              : diagnostics.clientId
            }
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">Entorno:</span>
          <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
            {diagnostics.environment}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">Conectividad PayPal:</span>
          <span className={`flex items-center gap-2 ${getStatusColor(diagnostics.networkTest)}`}>
            {getStatusIcon(diagnostics.networkTest)}
            <span className="text-sm">{diagnostics.networkTest}</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">Carga del Script:</span>
          <span className={`flex items-center gap-2 ${getStatusColor(diagnostics.scriptTest)}`}>
            {getStatusIcon(diagnostics.scriptTest)}
            <span className="text-sm">{diagnostics.scriptTest}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Posibles soluciones:</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-1 space-y-1">
          <li>• Desactiva bloqueadores de anuncios</li>
          <li>• Verifica tu conexión a internet</li>
          <li>• Reinicia el servidor de desarrollo</li>
          <li>• Verifica que el Client ID sea válido</li>
        </ul>
      </div>

      <div className="mt-3 text-center">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Recargar Página
        </button>
      </div>
    </div>
  );
};

export default PayPalDiagnostic;
