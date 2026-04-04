import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCartAsync } from "../../store/cartSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaShoppingBag, FaHome } from "react-icons/fa";
import SummaryApi from "../../common";
import { toast } from "react-toastify";

/**
 * PaymentSuccess Simple - Para pagos con PayPal Card
 * Guarda la transacción SOLO cuando status=APPROVED
 */
const PaymentSuccessSimple = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useSelector((state) => state.cart.cart);
  const user = useSelector((state) => state.user.user);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const savingRef = useRef(false); // Prevenir ejecuciones múltiples

  // Obtener parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const transactionStatus = queryParams.get("status");
  const referenceCode = queryParams.get("reference");
  const amountInCents = queryParams.get("amount_in_cents");
  const paymentMethod = queryParams.get("payment_method") || "paypal";

  /**
   * Guarda la transacción en la base de datos
   * SOLO si el estado es APPROVED
   */
  const saveTransactionInDB = async (transactionData) => {
    try {
      console.log("💾 Guardando transacción en DB:", transactionData);
      console.log("📤 JSON a enviar:", JSON.stringify(transactionData, null, 2));
      
      const response = await fetch(SummaryApi.createTransaction.url, {
        method: SummaryApi.createTransaction.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(transactionData),
      });

      console.log("📥 Response status:", response.status);
      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        console.log("✅ Transacción guardada exitosamente en la BD");
        toast.success("Transacción registrada correctamente");
        
        // Limpiar carrito después de guardar exitosamente
        dispatch(clearCartAsync());
      } else if (response.status === 409) {
        // Transacción duplicada - ya existe en BD, no es un error crítico
        console.log("⚠️ Transacción ya existe en BD (duplicada)");
        toast.info("Esta transacción ya fue registrada");
        
        // Limpiar carrito de todos modos
        dispatch(clearCartAsync());
      } else {
        console.error("❌ Error al guardar transacción:", data.message);
        toast.error("Error al registrar la transacción");
        // Si falla, permitir reintento
        setSaved(false);
      }
    } catch (error) {
      console.error("❌ Error al guardar la transacción:", error);
      // No mostrar error de conexión si ya se guardó
      if (!saved) {
        toast.error("Error de conexión al guardar la transacción");
        // Si falla, permitir reintento
        savingRef.current = false;
        setSaved(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // IMPORTANTE: Solo guardar si el estado es APPROVED
    if (transactionStatus === "APPROVED" && referenceCode && !saved && !savingRef.current) {
      console.log("✅ Pago APROBADO - Guardando transacción...");
      
      // Marcar como guardado INMEDIATAMENTE para evitar múltiples llamadas
      savingRef.current = true;
      setSaved(true);
      
      // Preparar datos de la transacción
      const items = cart?.items || [];
      
      // Calcular shipping cost
      const subtotal = cart?.totalPrice || 0;
      const shippingCost = subtotal > 100000 ? 0 : 10000;
      const totalPrice = subtotal + shippingCost;
      
      console.log("👤 Usuario actual:", user);
      console.log("👤 User ID:", user?._id);
      
      const transactionData = {
        reference: referenceCode,
        amountInCents: parseInt(amountInCents) || 0,
        status: transactionStatus,
        // Guardar detalles del producto para e-commerce
        productDetails: {
          paymentMethod: paymentMethod,
          items: items.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            image: item.productId.images?.[0] || '',
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: subtotal,
          shippingCost: shippingCost,
          totalPrice: totalPrice,
        },
        // Información de envío (opcional por ahora)
        shippingInfo: {
          // Se puede agregar dirección de envío aquí si está disponible
          estimatedDelivery: "3-5 días hábiles"
        }
      };
      
      // Solo agregar el campo 'user' si existe y es válido
      if (user && user._id) {
        transactionData.user = user._id;
        console.log("✅ Usuario agregado a la transacción:", user._id);
      } else {
        console.log("⚠️ No hay usuario logueado - transacción sin user");
      }

      saveTransactionInDB(transactionData);
    } else if (transactionStatus !== "APPROVED") {
      console.log("⚠️ Pago NO aprobado - NO se guardará en DB");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [transactionStatus, referenceCode, saved]); // eslint-disable-line

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Loading
  if (loading && transactionStatus === "APPROVED") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Procesando tu pago...</p>
      </div>
    );
  }

  // Pago Aprobado
  if (transactionStatus === "APPROVED") {
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
              Tu pago ha sido procesado correctamente.
            </p>
          </div>

          {/* Información de la transacción */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Referencia de Pago</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {referenceCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Pagado</p>
                <p className="text-lg font-semibold text-green-600">
                  ${(parseInt(amountInCents) / 100).toFixed(2)} USD
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="text-sm text-gray-800 capitalize">{paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Aprobado
                </span>
              </div>
            </div>
          </div>

          {/* Productos comprados */}
          {cart?.items && cart.items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Productos</h2>
              <div className="space-y-3">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.productId.images[0] || "/placeholder.png"}
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
                <span>{cart?.totalPrice > 100000 ? 'GRATIS' : formatPrice(10000)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">
                  {formatPrice((cart?.totalPrice || 0) + (cart?.totalPrice > 100000 ? 0 : 10000))}
                </span>
              </div>
            </div>
          </div>

          {/* Estado de guardado */}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-center">
                ✓ Tu pedido ha sido registrado correctamente en nuestro sistema
              </p>
            </div>
          )}

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
            <p>Recibirás un correo de confirmación con los detalles de tu pedido.</p>
          </div>
        </div>
      </div>
    );
  }

  // Pago Rechazado o Pendiente
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className={`border rounded-lg p-8 ${
        transactionStatus === "DECLINED" 
          ? "bg-red-50 border-red-200" 
          : "bg-yellow-50 border-yellow-200"
      }`}>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {transactionStatus === "DECLINED" ? "Pago Rechazado" : "Pago Pendiente"}
        </h1>
        <p className="text-gray-600 mb-6">
          {transactionStatus === "DECLINED" 
            ? "Tu pago fue rechazado. Por favor, intenta nuevamente con otro método de pago."
            : "Tu pago está en proceso. Te notificaremos cuando se confirme."
          }
        </p>
        <button
          onClick={() => navigate('/cart')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Volver al Carrito
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessSimple;
