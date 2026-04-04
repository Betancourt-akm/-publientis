const Product = require('../models/productModel');

// Crear producto (Admin)
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, brand, search, sort, page = 1, limit = 12 } = req.query;
    
    // Construir query
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Opciones de ordenamiento
    let sortOptions = {};
    switch (sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { salesCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    // Paginación
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar producto (Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Eliminar producto (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener productos destacados
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(8)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener categorías disponibles
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener marcas disponibles
const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getCategories,
  getBrands,
};
