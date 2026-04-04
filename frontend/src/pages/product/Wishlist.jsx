import React, { useState, useEffect, useContext } from 'react';
import { FaHeart, FaShoppingCart, FaTrash, FaStar, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import { Context } from '../../context';
const Wishlist = () => {
  // Función para formatear precios (igual que en Home)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, fetchUserAddToCart } = useContext(Context);

  // Cargar wishlist
  const loadWishlist = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await fetch(`${SummaryApi.getWishlist.url}?page=${pageNum}&limit=20`, {
        method: SummaryApi.getWishlist.method,
        credentials: SummaryApi.getWishlist.credentials,
      });

      const responseData = await response.json();

      if (responseData.success) {
        const newItems = responseData.data.items || [];
        
        if (reset || pageNum === 1) {
          setWishlistItems(newItems);
        } else {
          setWishlistItems(prev => [...prev, ...newItems]);
        }
        
        setHasMore(responseData.data.hasMore);
        setPage(pageNum);
      } else {
        toast.error(responseData.message || 'Error al cargar favoritos');
      }
    } catch (error) {
      console.error('Error al cargar wishlist:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  // Remover de favoritos
  const removeFromWishlist = async (productId) => {
    try {
      setRemoving(prev => ({ ...prev, [productId]: true }));
      
      const response = await fetch(SummaryApi.removeFromWishlist(productId).url, {
        method: SummaryApi.removeFromWishlist(productId).method,
        credentials: 'include',
      });

      const responseData = await response.json();

      if (responseData.success) {
        setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
        toast.success('Producto removido de favoritos');
      } else {
        toast.error(responseData.message || 'Error al remover de favoritos');
      }
    } catch (error) {
      console.error('Error al remover de wishlist:', error);
      toast.error('Error al remover de favoritos');
    } finally {
      setRemoving(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Agregar al carrito
  const addToCart = async (productId) => {
    try {
      const response = await fetch(SummaryApi.addToCartProduct.url, {
        method: SummaryApi.addToCartProduct.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success('Producto agregado al carrito');
        fetchUserAddToCart();
      } else {
        toast.error(responseData.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  // Limpiar toda la wishlist
  const clearWishlist = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
      return;
    }

    try {
      const response = await fetch(SummaryApi.clearWishlist.url, {
        method: SummaryApi.clearWishlist.method,
        credentials: SummaryApi.clearWishlist.credentials,
      });

      const responseData = await response.json();

      if (responseData.success) {
        setWishlistItems([]);
        toast.success('Favoritos eliminados');
      } else {
        toast.error(responseData.message || 'Error al limpiar favoritos');
      }
    } catch (error) {
      console.error('Error al limpiar wishlist:', error);
      toast.error('Error al limpiar favoritos');
    }
  };

  // Cargar más productos
  const loadMore = () => {
    if (hasMore && !loading) {
      loadWishlist(page + 1, false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadWishlist(1, true);
    }
  }, [user]);

  if (!user?._id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Inicia sesión para ver tus favoritos
          </h2>
          <p className="text-gray-500 mb-6">
            Guarda tus productos favoritos para encontrarlos fácilmente
          </p>
          <Link
            to="/login"
            className="bg-[#1F3C88] text-white px-6 py-3 rounded-lg hover:bg-[#162D66] transition-colors font-medium"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaHeart className="text-2xl text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mis Favoritos
                </h1>
                <p className="text-gray-600">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
            </div>
            
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTrash />
                <span>Limpiar todo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && wishlistItems.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2B705]"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Tu lista de favoritos está vacía
            </h2>
            <p className="text-gray-500 mb-6">
              Explora nuestros productos y agrega tus favoritos haciendo clic en el corazón
            </p>
            <Link
              to="/productos"
              className="bg-[#1F3C88] text-white px-6 py-3 rounded-lg hover:bg-[#162D66] transition-colors font-medium inline-block"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const product = item.productId;
                if (!product) return null;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative group">
                      <Link to={`/producto/${product._id}`}>
                        <img
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      
                      {/* Remove from wishlist button */}
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        disabled={removing[product._id]}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        {removing[product._id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <FaHeart className="text-red-500" />
                        )}
                      </button>

                      {/* Quick view button */}
                      <Link
                        to={`/producto/${product._id}`}
                        className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FaEye className="text-gray-600" />
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-[#1F3C88] font-medium bg-[#FFF9E6] px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      
                      <Link to={`/producto/${product._id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#1F3C88] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Brand */}
                      {product.brand && (
                        <p className="text-sm text-gray-500 mb-2">
                          {product.brand}
                        </p>
                      )}

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-xs ${
                                i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.reviews || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.finalPrice || product.price)}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        {product.discount > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(product._id)}
                        className="w-full bg-[#F2B705] text-white py-2 px-4 rounded-lg hover:bg-[#d9a305] transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <FaShoppingCart />
                        <span>Agregar al Carrito</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Cargar más productos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
