const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// Obtener wishlist del usuario
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    const wishlistData = await Wishlist.getUserWishlist(userId, page, limit);

    res.json({
      success: true,
      error: false,
      message: 'Wishlist obtenida exitosamente',
      data: wishlistData
    });

  } catch (error) {
    console.error('Error al obtener wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar producto a wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'ID del producto es requerido'
      });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: true,
        message: 'Producto no encontrado'
      });
    }

    const result = await Wishlist.addToWishlist(userId, productId);

    if (result.success) {
      const count = await Wishlist.getWishlistCount(userId);
      res.json({
        success: true,
        error: false,
        message: result.message,
        data: {
          inWishlist: true,
          count
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: true,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error al agregar a wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Remover producto de wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'ID del producto es requerido'
      });
    }

    const result = await Wishlist.removeFromWishlist(userId, productId);
    const count = await Wishlist.getWishlistCount(userId);

    res.json({
      success: true,
      error: false,
      message: result.message,
      data: {
        inWishlist: false,
        count
      }
    });

  } catch (error) {
    console.error('Error al remover de wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Toggle producto en wishlist (agregar/remover)
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'ID del producto es requerido'
      });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: true,
        message: 'Producto no encontrado'
      });
    }

    const result = await Wishlist.toggleWishlist(userId, productId);
    const count = await Wishlist.getWishlistCount(userId);

    res.json({
      success: true,
      error: false,
      message: result.message,
      data: {
        action: result.action,
        inWishlist: result.inWishlist,
        count
      }
    });

  } catch (error) {
    console.error('Error al toggle wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener contador de wishlist
const getWishlistCount = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    const count = await Wishlist.getWishlistCount(userId);

    res.json({
      success: true,
      error: false,
      message: 'Contador obtenido exitosamente',
      data: { count }
    });

  } catch (error) {
    console.error('Error al obtener contador de wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar si un producto está en wishlist
const checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'ID del producto es requerido'
      });
    }

    const inWishlist = await Wishlist.isInWishlist(userId, productId);

    res.json({
      success: true,
      error: false,
      message: 'Estado verificado exitosamente',
      data: { inWishlist }
    });

  } catch (error) {
    console.error('Error al verificar estado de wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener IDs de productos en wishlist (para marcar favoritos en listados)
const getWishlistProductIds = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    const productIds = await Wishlist.getWishlistProductIds(userId);

    res.json({
      success: true,
      error: false,
      message: 'IDs obtenidos exitosamente',
      data: { productIds }
    });

  } catch (error) {
    console.error('Error al obtener IDs de wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

// Limpiar wishlist completa
const clearWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    await Wishlist.deleteMany({ userId });

    res.json({
      success: true,
      error: false,
      message: 'Wishlist limpiada exitosamente',
      data: { count: 0 }
    });

  } catch (error) {
    console.error('Error al limpiar wishlist:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
  checkWishlistStatus,
  getWishlistProductIds,
  clearWishlist
};
