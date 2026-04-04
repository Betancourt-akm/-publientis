import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearCartAsync } from "../../store/cartSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaShoppingBag, FaHome } from "react-icons/fa";
import "./PaymentSuccess.css";
import SummaryApi from "../../common";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados locales
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");

  // Cargar información de la orden
  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SummaryApi.getOrderById(orderId).url}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        // Limpiar carrito después de pago exitoso
        dispatch(clearCartAsync());
      } else {
        toast.error('No se pudo cargar la información de la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar detalles de la orden');
    } finally {
      setLoading(false);
    }
  }, [orderId, dispatch]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId, fetchOrderDetails]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No se encontró información de la orden
          </h1>
          <p className="text-gray-600 mb-6">
            No pudimos obtener los detalles de tu pedido.
          </p>
          <button
            onClick={() => navigate('/mis-ordenes')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ver Mis Órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Encabezado de éxito */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
            <FaCheckCircle className="text-green-600 text-6xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Gracias por tu compra. Tu orden ha sido procesada correctamente.
          </p>
        </div>

        {/* Información de la orden */}
        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Número de Orden</p>
              <p className="text-lg font-semibold text-gray-800">
                {order.orderNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {order.transactionId && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">ID de Transacción</p>
              <p className="text-sm font-mono text-gray-800">
                {order.transactionId}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">Fecha de Pago</p>
            <p className="text-sm text-gray-800">
              {new Date(order.paidAt || order.createdAt).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Productos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dirección de envío */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Dirección de Envío</h3>
          <p className="text-sm text-gray-700">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-gray-700">{order.shippingAddress.address}</p>
          <p className="text-sm text-gray-700">
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
          </p>
          <p className="text-sm text-gray-700">{order.shippingAddress.phone}</p>
        </div>

        {/* Totales */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
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
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total Pagado</span>
              <span className="text-green-600">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/mis-ordenes')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaShoppingBag />
            Ver Mis Órdenes
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaHome />
            Ir al Inicio
          </button>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Recibirás un correo de confirmación con los detalles de tu pedido.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
