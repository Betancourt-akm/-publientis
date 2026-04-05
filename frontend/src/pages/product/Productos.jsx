import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaFilter } from 'react-icons/fa';
import SummaryApi from '../../common';
import { toast } from 'react-toastify';
import { ProductWishlistButton } from '../../components/product/WishlistButton';
import WishlistButton from '../../components/product/WishlistButton';
import SEO from '../../components/SEO';

const Productos = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  // const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 }); // Para futura implementación
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedBrand, sortBy, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getAllProducts.url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(SummaryApi.getCategories.url);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(SummaryApi.getBrands.url);
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtro por marca
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Ordenamiento
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(SummaryApi.addToCart.url, {
        method: SummaryApi.addToCart.method,
        credentials: SummaryApi.addToCart.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Ofertas y Productos"
        description="Descubre ofertas laborales, prácticas pedagógicas y oportunidades para egresados universitarios en Publientis."
        url="https://publientis.online/ofertas"
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Nuestros Productos</h1>
        <p className="text-gray-600">Encuentra las mejores máquinas de afeitar y productos de grooming</p>
      </div>

      {/* Filtros y Ordenamiento */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <FaFilter /> Filtros
        </button>

        <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 w-full md:w-auto`}>
          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Marca */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las Marcas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Más Recientes</option>
            <option value="popular">Más Populares</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>

        <div className="text-gray-600">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <Link to={`/producto/${product._id}`} className="block relative">
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    -{product.discount}%
                  </span>
                )}
                {/* Botón de favoritos flotante */}
                <ProductWishlistButton productId={product._id} />
                <div className="h-64 overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/producto/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                      size={14}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({product.reviewsCount})</span>
                </div>

                <div className="mb-4">
                  {product.discount > 0 ? (
                    <>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(product.finalPrice)}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="flex-1 bg-[#F2B705] text-white py-2 rounded-lg hover:bg-[#d9a305] transition-colors flex items-center justify-center gap-2"
                    disabled={product.stock === 0}
                  >
                    <FaShoppingCart />
                    {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </button>
                  {/* Botón de favoritos inline */}
                  <WishlistButton 
                    productId={product._id} 
                    variant="minimal"
                    size="md"
                    className="text-gray-600 hover:text-red-500 p-2 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Productos;
