const express = require('express');
const router = express.Router();
const authToken = require('../middleware/authToken');
const Wishlist = require('../models/wishlistModel');
const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
  checkWishlistStatus,
  getWishlistProductIds,
  clearWishlist
} = require('../controller/wishlistController');

// Middleware de autenticación para todas las rutas
router.use(authToken);

// GET /api/wishlist - Obtener wishlist del usuario con paginación
router.get('/', getUserWishlist);

// GET /api/wishlist/count - Obtener contador de items en wishlist
router.get('/count', getWishlistCount);

// GET /api/wishlist/product-ids - Obtener IDs de productos en wishlist
router.get('/product-ids', getWishlistProductIds);

// GET /api/wishlist/check/:productId - Verificar si un producto está en wishlist
router.get('/check/:productId', checkWishlistStatus);

// POST /api/wishlist/add - Agregar producto a wishlist
router.post('/add', addToWishlist);

// POST /api/wishlist/toggle - Toggle producto en wishlist (agregar/remover)
router.post('/toggle', toggleWishlist);

// DELETE /api/wishlist/remove/:productId - Remover producto de wishlist
router.delete('/remove/:productId', removeFromWishlist);

// DELETE /api/wishlist/clear - Limpiar toda la wishlist
router.delete('/clear', clearWishlist);

// ==========================================
// COMPARTIR WISHLIST (SOCIAL)
// ==========================================

// POST /api/wishlist/share - Generar link compartible
router.post('/share', async (req, res) => {
  try {
    const userId = req.user._id;
    const { privacy = 'public' } = req.body; // public, private, friends

    // Generar token único
    const shareToken = require('crypto').randomBytes(16).toString('hex');
    
    // Actualizar wishlist con token
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist no encontrada'
      });
    }

    wishlist.shareToken = shareToken;
    wishlist.sharePrivacy = privacy;
    wishlist.shareEnabled = true;
    await wishlist.save();

    const shareUrl = `${process.env.FRONTEND_URL}/wishlist/shared/${shareToken}`;

    res.status(200).json({
      success: true,
      message: 'Link compartible generado',
      shareUrl,
      shareToken
    });
  } catch (error) {
    console.error('❌ Error generando link compartible:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar link',
      error: error.message
    });
  }
});

// GET /api/wishlist/shared/:token - Ver wishlist compartida (público)
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const wishlist = await Wishlist.findOne({
      shareToken: token,
      shareEnabled: true
    }).populate('products.productId');

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist no encontrada o no compartida'
      });
    }

    // Incrementar contador de vistas (opcional)
    wishlist.shareViews = (wishlist.shareViews || 0) + 1;
    await wishlist.save();

    res.status(200).json({
      success: true,
      wishlist: {
        products: wishlist.products,
        ownerName: wishlist.ownerName || 'Usuario',
        createdAt: wishlist.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo wishlist compartida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener wishlist compartida',
      error: error.message
    });
  }
});

// PUT /api/wishlist/share/disable - Deshabilitar compartir
router.put('/share/disable', async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist no encontrada'
      });
    }

    wishlist.shareEnabled = false;
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Compartir deshabilitado'
    });
  } catch (error) {
    console.error('❌ Error deshabilitando compartir:', error);
    res.status(500).json({
      success: false,
      message: 'Error al deshabilitar compartir',
      error: error.message
    });
  }
});

module.exports = router;
