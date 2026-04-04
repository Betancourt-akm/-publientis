import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import { Context } from '../../context';
import PayPalCheckoutButton from '../../components/payment/PayPalCheckoutButton';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Colombia',
    paymentMethod: 'PayPal', // Por defecto tarjeta con PayPal
    notes: '',
  });

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getCart.url, {
        method: SummaryApi.getCart.method,
        credentials: SummaryApi.getCart.credentials,
      });

      const data = await response.json();

      if (data.success) {
        if (!data.data || data.data.items.length === 0) {
          toast.error('Tu carrito está vacío');
          navigate('/cart');
          return;
        }
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el carrito');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Solo manejar pago contra entrega aquí
    if (formData.paymentMethod !== 'Efectivo Contra Entrega') {
      return; // PayPal se maneja en su componente
    }

    // Validaciones
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setProcessing(true);

      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await fetch(SummaryApi.createOrder.url, {
        method: SummaryApi.createOrder.method,
        credentials: SummaryApi.createOrder.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Pedido realizado exitosamente!');
        navigate(`/order-success?orderId=${data.data._id}`);
      } else {
        toast.error(data.message || 'Error al crear la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la orden');
    } finally {
      setProcessing(false);
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
    return cart.totalPrice > 100000 ? 0 : 10000;
  };

  const calculateTax = () => {
    if (!cart) return 0;
    return Math.round(cart.totalPrice * 0.19);
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.totalPrice + calculateShipping() + calculateTax();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F2B705]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de contacto */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-[#1F3C88]" />
                Información de Contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#1F3C88]" />
                Dirección de Envío
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Dirección *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle, número, apartamento..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ciudad *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Código Postal *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">País</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Notas (Opcional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Instrucciones especiales de entrega..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaCreditCard className="text-[#1F3C88]" />
                Método de Pago
              </h2>

              <div className="space-y-3">
                {[
                  { value: 'PayPal', label: 'Tarjeta de Crédito/Débito', icon: '💳', description: 'Pago seguro procesado por PayPal' },
                  { value: 'Efectivo Contra Entrega', label: 'Pago Contra Entrega', icon: '🚚', description: 'Paga cuando recibas tu pedido' }
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formData.paymentMethod === method.value ? 'border-[#F2B705] bg-[#FFF9E6]' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="mr-3 text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{method.label}</span>
                      <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

              {/* Productos */}
              <div className="mb-4 pb-4 border-b max-h-60 overflow-y-auto">
                {cart?.items.map((item) => (
                  <div key={item.productId._id} className="flex gap-3 mb-3">
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-1">{item.productId.name}</p>
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={calculateShipping() === 0 ? 'text-green-600 font-semibold' : ''}>
                    {calculateShipping() === 0 ? 'GRATIS' : formatPrice(calculateShipping())}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (19%)</span>
                  <span>{formatPrice(calculateTax())}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-[#1F3C88]">{formatPrice(calculateTotal())}</span>
              </div>

              {/* Botón de pago directo con PayPal */}
              {formData.paymentMethod === 'PayPal' && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">💳</span>
                      Paga con tu Tarjeta
                    </h3>
                    <p className="text-sm text-gray-600">
                      Pago 100% seguro procesado por PayPal • Acepta Visa, Mastercard, Amex
                    </p>
                  </div>
                  
                  <PayPalCheckoutButton 
                    checkoutData={formData}
                    cartData={cart}
                    totalAmount={calculateTotal()}
                  />
                </div>
              )}

              {/* Botón para pago contra entrega */}
              {formData.paymentMethod === 'Efectivo Contra Entrega' && (
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </span>
                  ) : (
                    '📦 Realizar Pedido (Pago Contra Entrega)'
                  )}
                </button>
              )}


              <p className="text-xs text-gray-500 text-center mt-4">
                Al realizar el pedido, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
