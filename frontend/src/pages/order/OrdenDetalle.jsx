import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClipboard, FaDownload, FaRedo, FaStar, FaExclamationCircle, FaPhone } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';

const OrdenDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getOrderById(id).url, {
        method: SummaryApi.getOrderById(id).method,
        credentials: SummaryApi.getOrderById(id).credentials,
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error('Orden no encontrada');
        navigate('/mis-ordenes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la orden');
      navigate('/mis-ordenes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      return;
    }

    const cancelReason = prompt('Por favor, indica el motivo de la cancelación:');
    if (!cancelReason) return;

    try {
      const response = await fetch(SummaryApi.cancelOrder(id).url, {
        method: SummaryApi.cancelOrder(id).method,
        credentials: SummaryApi.cancelOrder(id).credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelReason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Orden cancelada exitosamente');
        setOrder(data.data);
      } else {
        toast.error(data.message || 'Error al cancelar la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cancelar la orden');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pendiente': <FaBox className="text-[#F2B705]" />,
      'Procesando': <FaClipboard className="text-[#1F3C88]" />,
      'Enviado': <FaTruck className="text-purple-600" />,
      'En Camino': <FaTruck className="text-[#F2B705]" />,
      'Entregado': <FaCheckCircle className="text-green-600" />,
      'Cancelado': <FaTimesCircle className="text-red-600" />,
    };
    return icons[status] || <FaBox />;
  };

  const getOrderTimeline = (order) => {
    // Timeline profesional según estado actual
    const allSteps = [
      { status: 'Pendiente', label: 'Orden creada', icon: FaBox },
      { status: 'Procesando', label: 'Preparando envío', icon: FaClipboard },
      { status: 'Enviado', label: 'Despachado', icon: FaTruck },
      { status: 'En Camino', label: 'En camino', icon: FaTruck },
      { status: 'Entregado', label: 'Entregado', icon: FaCheckCircle },
    ];

    const currentIndex = allSteps.findIndex(step => step.status === order.orderStatus);
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const getSmartActions = (order) => {
    const actions = [];
    const status = order.orderStatus;

    // Descargar factura (siempre disponible si está pagado)
    if (order.paymentStatus === 'Pagado') {
      actions.push({
        text: 'Descargar factura',
        icon: <FaDownload />,
        className: 'bg-gray-600 hover:bg-gray-700',
        action: () => toast.info('Descargando factura...')
      });
    }

    // Calificar (solo si está entregado)
    if (status === 'Entregado') {
      actions.push({
        text: 'Calificar compra',
        icon: <FaStar />,
        className: 'bg-[#F2B705] hover:bg-[#d9a305]',
        action: () => toast.info('Sistema de calificación próximamente')
      });
    }

    // Comprar de nuevo (si cancelado o entregado)
    if (status === 'Cancelado' || status === 'Entregado') {
      actions.push({
        text: 'Comprar de nuevo',
        icon: <FaRedo />,
        className: 'bg-[#1F3C88] hover:bg-[#162D66]',
        action: () => toast.info('Agregando al carrito...')
      });
    }

    // Contactar soporte
    actions.push({
      text: 'Contactar soporte',
      icon: <FaPhone />,
      className: 'bg-gray-600 hover:bg-gray-700',
      action: () => toast.info('Abriendo chat de soporte...')
    });

    // Abrir reclamo (solo si hay problema)
    if (status !== 'Cancelado' && status !== 'Entregado') {
      actions.push({
        text: 'Reportar problema',
        icon: <FaExclamationCircle />,
        className: 'bg-orange-600 hover:bg-orange-700',
        action: () => toast.info('Sistema de reclamos próximamente')
      });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F2B705]"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const canCancel = ['Pendiente', 'Procesando'].includes(order.orderStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/mis-ordenes')}
          className="text-[#1F3C88] hover:text-[#F2B705] mb-4 font-medium"
        >
          ← Volver a Mis Órdenes
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Orden #{order.orderNumber}</h1>
        <p className="text-gray-600">Realizada el {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Estado de la Orden</h2>
            
            {/* Timeline profesional */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                {getOrderTimeline(order).map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 relative">
                      {/* Línea conectora */}
                      {index < 4 && (
                        <div className={`absolute top-5 left-1/2 w-full h-1 ${
                          step.completed ? 'bg-[#F2B705]' : 'bg-gray-200'
                        }`} style={{ zIndex: 0 }} />
                      )}
                      
                      {/* Icono */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                        step.completed ? 'bg-[#F2B705] text-white' : 'bg-gray-200 text-gray-500'
                      } ${
                        step.current ? 'ring-4 ring-[#FFF9E6]' : ''
                      }`}>
                        <Icon className="text-lg" />
                      </div>
                      
                      {/* Label */}
                      <p className={`text-xs mt-2 text-center ${
                        step.completed ? 'text-gray-800 font-semibold' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estado actual destacado */}
            <div className="bg-[#FFF9E6] border border-[#F2B705]/30 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {getStatusIcon(order.orderStatus)}
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1F3C88]">{order.orderStatus}</p>
                  <p className="text-sm text-gray-600">Estado actual del pedido</p>
                </div>
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-[#1F3C88] p-4 rounded-lg mb-4">
                <p className="text-xs font-semibold text-gray-300 mb-1">Número de seguimiento</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-mono text-white font-bold">{order.trackingNumber}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.trackingNumber);
                      toast.success('Copiado al portapapeles');
                    }}
                    className="text-[#F2B705] hover:text-[#d9a305] text-sm font-medium"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}

            {/* Fechas importantes */}
            {order.deliveredAt && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm font-semibold text-green-800">
                  ✓ Entregado el {formatDate(order.deliveredAt)}
                </p>
              </div>
            )}

            {order.cancelledAt && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-red-900 mb-1">Orden cancelada</p>
                <p className="text-sm text-red-700">{formatDate(order.cancelledAt)}</p>
                {order.cancelReason && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Motivo:</span> {order.cancelReason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Productos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Productos</h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Cantidad: {item.quantity}</p>
                    <p className="text-lg font-bold text-[#1F3C88]">{formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Teléfono: {order.shippingAddress.phone}</p>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Notas:</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>

            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span className="text-[#1F3C88]">{formatPrice(order.totalPrice)}</span>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">Método de Pago</p>
              <p className="text-sm text-gray-600">{order.paymentMethod}</p>
              <p className="text-sm mt-2">
                Estado: <span className={`font-semibold ${
                  order.paymentStatus === 'Pagado' ? 'text-green-600' :
                  order.paymentStatus === 'Pendiente' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>

            {/* Acciones inteligentes */}
            <div className="space-y-2">
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold mb-4"
                >
                  Cancelar Orden
                </button>
              )}
              
              {getSmartActions(order).map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg transition-colors font-medium ${action.className}`}
                >
                  {action.icon}
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdenDetalle;
