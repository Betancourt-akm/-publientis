import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaEye, FaTruck, FaStar, FaRedo, FaExclamationCircle, FaCreditCard, FaTimes } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';

const MisOrdenes = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getUserOrders.url, {
        method: SummaryApi.getUserOrders.method,
        credentials: SummaryApi.getUserOrders.credentials,
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-[#FFF9E6] text-[#d9a305] border border-[#F2B705]/20',
      'Procesando': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Enviado': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Entregado': 'bg-green-50 text-green-700 border border-green-200',
      'Cancelado': 'bg-red-50 text-red-700 border border-red-200',
      'En Camino': 'bg-[#FFF9E6] text-[#1F3C88] border border-[#F2B705]',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-[#FFF9E6] text-[#d9a305] border border-[#F2B705]/20',
      'Pagado': 'bg-green-50 text-green-700 border border-green-200',
      'Fallido': 'bg-red-50 text-red-700 border border-red-200',
      'Reembolsado': 'bg-gray-50 text-gray-700 border border-gray-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getSmartButton = (order) => {
    // Botón inteligente según estado - UX profesional
    const status = order.orderStatus;
    const paymentStatus = order.paymentStatus;

    if (paymentStatus === 'Pendiente') {
      return {
        text: 'Pagar ahora',
        icon: <FaCreditCard />,
        className: 'bg-[#F2B705] text-white hover:bg-[#d9a305]',
        action: () => toast.info('Redirigiendo a pago...')
      };
    }

    if (status === 'Pendiente' || status === 'Procesando') {
      return {
        text: 'Cancelar',
        icon: <FaTimes />,
        className: 'bg-red-600 text-white hover:bg-red-700',
        to: `/orden/${order._id}#cancel`
      };
    }

    if (status === 'Enviado' || status === 'En Camino') {
      return {
        text: 'Ver seguimiento',
        icon: <FaTruck />,
        className: 'bg-[#1F3C88] text-white hover:bg-[#162D66]',
        to: `/track/${order.orderNumber || order._id}`
      };
    }

    if (status === 'Entregado') {
      return {
        text: 'Calificar',
        icon: <FaStar />,
        className: 'bg-[#F2B705] text-white hover:bg-[#d9a305]',
        action: () => toast.info('Función de calificación próximamente')
      };
    }

    if (status === 'Cancelado') {
      return {
        text: 'Comprar de nuevo',
        icon: <FaRedo />,
        className: 'bg-gray-600 text-white hover:bg-gray-700',
        action: () => toast.info('Agregando productos al carrito...')
      };
    }

    return {
      text: 'Abrir reclamo',
      icon: <FaExclamationCircle />,
      className: 'bg-orange-600 text-white hover:bg-orange-700',
      action: () => toast.info('Sistema de reclamos próximamente')
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F2B705]"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <FaShoppingBag className="mx-auto text-6xl text-gray-400 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">No tienes órdenes</h2>
        <p className="text-gray-600 mb-8">¡Comienza a comprar ahora!</p>
        <Link
          to="/productos"
          className="inline-block bg-[#F2B705] text-white px-8 py-3 rounded-lg hover:bg-[#d9a305] transition-colors font-semibold"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis Órdenes</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            {/* Header de la orden */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Orden #{order.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Realizada el {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    <p className="text-sm font-semibold text-[#1F3C88]">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-sm text-gray-600 col-span-full">
                  Y {order.items.length - 3} producto{order.items.length - 3 !== 1 ? 's' : ''} más
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-[#1F3C88]">{formatPrice(order.totalPrice)}</p>
              </div>

              <div className="flex gap-3">
                {(() => {
                  const smartBtn = getSmartButton(order);
                  return smartBtn.to ? (
                    <Link
                      to={smartBtn.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${smartBtn.className}`}
                    >
                      {smartBtn.icon}
                      {smartBtn.text}
                    </Link>
                  ) : (
                    <button
                      onClick={smartBtn.action}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${smartBtn.className}`}
                    >
                      {smartBtn.icon}
                      {smartBtn.text}
                    </button>
                  );
                })()}
                <Link
                  to={`/orden/${order._id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <FaEye />
                  Detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisOrdenes;
