/**
 * Servicio de Búsqueda Avanzada y Filtros
 */

const Product = require('../models/productModel');

/**
 * Búsqueda avanzada con todos los filtros
 */
const advancedSearch = async (filters) => {
  try {
    const {
      search = '',
      category = '',
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      brand = '',
      minRating = 0,
      inStock = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters;

    // Construir query de búsqueda
    let query = {};

    // Búsqueda por texto
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por categoría
    if (category) {
      query.category = category;
    }

    // Filtro por rango de precio
    if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
      query.price = {};
      if (minPrice > 0) query.price.$gte = minPrice;
      if (maxPrice < Number.MAX_SAFE_INTEGER) query.price.$lte = maxPrice;
    }

    // Filtro por marca
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Filtro por rating
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }

    // Filtro por stock
    if (inStock !== null) {
      if (inStock === true || inStock === 'true') {
        query.stock = { $gt: 0 };
      } else {
        query.stock = 0;
      }
    }

    // Configurar ordenamiento
    let sortOptions = {};
    switch (sortBy) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        sortOptions.reviewCount = -1;
        break;
      case 'popularity':
        sortOptions.salesCount = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'name':
        sortOptions.name = 1;
        break;
      default:
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Ejecutar query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calcular páginas
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        search,
        category,
        priceRange: { min: minPrice, max: maxPrice },
        brand,
        minRating,
        inStock,
        sortBy
      }
    };
  } catch (error) {
    console.error('❌ Error en advancedSearch:', error);
    throw error;
  }
};

/**
 * Autocompletado de búsqueda
 */
const searchAutocomplete = async (query, limit = 10) => {
  try {
    if (!query || query.length < 2) {
      return { success: true, suggestions: [] };
    }

    // Buscar productos que coincidan
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      stock: { $gt: 0 } // Solo productos en stock
    })
      .select('name brand category price images')
      .limit(limit)
      .lean();

    // Extraer sugerencias únicas
    const suggestions = [];
    const seen = new Set();

    products.forEach(product => {
      // Agregar nombre del producto
      if (!seen.has(product.name.toLowerCase())) {
        suggestions.push({
          type: 'product',
          text: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          image: product.images[0],
          id: product._id
        });
        seen.add(product.name.toLowerCase());
      }

      // Agregar marca si coincide
      if (product.brand && product.brand.toLowerCase().includes(query.toLowerCase()) && !seen.has(`brand:${product.brand.toLowerCase()}`)) {
        suggestions.push({
          type: 'brand',
          text: product.brand,
          count: null
        });
        seen.add(`brand:${product.brand.toLowerCase()}`);
      }

      // Agregar categoría si coincide
      if (product.category && product.category.toLowerCase().includes(query.toLowerCase()) && !seen.has(`category:${product.category.toLowerCase()}`)) {
        suggestions.push({
          type: 'category',
          text: product.category,
          count: null
        });
        seen.add(`category:${product.category.toLowerCase()}`);
      }
    });

    return {
      success: true,
      query,
      suggestions: suggestions.slice(0, limit)
    };
  } catch (error) {
    console.error('❌ Error en searchAutocomplete:', error);
    throw error;
  }
};

/**
 * Obtener opciones de filtros disponibles
 */
const getFilterOptions = async () => {
  try {
    // Obtener categorías únicas
    const categories = await Product.distinct('category');

    // Obtener marcas únicas
    const brands = await Product.distinct('brand');

    // Obtener rango de precios
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    // Obtener conteo por categoría
    const categoryCount = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Obtener conteo por marca
    const brandCount = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      success: true,
      filters: {
        categories: categories.filter(c => c).sort(),
        brands: brands.filter(b => b).sort(),
        priceRange: {
          min: priceRange[0]?.minPrice || 0,
          max: priceRange[0]?.maxPrice || 1000000
        },
        categoryCount: categoryCount.map(c => ({
          category: c._id,
          count: c.count
        })),
        brandCount: brandCount.map(b => ({
          brand: b._id,
          count: b.count
        })),
        ratings: [5, 4, 3, 2, 1]
      }
    };
  } catch (error) {
    console.error('❌ Error en getFilterOptions:', error);
    throw error;
  }
};

/**
 * Búsqueda por categoría con filtros
 */
const searchByCategory = async (category, filters = {}) => {
  return advancedSearch({
    ...filters,
    category
  });
};

/**
 * Búsqueda por marca con filtros
 */
const searchByBrand = async (brand, filters = {}) => {
  return advancedSearch({
    ...filters,
    brand
  });
};

/**
 * Productos relacionados/similares
 */
const getSimilarProducts = async (productId, limit = 6) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return { success: false, message: 'Producto no encontrado' };
    }

    // Buscar productos similares por categoría o marca
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand }
      ],
      stock: { $gt: 0 }
    })
      .sort({ salesCount: -1, rating: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: similarProducts
    };
  } catch (error) {
    console.error('❌ Error en getSimilarProducts:', error);
    throw error;
  }
};

/**
 * Productos populares
 */
const getPopularProducts = async (limit = 10) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ salesCount: -1, rating: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: products
    };
  } catch (error) {
    console.error('❌ Error en getPopularProducts:', error);
    throw error;
  }
};

/**
 * Productos nuevos
 */
const getNewProducts = async (limit = 10) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: products
    };
  } catch (error) {
    console.error('❌ Error en getNewProducts:', error);
    throw error;
  }
};

module.exports = {
  advancedSearch,
  searchAutocomplete,
  getFilterOptions,
  searchByCategory,
  searchByBrand,
  getSimilarProducts,
  getPopularProducts,
  getNewProducts
};
