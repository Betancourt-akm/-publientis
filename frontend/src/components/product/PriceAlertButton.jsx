/**
 * Componente de Botón de Alerta de Precio
 * Permite crear alertas cuando un producto baje de precio
 */

import React, { useState } from 'react';
import { FaBell, FaTimes, FaCheck } from 'react-icons/fa';

const PriceAlertButton = ({ product, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debes iniciar sesión para crear alertas de precio');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          targetPrice: parseFloat(targetPrice)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setTargetPrice('');
        }, 2000);
      } else {
        alert(data.message || 'Error al crear alerta');
      }
    } catch (error) {
      console.error('Error creating price alert:', error);
      alert('Error al crear alerta de precio');
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrices = [
    { label: '5% menos', value: Math.round(product.price * 0.95) },
    { label: '10% menos', value: Math.round(product.price * 0.90) },
    { label: '15% menos', value: Math.round(product.price * 0.85) },
    { label: '20% menos', value: Math.round(product.price * 0.80) }
  ];

  return (
    <>
      {/* Botón */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FaBell className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Alerta de precio
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>

            {!success ? (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    🔔 Alerta de Precio
                  </h3>
                  <p className="text-gray-600">
                    Te notificaremos cuando el precio baje
                  </p>
                </div>

                {/* Producto info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-semibold mb-1">{product.name}</h4>
                      <p className="text-gray-600">
                        Precio actual: 
                        <span className="font-bold text-lg ml-2">
                          ${product.price.toLocaleString('es-CO')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notificarme cuando el precio sea:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="Precio objetivo"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="1"
                        max={product.price}
                      />
                    </div>
                  </div>

                  {/* Sugerencias */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Sugerencias:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedPrices.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          type="button"
                          onClick={() => setTargetPrice(suggestion.value)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {suggestion.label}
                          <br />
                          <span className="font-semibold">
                            ${suggestion.value.toLocaleString('es-CO')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !targetPrice}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    {loading ? 'Creando...' : 'Crear Alerta'}
                  </button>
                </form>

                {/* Info */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Recibirás un email cuando el precio alcance o baje del precio objetivo.
                  La alerta expira en 90 días.
                </p>
              </>
            ) : (
              // Success message
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-green-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-2">¡Alerta creada!</h3>
                <p className="text-gray-600">
                  Te notificaremos cuando el precio baje a ${targetPrice}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PriceAlertButton;
