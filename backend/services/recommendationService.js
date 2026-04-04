/**
 * Servicio de Recomendaciones de Productos
 * Algoritmos: También Compraron, Visto Recientemente, Similares, ML Básico
 */

const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const ProductView = require('../models/productViewModel');

/**
 * 1. TAMBIÉN COMPRARON (Collaborative Filtering)
 * "Clientes que compraron X también compraron Y"
 */
const getAlsoBought = async (productId, limit = 6) => {
  try {
    // Encontrar órdenes que contienen este producto
    const ordersWithProduct = await Order.find({
      'items.productId': productId,
      paymentStatus: 'Pagado'
    }).select('items userId');

    if (ordersWithProduct.length === 0) {
      return { success: true, products: [], algorithm: 'also_bought' };
    }

    // Extraer IDs de usuarios que compraron este producto
    const userIds = ordersWithProduct.map(order => order.userId);

    // Encontrar todos los productos que compraron estos usuarios
    const relatedOrders = await Order.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          paymentStatus: 'Pagado'
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.productId': { $ne: productId } // Excluir el producto original
        }
      },
      {
        $group: {
          _id: '$items.productId',
          purchaseCount: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { purchaseCount: -1, totalQuantity: -1 } },
      { $limit: limit }
    ]);

    // Poblar información de productos
    const productIds = relatedOrders.map(item => item._id);
    const products = await Product.find({
      _id: { $in: productIds },
      stock: { $gt: 0 }
    }).lean();

    // Ordenar productos según el score
    const productsWithScore = products.map(product => {
      const score = relatedOrders.find(
        item => item._id.toString() === product._id.toString()
      );
      return {
        ...product,
        recommendationScore: score.purchaseCount,
        algorithm: 'also_bought'
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);

    return {
      success: true,
      products: productsWithScore,
      algorithm: 'also_bought',
      totalRelatedOrders: ordersWithProduct.length
    };
  } catch (error) {
    console.error('❌ Error en getAlsoBought:', error);
    throw error;
  }
};

/**
 * 2. VISTO RECIENTEMENTE
 * Productos que el usuario ha visto recientemente
 */
const getRecentlyViewed = async (userId, limit = 10) => {
  try {
    const recentViews = await ProductView.find({ userId })
      .sort({ lastViewedAt: -1 })
      .limit(limit)
      .populate({
        path: 'productId',
        match: { stock: { $gt: 0 } } // Solo productos en stock
      })
      .lean();

    // Filtrar productos que existen (no deleted)
    const products = recentViews
      .filter(view => view.productId)
      .map(view => ({
        ...view.productId,
        lastViewedAt: view.lastViewedAt,
        viewCount: view.viewCount,
        algorithm: 'recently_viewed'
      }));

    return {
      success: true,
      products,
      algorithm: 'recently_viewed'
    };
  } catch (error) {
    console.error('❌ Error en getRecentlyViewed:', error);
    throw error;
  }
};

/**
 * 3. PRODUCTOS SIMILARES (Content-Based Filtering)
 * Basado en categoría, marca, rango de precio
 */
const getSimilarProducts = async (productId, limit = 6) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return { success: false, message: 'Producto no encontrado' };
    }

    // Calcular rango de precio (±30%)
    const priceMin = product.price * 0.7;
    const priceMax = product.price * 1.3;

    // Buscar productos similares con scoring
    const similarProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: product._id },
          stock: { $gt: 0 }
        }
      },
      {
        $addFields: {
          similarityScore: {
            $add: [
              // +3 puntos si misma categoría
              { $cond: [{ $eq: ['$category', product.category] }, 3, 0] },
              // +2 puntos si misma marca
              { $cond: [{ $eq: ['$brand', product.brand] }, 2, 0] },
              // +1 punto si rango de precio similar
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$price', priceMin] },
                      { $lte: ['$price', priceMax] }
                    ]
                  },
                  1,
                  0
                ]
              }
            ]
          }
        }
      },
      { $match: { similarityScore: { $gte: 1 } } }, // Al menos 1 punto de similitud
      { $sort: { similarityScore: -1, rating: -1, salesCount: -1 } },
      { $limit: limit }
    ]);

    const productsWithAlgorithm = similarProducts.map(p => ({
      ...p,
      algorithm: 'similar_products'
    }));

    return {
      success: true,
      products: productsWithAlgorithm,
      algorithm: 'similar_products',
      basedOn: {
        category: product.category,
        brand: product.brand,
        priceRange: { min: priceMin, max: priceMax }
      }
    };
  } catch (error) {
    console.error('❌ Error en getSimilarProducts:', error);
    throw error;
  }
};

