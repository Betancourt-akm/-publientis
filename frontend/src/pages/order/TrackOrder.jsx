/**
 * Página Pública de Tracking de Pedidos
 * Permite rastrear pedidos sin necesidad de login
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaSync, FaTruck, FaBox, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import OrderTimeline from '../../components/order/OrderTimeline';

const TrackOrder = () => {
  const { orderNumber: urlOrderNumber } = useParams();
  const navigate = useNavigate();
  
  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos si viene orderNumber en URL
  useEffect(() => {
    if (urlOrderNumber) {
      handleTrack(urlOrderNumber);
    }
  }, [urlOrderNumber]);

  const handleTrack = async (orderNum = orderNumber) => {
    if (!orderNum || orderNum.trim() === '') {
      toast.error('Por favor ingresa un número de orden');
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const api = SummaryApi.trackOrder(orderNum.trim());
      const response = await fetch(api.url, {
        method: api.method,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No se pudo encontrar la orden');
      }

      setTrackingData(data.data);
      
      // Actualizar URL sin recargar la página
      if (orderNum !== urlOrderNumber) {
        navigate(`/track/${orderNum}`, { replace: true });
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError(err.message);
      toast.error(err.message || 'Error al rastrear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!trackingData?.order?.trackingNumber) {
      toast.info('No hay número de seguimiento para actualizar');
      return;
    }

    setRefreshing(true);

    try {
      const api = SummaryApi.refreshTracking(trackingData.order.orderNumber);
      const response = await fetch(api.url, {
        method: api.method,
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Actualizar solo la info de tracking
        setTrackingData(prev => ({
          ...prev,
          tracking: data.data
        }));
        toast.success('Información actualizada');
      } else {
        toast.info('No hay actualizaciones nuevas');
      }
    } catch (err) {
      console.error('Error refreshing tracking:', err);
      toast.error('Error al actualizar tracking');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendiente': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Procesando': { color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
      'Enviado': { color: 'bg-purple-100 text-purple-800', icon: '🚚' },
      'Entregado': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Cancelado': { color: 'bg-red-100 text-red-800', icon: '❌' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '📦' };

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}>
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FaTruck className="text-blue-600 text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rastrear Pedido
          </h1>
          <p className="text-gray-600">
            Ingresa tu número de orden para ver el estado de tu envío
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ej: ORD-000001"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !orderNumber.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <FaSearch />
                  Rastrear
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            <p>💡 <strong>Tip:</strong> El número de orden lo encuentras en el email de confirmación</p>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-red-500 text-2xl">❌</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  No se pudo encontrar el pedido
                </h3>
                <p className="text-red-700">{error}</p>
                <p className="mt-2 text-sm text-red-600">
                  Verifica que el número de orden sea correcto. Formato esperado: ORD-000001
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {trackingData && !loading && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Pedido {trackingData.order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {trackingData.order.itemCount} producto(s) • {trackingData.order.shippingAddress.city}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(trackingData.order.status)}
                </div>
              </div>

              {/* Tracking Number */}
              {trackingData.order.trackingNumber && trackingData.order.trackingNumber !== 'null' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBox className="text-blue-600 text-2xl" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Número de Seguimiento</p>
                        <p className="text-lg font-bold text-blue-700 tracking-wide">
                          {trackingData.order.trackingNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <FaSync className={refreshing ? 'animate-spin' : ''} />
                      {refreshing ? 'Actualizando...' : 'Actualizar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Carrier Info */}
              {trackingData.tracking && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-purple-600 text-2xl flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-900">Transportadora</p>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                          {trackingData.tracking.carrier}
                        </span>
                      </div>
                      <p className="text-purple-800 font-semibold">
                        {trackingData.tracking.statusText}
                      </p>
                      {trackingData.tracking.currentLocation && (
                        <p className="text-sm text-purple-700 mt-1">
                          📍 {trackingData.tracking.currentLocation}
                        </p>
                      )}
                      {trackingData.tracking.estimatedDelivery && (
                        <p className="text-sm text-purple-600 mt-2">
                          🕐 Entrega estimada: {new Date(trackingData.tracking.estimatedDelivery).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fecha de Pedido</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(trackingData.order.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                {trackingData.order.deliveredAt && (
                  <div>
                    <p className="text-gray-600">Fecha de Entrega</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(trackingData.order.deliveredAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Historial del Pedido
              </h3>
              <OrderTimeline timeline={trackingData.timeline} />
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">¿Necesitas ayuda?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Si tienes preguntas sobre tu pedido, contáctanos:
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:soporte@freshface.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  📧 Enviar Email
                </a>
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Instructions (when no data) */}
        {!trackingData && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Cómo rastrear tu pedido?
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Busca el email de confirmación de tu pedido</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Copia el número de orden (formato: ORD-000001)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Pégalo en el campo de búsqueda arriba y haz clic en "Rastrear"</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
