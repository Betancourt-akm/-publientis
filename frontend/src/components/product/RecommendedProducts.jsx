/**
 * Componente de Productos Recomendados
 * Soporta múltiples algoritmos: also-bought, similar, personalized, trending, recently-viewed
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import SummaryApi from '../common';

const RecommendedProducts = ({
  type = 'personalized', // also-bought, similar, personalized, trending, recently-viewed
  productId = null,
  userId = null,
  title = 'Recomendados para ti',
  limit = 6,
  className = ''
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [type, productId, userId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';

      switch (type) {
        case 'also-bought':
          if (!productId) return;
          endpoint = `/api/recommendations/also-bought/${productId}?limit=${limit}`;
          break;
        case 'similar':
          if (!productId) return;
          endpoint = `/api/recommendations/similar/${productId}?limit=${limit}`;
          break;
        case 'personalized':
          endpoint = `/api/recommendations/personalized?limit=${limit}`;
          break;
        case 'recently-viewed':
          endpoint = `/api/recommendations/recently-viewed?limit=${limit}`;
          break;
        case 'trending':
          endpoint = `/api/recommendations/trending?limit=${limit}`;
          break;
        default:
          endpoint = `/api/recommendations/trending?limit=${limit}`;
      }

      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const getTitleByType = () => {
    const titles = {
      'also-bought': '🛍️ También compraron',
      'similar': '🔗 Productos similares',
      'personalized': '✨ Recomendados para ti',
      'recently-viewed': '👁️ Visto recientemente',
      'trending': '🔥 Productos trending'
    };
    return title || titles[type] || 'Recomendaciones';
  };

  if (loading) {
    return (
      <div className={`recommended-products ${className}`}>
        <h2 className="text-2xl font-bold mb-6">{getTitleByType()}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-2"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <div className={`recommended-products ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {getTitleByType()}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Implementar lógica de agregar al carrito
    console.log('Add to cart:', product._id);
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Implementar lógica de wishlist
    console.log('Add to wishlist:', product._id);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.algorithm === 'personalized' && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
              Para ti
            </span>
          )}
          {product.algorithm === 'trending' && (
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full">
              🔥 Trending
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              Últimas {product.stock}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <FaHeart className="text-red-500" />
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Agotado</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}

        {/* Name */}
        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-lg font-bold text-blue-600">
              ${product.price?.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            Agregar
          </button>
        )}
      </div>
    </Link>
  );
};

export default RecommendedProducts;
