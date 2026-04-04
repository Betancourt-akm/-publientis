import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaMinus, FaPlus, FaHeart, FaRegHeart, FaCheck, FaClock, FaShieldAlt, FaTruck, FaGift, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import useWishlist from '../../hooks/useWishlist';
import WishlistButton from '../../components/product/WishlistButton';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const { isInWishlist } = useWishlist();

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getProductById(id).url);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
      } else {
        toast.error('Producto no encontrado');
        navigate('/productos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el producto');
      navigate('/productos');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id, fetchProductDetails]);

  const handleAddToCart = async () => {
    try {
      const response = await fetch(SummaryApi.addToCart.url, {
        method: SummaryApi.addToCart.method,
        credentials: SummaryApi.addToCart.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Producto agregado al carrito');
      } else {
        toast.error(data.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Debes iniciar sesión para agregar productos al carrito');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Funciones para el zoom de imagen
  const handleImageMouseMove = (e) => {
    if (!isImageZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleImageClick = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate('/')}>Inicio</span>
          {' > '}
          <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate('/productos')}>Productos</span>
          {' > '}
          <span className="text-gray-800">{product.name}</span>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imágenes del producto */}
        <div>
          <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden relative group">
            <div 
              className={`relative cursor-pointer transition-all duration-300 ${
                isImageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={handleImageClick}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={() => setIsImageZoomed(false)}
            >
              <img
                src={product.images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className={`w-full h-96 object-contain transition-transform duration-300 ${
                  isImageZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                }`}
                style={
                  isImageZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
              />
              {/* Indicador de zoom */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {isImageZoomed ? 'Click para alejar' : 'Click para acercar'}
              </div>
            </div>
          </div>
          
          {/* Miniaturas */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setIsImageZoomed(false);
                  }}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-300 group ${
                    selectedImage === index 
                      ? 'border-teal-600 shadow-lg' 
                      : 'border-gray-300 hover:border-teal-400 hover:shadow-md'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-2">{product.brand}</p>
              <div className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </div>
            </div>
            {/* Botón de favoritos */}
            <WishlistButton 
              productId={product._id} 
              variant="floating"
              size="md"
              className="bg-white shadow-md hover:shadow-lg border border-gray-200"
            />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                  size={20}
                />
              ))}
            </div>
            <span className="text-gray-600">
              ({product.reviewsCount} {product.reviewsCount === 1 ? 'reseña' : 'reseñas'})
            </span>
          </div>

          {/* Precio */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg mb-6">
            {product.discount > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-4xl font-bold text-teal-600">
                    {formatPrice(product.finalPrice)}
                  </p>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    -{product.discount}% OFF
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </p>
                  <span className="text-green-600 font-semibold text-sm">
                    Ahorras {formatPrice(product.price - product.finalPrice)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-4xl font-bold text-teal-600">
                {formatPrice(product.price)}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-teal-600" />
              Descripción
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Características */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FaCheck className="text-green-600" />
                Características Principales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <FaCheck className="text-green-600 text-sm flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalles del Servicio */}
          {(product.serviceDuration || product.serviceIncludes || product.serviceRecommendations) && (
            <div className="mb-6">
              <button
                onClick={() => setShowServiceDetails(!showServiceDetails)}
                className="flex items-center justify-between w-full text-xl font-semibold mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Detalles del Servicio
                </div>
                {showServiceDetails ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              {showServiceDetails && (
                <div className="space-y-4">
                  {product.serviceDuration && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Duración</h4>
                      <p className="text-blue-700">{product.serviceDuration} minutos</p>
                    </div>
                  )}
                  
                  {product.serviceIncludes && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Incluye</h4>
                      <p className="text-green-700">{product.serviceIncludes}</p>
                    </div>
                  )}
                  
                  {product.serviceRecommendations && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Recomendaciones</h4>
                      <p className="text-yellow-700">{product.serviceRecommendations}</p>
                    </div>
                  )}
                  
                  {product.serviceIntensity && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Intensidad</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        product.serviceIntensity === 'ligero' ? 'bg-green-200 text-green-800' :
                        product.serviceIntensity === 'medio' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {product.serviceIntensity.charAt(0).toUpperCase() + product.serviceIntensity.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  {product.serviceAdditionalBenefits && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Beneficios Adicionales</h4>
                      <p className="text-indigo-700">{product.serviceAdditionalBenefits}</p>
                    </div>
                  )}
                  
                  {product.serviceRecommendedFrequency && (
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">Frecuencia Recomendada</h4>
                      <p className="text-pink-700">{product.serviceRecommendedFrequency}</p>
                    </div>
                  )}
                  
                  {product.serviceDiscountsPromotions && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Promociones Especiales</h4>
                      <p className="text-orange-700">{product.serviceDiscountsPromotions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Disponibilidad */}
          <div className="mb-6">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700">
              <FaCheck className="text-green-600" />
              <span className="font-semibold">Producto disponible</span>
            </div>
          </div>

          {/* Cantidad */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Cantidad</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaMinus />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-teal-600 text-white py-4 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaShoppingCart />
                Agregar al Carrito
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Comprar Ahora
              </button>
            </div>
            
            {/* Botón de favoritos adicional */}
            <div className="flex items-center justify-center">
              <WishlistButton 
                productId={product._id} 
                variant="outline"
                size="md"
                className="text-gray-600 hover:text-red-500 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                <FaTruck className="text-blue-600" />
                Envío y Entrega
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <FaGift className="text-blue-600" />
                  Envío gratis en compras superiores a $100,000
                </p>
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Entrega estimada: 2-5 días hábiles
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-800">
                <FaShieldAlt className="text-green-600" />
                Garantías
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <FaCheck className="text-green-600" />
                  Garantía de satisfacción 30 días
                </p>
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <FaCheck className="text-green-600" />
                  Producto 100% original
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