/**
 * 4. RECOMENDADOS PARA TI (ML Básico - User-Based)
 * Basado en historial de compras, vistas y preferencias
 */
const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    // 1. Obtener perfil del usuario
    const userProfile = await buildUserProfile(userId);

    if (!userProfile.hasData) {
      // Si no hay datos, retornar productos populares
      return getTrendingProducts(limit);
    }

    // 2. Buscar productos que coincidan con el perfil
    const recommendations = await Product.aggregate([
      {
        $match: {
          stock: { $gt: 0 }
        }
      },
      {
        $addFields: {
          personalScore: {
            $add: [
              // Score por categoría favorita (peso 4)
              {
                $cond: [
                  { $in: ['$category', userProfile.favoriteCategories] },
                  { $multiply: [4, { $indexOfArray: [userProfile.favoriteCategories, '$category'] }] },
                  0
                ]
              },
              // Score por marca favorita (peso 3)
              {
                $cond: [
                  { $in: ['$brand', userProfile.favoriteBrands] },
                  3,
                  0
                ]
              },
              // Score por rango de precio preferido (peso 2)
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$price', userProfile.avgPriceRange.min] },
                      { $lte: ['$price', userProfile.avgPriceRange.max] }
                    ]
                  },
                  2,
                  0
                ]
              },
              // Boost por rating alto (peso 1)
              { $cond: [{ $gte: ['$rating', 4.5] }, 1, 0] }
            ]
          }
        }
      },
      { $match: { personalScore: { $gte: 2 } } }, // Mínimo 2 puntos
      { $sort: { personalScore: -1, rating: -1, salesCount: -1 } },
      { $limit: limit }
    ]);

    // Excluir productos ya comprados recientemente
    const recentPurchases = await getRecentPurchases(userId, 30);
    const recentPurchaseIds = recentPurchases.map(p => p._id.toString());
    
    const filteredRecommendations = recommendations
      .filter(p => !recentPurchaseIds.includes(p._id.toString()))
      .map(p => ({
        ...p,
        algorithm: 'personalized',
        personalScore: p.personalScore
      }));

    return {
      success: true,
      products: filteredRecommendations,
      algorithm: 'personalized',
      userProfile: {
        favoriteCategories: userProfile.favoriteCategories,
        favoriteBrands: userProfile.favoriteBrands,
        avgPriceRange: userProfile.avgPriceRange
      }
    };
  } catch (error) {
    console.error('❌ Error en getPersonalizedRecommendations:', error);
    throw error;
  }
};

/**
 * CONSTRUIR PERFIL DE USUARIO
 * Analiza historial de compras y vistas
 */
