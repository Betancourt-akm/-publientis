import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaShoppingCart, FaStar, FaMinus, FaPlus, FaHeart, FaRegHeart, 
  FaCheck, FaClock, FaShieldAlt, FaTruck, FaGift, FaInfoCircle, 
  FaChevronDown, FaChevronUp, FaChevronRight, FaHome, FaShareAlt,
  FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaCopy, FaTag,
  FaBox, FaUndo, FaCertificate, FaBolt, FaTimes
} from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import useWishlist from '../../hooks/useWishlist';
import WishlistButton from '../../components/product/WishlistButton';
import ProductReviews from '../../components/product/ProductReviews';
import ReviewForm from '../../components/product/ReviewForm';
import { Context } from '../../context';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = React.useContext(Context);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, fetchProductDetails]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
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
        toast.success('✅ Producto agregado al carrito', {
          position: 'bottom-right',
          autoClose: 2000
        });
      } else {
        toast.error(data.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Debes iniciar sesión para agregar productos al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    setTimeout(() => navigate('/cart'), 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleImageMouseMove = (e) => {
    if (!isImageZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const shareProduct = (platform) => {
    const url = window.location.href;
    const text = `¡Mira este producto! ${product.name}`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('¡Link copiado al portapapeles!');
      setShowShareModal(false);
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      setShowShareModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#F2B705] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const savings = product.discount > 0 ? product.price - product.finalPrice : 0;
  const discountPercentage = product.discount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Breadcrumb mejorado */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm overflow-x-auto">
            <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-[#1F3C88] transition-colors whitespace-nowrap">
              <FaHome />
              Inicio
            </Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            <Link to="/productos" className="text-gray-600 hover:text-[#1F3C88] transition-colors whitespace-nowrap">
              Productos
            </Link>
            <FaChevronRight className="text-gray-400 text-xs" />
            {product.category && (
              <>
                <span className="text-gray-600 hover:text-[#1F3C88] cursor-pointer transition-colors whitespace-nowrap">
                  {product.category}
                </span>
                <FaChevronRight className="text-gray-400 text-xs" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Columna de imágenes - 7 columnas */}
          <div className="lg:col-span-7">
            <div className="sticky top-20">
              {/* Imagen principal */}
              <div className="mb-4 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 relative group">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {discountPercentage > 0 && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                      -{discountPercentage}% OFF
                    </div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      ¡Solo {product.stock} disponibles!
                    </div>
                  )}
                  {product.featured && (
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                      <FaBolt /> Destacado
                    </div>
                  )}
                </div>

                {/* Botones de acción superior derecha */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                  >
                    <FaShareAlt className="text-gray-700" />
                  </button>
                  <WishlistButton 
                    productId={product._id} 
                    variant="floating"
                    size="md"
                    className="bg-white shadow-lg hover:shadow-xl"
                  />
                </div>

                <div 
                  className="relative cursor-zoom-in overflow-hidden"
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={() => setIsImageZoomed(false)}
                >
                  <img
                    src={product.images?.[selectedImage] || '/placeholder.png'}
                    alt={product.name}
                    className={`w-full h-[500px] object-contain transition-transform duration-500 ${
                      isImageZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                    }`}
                    style={
                      isImageZoomed
                        ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                        : {}
                    }
                  />
                </div>

                {/* Indicador de zoom */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  🔍 Click para acercar
                </div>
              </div>
              
              {/* Miniaturas mejoradas */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedImage(index);
                        setIsImageZoomed(false);
                      }}
                      className={`cursor-pointer border-3 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        selectedImage === index 
                          ? 'border-[#F2B705] shadow-lg ring-2 ring-[#F2B705]/30' 
                          : 'border-gray-200 hover:border-[#F2B705] shadow-md hover:shadow-xl'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center border border-green-100">
                  <FaShieldAlt className="text-green-600 text-2xl mx-auto mb-2" />
                  <p className="text-xs font-semibold text-green-800">Compra Segura</p>
                </div>
                <div className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF5CC] p-4 rounded-xl text-center border border-[#F2B705]/20">
                  <FaTruck className="text-[#1F3C88] text-2xl mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#1F3C88]">Envío Rápido</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border border-purple-100">
                  <FaUndo className="text-purple-600 text-2xl mx-auto mb-2" />
                  <p className="text-xs font-semibold text-purple-800">Devolución 30 días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de información - 5 columnas */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 sticky top-20">
              {/* Header del producto */}
              <div className="mb-6">
                {/* Editorial y categoría */}
                <div className="flex items-center gap-2 mb-3">
                  {product.brand && (
                    <span className="text-sm font-semibold text-[#1F3C88] bg-[#FFF9E6] px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Nombre del producto */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Rating y reviews */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < Math.floor(product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}
                        size={18}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {product.rating || 4.0} ({product.reviewsCount || 0} reseñas)
                  </span>
                </div>

                {/* SKU */}
                {product.sku && (
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                )}
              </div>

              {/* Precio */}
              <div className="bg-gradient-to-r from-[#FFF9E6] via-[#FFF5CC] to-[#FFF9E6] p-6 rounded-2xl mb-6 border border-[#F2B705]/20">
                {discountPercentage > 0 ? (
                  <>
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(product.finalPrice)}
                      </p>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Ahorras {formatPrice(savings)}
                      </span>
                      <span className="text-green-600 font-semibold text-sm">
                        ({discountPercentage}% de descuento)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>

              {/* Stock y disponibilidad */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <FaCheck className="text-green-600 text-xl" />
                    <div>
                      <p className="font-semibold text-green-800">En stock</p>
                      <p className="text-sm text-green-600">{product.stock} unidades disponibles</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                    <FaTimes className="text-red-600" />
                    <p className="font-semibold text-red-800">Producto agotado</p>
                  </div>
                )}
              </div>

              {/* Selector de cantidad */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3 text-gray-900">Cantidad</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-bold text-xl shadow-md hover:shadow-lg active:scale-95"
                    >
                      <FaMinus className="mx-auto" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-24 text-center text-xl font-bold border-2 border-gray-200 rounded-xl py-3 focus:ring-4 focus:ring-[#F2B705]/20 focus:border-[#F2B705] transition-all"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-bold text-xl shadow-md hover:shadow-lg active:scale-95"
                    >
                      <FaPlus className="mx-auto" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {product.stock > 0 && (
                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart />
                        Agregar al Carrito
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
                  >
                    Comprar Ahora
                  </button>
                </div>
              )}

              {/* Información de envío */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#FFF9E6] to-[#FFF5CC] rounded-xl border border-[#F2B705]/20">
                  <FaTruck className="text-[#1F3C88] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1F3C88] mb-1">Envío gratis</p>
                    <p className="text-sm text-[#1F3C88]/80">En compras superiores a $100,000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <FaClock className="text-green-600 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">Entrega rápida</p>
                    <p className="text-sm text-green-700">2-5 días hábiles</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <FaCertificate className="text-purple-600 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1">Garantía</p>
                    <p className="text-sm text-purple-700">30 días de satisfacción garantizada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Descripción, Especificaciones, Reseñas */}
        <div className="mt-10 bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Tabs Header */}
          <div className="border-b border-gray-200">
            <div className="flex gap-4 p-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                  activeTab === 'description'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Descripción
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                  activeTab === 'specifications'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Especificaciones
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaStar className="text-yellow-500" />
                Reseñas ({product.reviewsCount || 0})
              </button>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="p-6 lg:p-8">
            {/* Descripción */}
            {activeTab === 'description' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-[#1F3C88]" />
                  Descripción del Producto
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>

                {/* Características */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaCheck className="text-green-600" />
                      Características Principales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <FaCheck className="text-green-600 text-lg mt-1 flex-shrink-0" />
                          <span className="text-gray-800 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Especificaciones */}
            {activeTab === 'specifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Especificaciones Técnicas</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Editorial/Autor:</span>
                    <span className="text-gray-900">{product.brand}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                    <span className="font-semibold text-gray-700">Categoría:</span>
                    <span className="text-gray-900">{product.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Stock disponible:</span>
                    <span className="text-gray-900">{product.stock} unidades</span>
                  </div>
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    Object.entries(product.specifications).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                        <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Reseñas */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  Reseñas de Clientes
                </h2>
                
                {/* Formulario para crear reseña */}
                {user && (
                  <ReviewForm 
                    productId={product._id} 
                    productName={product.name}
                    onSuccess={() => setRefreshReviews(prev => prev + 1)}
                  />
                )}

                {/* Lista de reseñas */}
                <ProductReviews 
                  productId={product._id} 
                  userId={user?._id}
                  key={refreshReviews}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Compartir Producto</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareProduct('facebook')}
                className="flex items-center justify-center gap-2 p-4 bg-[#1F3C88] text-white rounded-xl hover:bg-[#162D66] transition-colors"
              >
                <FaFacebook className="text-xl" />
                Facebook
              </button>
              <button
                onClick={() => shareProduct('twitter')}
                className="flex items-center justify-center gap-2 p-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
              >
                <FaTwitter className="text-xl" />
                Twitter
              </button>
              <button
                onClick={() => shareProduct('whatsapp')}
                className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp className="text-xl" />
                WhatsApp
              </button>
              <button
                onClick={() => shareProduct('telegram')}
                className="flex items-center justify-center gap-2 p-4 bg-[#1F3C88] text-white rounded-xl hover:bg-[#162D66] transition-colors"
              >
                <FaTelegram className="text-xl" />
                Telegram
              </button>
              <button
                onClick={() => shareProduct('copy')}
                className="col-span-2 flex items-center justify-center gap-2 p-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <FaCopy className="text-xl" />
                Copiar Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoDetalle;
