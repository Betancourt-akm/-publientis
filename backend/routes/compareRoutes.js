/**
 * Rutas de Comparador de Productos
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// ==========================================
// COMPARAR PRODUCTOS
// ==========================================
router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de productos'
      });
    }

    if (productIds.length < 2 || productIds.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Debes comparar entre 2 y 4 productos'
      });
    }

    // Obtener productos
    const products = await Product.find({
      _id: { $in: productIds }
    }).lean();

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Algunos productos no fueron encontrados'
      });
    }

    // Generar tabla de comparación
    const comparison = generateComparisonTable(products);

    res.status(200).json({
      success: true,
      products,
      comparison
    });
  } catch (error) {
    console.error('❌ Error comparando productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comparar productos',
      error: error.message
    });
  }
});

// ==========================================
// GENERAR TABLA DE COMPARACIÓN
// ==========================================
function generateComparisonTable(products) {
  // Extraer todas las especificaciones únicas
  const allSpecs = new Set();
  products.forEach(product => {
    if (product.specifications) {
      Object.keys(product.specifications).forEach(key => allSpecs.add(key));
    }
  });

  // Generar tabla
  const table = {
    basic: {
      name: products.map(p => p.name),
      brand: products.map(p => p.brand || 'N/A'),
      category: products.map(p => p.category || 'N/A'),
      price: products.map(p => p.price),
      stock: products.map(p => p.stock),
      rating: products.map(p => p.rating || 0),
      reviewCount: products.map(p => p.reviewCount || 0)
    },
    specifications: {}
  };

  // Agregar especificaciones
  Array.from(allSpecs).forEach(spec => {
    table.specifications[spec] = products.map(p => 
      p.specifications?.[spec] || 'N/A'
    );
  });

  return table;
}

module.exports = router;