const buildUserProfile = async (userId) => {
  try {
    // Obtener compras del último año
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    
    const purchases = await Order.aggregate([
      {
        $match: {
          userId,
          paymentStatus: 'Pagado',
          createdAt: { $gte: oneYearAgo }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          categories: { $push: '$product.category' },
          brands: { $push: '$product.brand' },
          prices: { $push: '$product.price' }
        }
      }
    ]);

    // Obtener vistas recientes
    const recentViews = await ProductView.find({ userId })
      .sort({ lastViewedAt: -1 })
      .limit(50)
      .lean();

    if (purchases.length === 0 && recentViews.length === 0) {
      return { hasData: false };
    }

    // Analizar categorías favoritas
    const allCategories = [
      ...(purchases[0]?.categories || []),
      ...recentViews.map(v => v.productCategory).filter(Boolean)
    ];
    const categoryFrequency = getFrequency(allCategories);
    const favoriteCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Analizar marcas favoritas
    const allBrands = [
      ...(purchases[0]?.brands || []),
      ...recentViews.map(v => v.productBrand).filter(Boolean)
    ];
    const brandFrequency = getFrequency(allBrands);
    const favoriteBrands = Object.entries(brandFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand]) => brand);

    // Calcular rango de precio promedio
    const allPrices = [
      ...(purchases[0]?.prices || []),
      ...recentViews.map(v => v.productPrice).filter(Boolean)
    ];
    const avgPrice = allPrices.length > 0
      ? allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length
      : 50000;

    return {
      hasData: true,
      favoriteCategories,
      favoriteBrands,
      avgPriceRange: {
        min: avgPrice * 0.6,
        max: avgPrice * 1.4
      }
    };
  } catch (error) {
    console.error('❌ Error construyendo perfil de usuario:', error);
    return { hasData: false };
  }
};

/**
 * HELPER: Calcular frecuencia de elementos
 */
const getFrequency = (array) => {
  return array.reduce((freq, item) => {
    if (item) {
      freq[item] = (freq[item] || 0) + 1;
    }
    return freq;
  }, {});
};

/**
 * HELPER: Obtener compras recientes
 */
const getRecentPurchases = async (userId, days = 30) => {
  try {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const orders = await Order.find({
      userId,
      paymentStatus: 'Pagado',
      createdAt: { $gte: daysAgo }
    }).select('items');

    const productIds = orders.flatMap(order => 
      order.items.map(item => item.productId)
    );

    return productIds;
  } catch (error) {
    console.error('❌ Error obteniendo compras recientes:', error);
    return [];
  }
};

/**
 * PRODUCTOS TRENDING (Fallback)
 * Cuando no hay datos personalizados
 */
const getTrendingProducts = async (limit = 10) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ salesCount: -1, rating: -1, viewCount: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      products: products.map(p => ({ ...p, algorithm: 'trending' })),
      algorithm: 'trending'
    };
  } catch (error) {
    console.error('❌ Error en getTrendingProducts:', error);
    throw error;
  }
};

/**
 * DASHBOARD DE RECOMENDACIONES
 * Combina múltiples algoritmos
 */
const getRecommendationsDashboard = async (userId, productId = null) => {
  try {
    const recommendations = {};

    // Si hay un productId, incluir "También compraron" y "Similares"
    if (productId) {
      const [alsoBought, similar] = await Promise.all([
        getAlsoBought(productId, 6),
        getSimilarProducts(productId, 6)
      ]);
      recommendations.alsoBought = alsoBought;
      recommendations.similar = similar;
    }

    // Recomendaciones personalizadas (si hay userId)
    if (userId) {
      const [personalized, recentlyViewed] = await Promise.all([
        getPersonalizedRecommendations(userId, 10),
        getRecentlyViewed(userId, 10)
      ]);
      recommendations.personalized = personalized;
      recommendations.recentlyViewed = recentlyViewed;
    } else {
      // Si no hay usuario, mostrar trending
      recommendations.trending = await getTrendingProducts(10);
    }

    return {
      success: true,
      recommendations
    };
  } catch (error) {
    console.error('❌ Error en getRecommendationsDashboard:', error);
    throw error;
  }
};

/**
 * REGISTRAR VISTA DE PRODUCTO
 */
const recordProductView = async (userId, product) => {
  try {
    if (!userId || !product) return;
    
    await ProductView.recordView(userId, product);
    
    // Incrementar contador de vistas en el producto
    await Product.findByIdAndUpdate(product._id, {
      $inc: { viewCount: 1 }
    });
  } catch (error) {
    console.error('❌ Error registrando vista:', error);
  }
};

module.exports = {
  getAlsoBought,
  getRecentlyViewed,
  getSimilarProducts,
  getPersonalizedRecommendations,
  getTrendingProducts,
  getRecommendationsDashboard,
  recordProductView,
  buildUserProfile
};
