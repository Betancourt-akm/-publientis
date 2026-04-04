import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaCheckCircle, FaShoppingBag, FaHome, FaMoneyBillWave } from 'react-icons/fa';
import { clearCartAsync } from '../../store/cartSlice';

/**
 * Página de confirmación para pedidos con pago contra entrega
 */
const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart, shippingInfo, paymentMethod, totalAmount } = location.state || {};

  useEffect(() => {
    // Si no hay datos, redirigir al carrito
    if (!cart || !shippingInfo) {
      navigate('/cart');
      return;
    }

    // Limpiar carrito después de confirmar el pedido
    dispatch(clearCartAsync());
  }, [cart, shippingInfo, navigate, dispatch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!cart || !shippingInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Encabezado de confirmación */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
            <FaCheckCircle className="text-green-600 text-6xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600">
            Tu pedido ha sido registrado correctamente.
          </p>
        </div>

        {/* Información del método de pago */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3 text-green-800">
            <FaMoneyBillWave className="text-2xl" />
            <div>
              <p className="font-semibold">Pago Contra Entrega</p>
              <p className="text-sm">Pagarás al recibir tu pedido</p>
            </div>
          </div>
        </div>

        {/* Información de envío */}
        <div className="mb-6 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Información de Envío</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Nombre:</span> {shippingInfo.fullName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Teléfono:</span> {shippingInfo.phone}
            </p>
            {shippingInfo.email && (
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {shippingInfo.email}
              </p>
            )}
            <p className="text-gray-700">
              <span className="font-semibold">Dirección:</span> {shippingInfo.address}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Ciudad:</span> {shippingInfo.city}
            </p>
            {shippingInfo.notes && (
              <p className="text-gray-700">
                <span className="font-semibold">Notas:</span> {shippingInfo.notes}
              </p>
            )}
          </div>
        </div>

        {/* Productos */}
        {cart?.items && cart.items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Productos</h2>
            <div className="space-y-3">
              {cart.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <img
                    src={item.productId.images[0] || '/placeholder.png'}
                    alt={item.productId.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.productId.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(cart?.totalPrice || 0)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>
                {cart?.totalPrice > 100000 ? (
                  <span className="text-green-600 font-semibold">GRATIS</span>
                ) : (
                  formatPrice(10000)
                )}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total a Pagar</span>
              <span className="text-green-600">{formatPrice(totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Instrucciones de Entrega</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Ten el monto exacto disponible: <strong>{formatPrice(totalAmount || 0)}</strong></li>
            <li>• El repartidor te contactará antes de la entrega</li>
            <li>• Verifica que el pedido esté completo antes de pagar</li>
            <li>• Tiempo estimado de entrega: 2-3 días hábiles</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/productos')}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaShoppingBag />
            Seguir Comprando
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaHome />
            Ir al Inicio
          </button>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Si tienes alguna pregunta, contáctanos a través de WhatsApp o por correo.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
