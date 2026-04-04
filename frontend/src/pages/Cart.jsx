import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaTruck, FaMoneyBillWave, FaCreditCard, FaMapMarkerAlt } from 'react-icons/fa';
import { useLocation } from '../context/LocationContext';
import { toast } from 'react-toastify';
import {
  fetchCart,
  updateCartItemAsync,
  removeFromCartAsync,
  clearCartAsync,
} from '../store/cartSlice';
import PayPalCardButton from '../components/payment/PayPalCardButton';
import SummaryApi from '../common';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userLocation, getShippingInfo, openLocationModal } = useLocation();
  
  // Obtener estado del carrito desde Redux
  const { cart, loading, error } = useSelector((state) => state.cart);
  
  // Estados para el modal de envío y método de pago
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'paypal', 'wompi' o 'cash'
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [processingWompi, setProcessingWompi] = useState(false);

  useEffect(() => {
    // Cargar carrito al montar el componente
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    // Mostrar errores si existen
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      await dispatch(updateCartItemAsync({ productId, quantity })).unwrap();
      // No necesitamos toast de éxito, la UI se actualiza automáticamente
    } catch (error) {
      toast.error(error || 'Error al actualizar cantidad');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCartAsync(productId)).unwrap();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error(error || 'Error al eliminar producto');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      return;
    }

    try {
      await dispatch(clearCartAsync()).unwrap();
      toast.success('Carrito vaciado');
    } catch (error) {
      toast.error(error || 'Error al vaciar carrito');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateShipping = () => {
    if (!cart || cart.totalPrice === 0) return 0;
    const shippingInfo = getShippingInfo(cart.totalPrice);
    return shippingInfo.cost;
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.totalPrice + calculateShipping();
  };

  // Manejar cambios en el formulario de envío
  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  // Validar formulario de envío
  const validateShipping = () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error('Por favor completa todos los campos obligatorios');
      return false;
    }
    return true;
  };

  // Continuar con PayPal
  const handlePayPalCheckout = () => {
    if (!validateShipping()) return;
    setPaymentMethod('paypal');
    setShowShippingModal(false);
    // El componente PayPalCardButton se mostrará
  };

  // Continuar con Wompi
  const handleWompiCheckout = async () => {
    if (!validateShipping()) return;
    
    setProcessingWompi(true);
    setShowShippingModal(false);
    
    try {
      // Primero crear la orden en el backend
      const orderResponse = await fetch(SummaryApi.createOrder.url.replace('/payment/create-order', '/orders'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          shippingAddress: {
            fullName: shippingInfo.fullName,
            address: shippingInfo.address,
            city: shippingInfo.city,
            postalCode: '050001',
            country: 'Colombia',
            phone: shippingInfo.phone,
            email: shippingInfo.email || '',
          },
          paymentMethod: 'Wompi',
          subtotal: cart.totalPrice,
          shippingCost: calculateShipping(),
          tax: 0,
          totalPrice: calculateTotal(),
          notes: shippingInfo.notes,
        }),
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Error al crear la orden');
      }

      // Crear transacción en Wompi
      const wompiResponse = await fetch(SummaryApi.createWompiOrder.url, {
        method: SummaryApi.createWompiOrder.method,
        credentials: SummaryApi.createWompiOrder.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.data._id,
          paymentMethod: {
            type: 'CARD',
            installments: 1,
          },
        }),
      });

      const wompiData = await wompiResponse.json();
      
      if (wompiData.success && wompiData.checkoutUrl) {
        // Redirigir a la página de pago de Wompi
        toast.success('Redirigiendo a Wompi...');
        window.location.href = wompiData.checkoutUrl;
      } else {
        throw new Error(wompiData.message || 'Error al crear transacción en Wompi');
      }
    } catch (error) {
      console.error('Error en checkout Wompi:', error);
      toast.error(error.message || 'Error al procesar el pago con Wompi');
      setProcessingWompi(false);
    }
  };

  // Continuar con pago contra entrega
  const handleCashOnDelivery = () => {
    if (!validateShipping()) return;
    setPaymentMethod('cash');
    setShowShippingModal(false);
    
    // Redirigir a confirmación de pedido contra entrega
    navigate('/order-confirmation', {
      state: {
        cart,
        shippingInfo,
        paymentMethod: 'cash',
        totalAmount: calculateTotal()
      }
    });
  };

  // Estado de carga
  if (loading && !cart) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F2B705]"></div>
      </div>
    );
  }

  // Carrito vacío
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <FaShoppingBag className="mx-auto text-6xl text-gray-400 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">¡Agrega productos para comenzar a comprar!</p>
        <Link
          to="/productos"
          className="inline-block bg-[#1F3C88] text-white px-8 py-3 rounded-lg hover:bg-[#162D66] transition-colors font-semibold"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h2 className="text-xl font-semibold">
                Productos ({cart.totalItems})
              </h2>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-semibold"
              >
                Vaciar Carrito
              </button>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId._id}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  {/* Imagen */}
                  <Link to={`/producto/${item.productId._id}`}>
                    <img
                      src={item.productId.images[0] || '/placeholder.png'}
                      alt={item.productId.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Información */}
                  <div className="flex-1">
                    <Link to={`/producto/${item.productId._id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-[#1F3C88] mb-1">
                        {item.productId.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">{item.productId.brand}</p>
                    <p className="text-lg font-bold text-[#1F3C88]">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Cantidad y acciones */}
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => handleRemoveItem(item.productId._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 rounded-l-lg"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-4 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 rounded-r-lg"
                        disabled={item.quantity >= item.productId.stock}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Subtotal: <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

          <div className="space-y-3 mb-4 pb-4 border-b">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(cart?.totalPrice || 0)}</span>
            </div>
            
            {/* Ubicación y envío */}
            <div className="border-t border-gray-200 pt-3 mb-3">
              <button
                onClick={openLocationModal}
                className="w-full flex items-center justify-between p-3 bg-[#FFF9E6] rounded-lg hover:bg-[#FFF5CC] transition-colors mb-3"
              >
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#F2B705]" />
                  <div className="text-left">
                    <p className="text-xs text-gray-600">Enviar a:</p>
                    <p className="font-medium text-[#1F3C88]">
                      {userLocation ? `${userLocation.cityName}, ${userLocation.department}` : 'Selecciona tu ubicación'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#1F3C88] underline">Cambiar</span>
              </button>
              
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <FaTruck />
                  Envío {userLocation && `(${getShippingInfo(cart?.totalPrice).days} días)`}
                </span>
                <span className="flex items-center gap-1">
                  {calculateShipping() === 0 ? (
                    <span className="text-green-600 font-semibold">GRATIS</span>
                  ) : (
                    formatPrice(calculateShipping())
                  )}
                </span>
              </div>
              {cart.totalPrice < 100000 && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Agrega {formatPrice(100000 - cart.totalPrice)} más para envío gratis
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total</span>
            <span className="text-[#1F3C88]">{formatPrice(calculateTotal())}</span>
          </div>

          {/* Botones de pago */}
            {!paymentMethod && (
              <>
                <button
                  onClick={() => setShowShippingModal(true)}
                  className="w-full bg-[#F2B705] text-white py-3 rounded-lg hover:bg-[#d9a305] transition-colors font-semibold mb-4"
                >
                  Proceder al Pago
                </button>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Elige tu método de pago después de ingresar tu dirección
                </p>
              </>
            )}

            {/* PayPal Card Button */}
            {paymentMethod === 'paypal' && (
              <div className="mb-4">
                <p className="text-sm text-green-600 mb-2 text-center">
                  ✓ Información de envío completa
                </p>
                <PayPalCardButton
                  product={{
                    description: `Pedido Sako Pets - ${cart.totalItems} producto(s)`,
                    cost: (calculateTotal() / 4000).toFixed(2) // Convertir COP a USD
                  }}
                  cart={cart}
                  shippingInfo={shippingInfo}
                />
                <button
                  onClick={() => setPaymentMethod('')}
                  className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cambiar método de pago
                </button>
              </div>
            )}

            {/* Confirmación de pago contra entrega */}
            {paymentMethod === 'cash' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-semibold text-center">
                  ✓ Pedido confirmado - Pago contra entrega
                </p>
              </div>
            )}

            <Link
              to="/productos"
              className="block text-center text-[#1F3C88] hover:text-[#162D66] font-semibold"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de información de envío */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Información de Envío</h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="300 123 4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Dirección Completa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle 45 # 23-12, Apto 301"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Medellín"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    name="notes"
                    value={shippingInfo.notes}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Indicaciones especiales, código de entrada, etc."
                    rows="3"
                  />
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-semibold mb-3">Selecciona tu método de pago:</h3>
                  
                  <div className="space-y-3">
                    {/* Wompi - Colombia */}
                    <button
                      type="button"
                      onClick={handleWompiCheckout}
                      disabled={processingWompi}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      <FaCreditCard />
                      {processingWompi ? 'Procesando...' : 'Wompi - Tarjeta/PSE/Nequi (COP)'}
                    </button>

                    {/* PayPal / Tarjeta */}
                    <button
                      type="button"
                      onClick={handlePayPalCheckout}
                      className="w-full flex items-center justify-center gap-3 bg-[#1F3C88] text-white py-3 px-4 rounded-lg hover:bg-[#162D66] transition-colors font-semibold"
                    >
                      <FaTruck />
                      PayPal - Tarjeta Internacional (USD)
                    </button>

                    {/* Contra Entrega */}
                    <button
                      type="button"
                      onClick={handleCashOnDelivery}
                      className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <FaMoneyBillWave />
                      Pago Contra Entrega
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-800">
                      💳 <strong>Wompi (Recomendado para Colombia):</strong> Paga en pesos colombianos con tarjeta, PSE, Nequi o Bancolombia QR.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
