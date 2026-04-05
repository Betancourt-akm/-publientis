import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCut, FaBox, FaStar } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import { ProductWishlistButton } from '../../components/product/WishlistButton';

const Categorias = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    document.title = 'Categorías - Publientis';
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(SummaryApi.getCategories.url);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getAllProducts.url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = categories.filter(category => 
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener productos por categoría
  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category).slice(0, 4);
  };

  // Contar productos por categoría
  const getProductCountByCategory = (category) => {
    return products.filter(product => product.category === category).length;
  };

  // Iconos por categoría
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'máquinas de afeitar':
        return <FaCut className="text-4xl text-teal-500" />;
      case 'recortadoras de barba':
        return <FaCut className="text-4xl text-blue-500" />;
      case 'cuidado facial':
        return <FaBox className="text-4xl text-green-500" />;
      default:
        return <FaBox className="text-4xl text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explora Nuestras Categorías
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra los mejores productos de grooming organizados por categorías
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => {
            const categoryProducts = getProductsByCategory(category);
            const productCount = getProductCountByCategory(category);
            
            return (
              <div
                key={category}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Header de la categoría */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 text-center">
                  <div className="mb-4">
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{category}</h2>
                  <p className="text-gray-300">
                    {productCount} producto{productCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Productos de muestra */}
                <div className="p-6">
                  {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {categoryProducts.map((product) => (
                        <Link
                          key={product._id}
                          to={`/producto/${product._id}`}
                          className="group"
                        >
                          <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <img
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="p-2">
                              <h4 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-teal-600">
                                {product.name}
                              </h4>
                              <p className="text-xs text-teal-600 font-bold mt-1">
                                {formatPrice(product.finalPrice || product.price)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaBox className="text-3xl mx-auto mb-2" />
                      <p>No hay productos en esta categoría</p>
                    </div>
                  )}

                  {/* Botón Ver Todos */}
                  <Link
                    to={`/productos?category=${encodeURIComponent(category)}`}
                    className="block w-full bg-teal-500 hover:bg-teal-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    Ver Todos los Productos
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensaje si no hay categorías */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontraron categorías
            </h3>
            <p className="text-gray-500">
              Intenta con un término de búsqueda diferente
            </p>
          </div>
        )}

        {/* Sección de productos destacados */}
        {products.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Productos Destacados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <Link to={`/producto/${product._id}`} className="block relative">
                    <div className="h-48 bg-gray-100 overflow-hidden relative">
                      <img
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Botón de favoritos flotante */}
                      <ProductWishlistButton productId={product._id} />
                      {/* Badge de descuento */}
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xs ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">(24)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.finalPrice || product.price)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categorias;
