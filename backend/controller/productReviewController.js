/**
 * Controlador de Reviews de Productos
 * Con verificación de compra, votos, respuestas, moderación e imágenes
 */

const ProductReview = require('../models/productReviewModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// ==========================================
// CREAR REVIEW
// ==========================================
const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images = [] } = req.body;
    const userId = req.user._id;

    // Verificar si ya existe un review de este usuario para este producto
    const existingReview = await ProductReview.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado un review para este producto'
      });
    }

    // Verificar compra (opcional pero recomendado)
    let verifiedPurchase = false;
    let orderId = null;
    let purchaseDate = null;

    const purchaseOrder = await Order.findOne({
      userId,
      'items.productId': productId,
      orderStatus: 'Entregado'
    }).sort({ deliveredAt: -1 });

    if (purchaseOrder) {
      verifiedPurchase = true;
      orderId = purchaseOrder._id;
      purchaseDate = purchaseOrder.deliveredAt || purchaseOrder.createdAt;
    }

    // Crear review
    const review = await ProductReview.create({
      productId,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      rating,
      title,
      comment,
      images: images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        caption: img.caption || ''
      })),
      verifiedPurchase,
      orderId,
      purchaseDate,
      status: 'approved' // Cambiar a 'pending' si quieres moderación manual
    });

    // Actualizar rating del producto
    await updateProductRating(productId);

    console.log(`✅ Review creado para producto ${productId} por ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Review creado exitosamente',
      data: review
    });
  } catch (error) {
    console.error('❌ Error creando review:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// OBTENER REVIEWS DE UN PRODUCTO
// ==========================================
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt', // createdAt, helpful, rating
      rating = null,
      verifiedOnly = false
    } = req.query;

    // Construir query
    const query = {
      productId,
      status: 'approved'
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (verifiedOnly === 'true') {
      query.verifiedPurchase = true;
    }

    // Configurar ordenamiento
    let sortOptions = {};
    switch (sortBy) {
      case 'helpful':
        sortOptions = { helpfulVotes: -1, createdAt: -1 };
        break;
      case 'rating-high':
        sortOptions = { rating: -1, createdAt: -1 };
        break;
      case 'rating-low':
        sortOptions = { rating: 1, createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      ProductReview.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProductReview.countDocuments(query),
      ProductReview.getProductStats(productId)
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// VOTAR EN UN REVIEW (ÚTIL/NO ÚTIL)
// ==========================================
const voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { vote } = req.body; // 'helpful' o 'not_helpful'
    const userId = req.user._id;

    if (!['helpful', 'not_helpful'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de voto inválido'
      });
    }

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // No puedes votar tu propio review
    if (review.userId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes votar tu propio review'
      });
    }

    const result = review.addVote(userId, vote);
    await review.save();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        helpfulVotes: review.helpfulVotes,
        notHelpfulVotes: review.notHelpfulVotes,
        score: review.getHelpfulnessScore()
      }
    });
  } catch (error) {
    console.error('❌ Error votando review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// REMOVER VOTO
// ==========================================
const removeVote = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    const result = review.removeVote(userId);
    await review.save();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        helpfulVotes: review.helpfulVotes,
        notHelpfulVotes: review.notHelpfulVotes
      }
    });
  } catch (error) {
    console.error('❌ Error removiendo voto:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// RESPONDER A UN REVIEW (VENDEDOR/ADMIN)
// ==========================================
const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const userId = req.user._id;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La respuesta no puede estar vacía'
      });
    }

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Verificar si ya tiene respuesta
    if (review.sellerResponse) {
      return res.status(400).json({
        success: false,
        message: 'Este review ya tiene una respuesta'
      });
    }

    review.sellerResponse = {
      userId,
      userName: req.user.name,
      response: response.trim(),
      respondedAt: new Date()
    };

    await review.save();

    console.log(`✅ Respuesta agregada al review ${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Respuesta agregada exitosamente',
      data: review
    });
  } catch (error) {
    console.error('❌ Error respondiendo review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// EDITAR RESPUESTA DEL VENDEDOR
// ==========================================
const editSellerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const userId = req.user._id;

    const review = await ProductReview.findById(reviewId);
    if (!review || !review.sellerResponse) {
      return res.status(404).json({
        success: false,
        message: 'Respuesta no encontrada'
      });
    }

    // Verificar que sea el mismo usuario que respondió
    if (review.sellerResponse.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta respuesta'
      });
    }

    review.sellerResponse.response = response.trim();
    review.sellerResponse.respondedAt = new Date();
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Respuesta actualizada',
      data: review
    });
  } catch (error) {
    console.error('❌ Error editando respuesta:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// REPORTAR REVIEW (FLAGGING)
// ==========================================
const flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description = '' } = req.body;
    const userId = req.user._id;

    const validReasons = ['spam', 'inappropriate', 'offensive', 'fake', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Razón inválida'
      });
    }

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Verificar si ya fue reportado por este usuario
    const alreadyFlagged = review.flaggedBy.some(
      flag => flag.userId.toString() === userId.toString()
    );

    if (alreadyFlagged) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reportado este review'
      });
    }

    review.flaggedBy.push({
      userId,
      reason,
      description,
      flaggedAt: new Date()
    });

    // Si tiene 3+ reportes, cambiar estado a flagged
    if (review.flaggedBy.length >= 3 && review.status === 'approved') {
      review.status = 'flagged';
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reportado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error reportando review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// MODERACIÓN (ADMIN)
// ==========================================
const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, notes = '' } = req.body; // 'approved', 'rejected', 'flagged'

    const validStatuses = ['approved', 'rejected', 'flagged'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    review.moderationNotes = notes;

    await review.save();

    // Actualizar rating del producto si cambió el estado
    if (status === 'approved' || status === 'rejected') {
      await updateProductRating(review.productId);
    }

    console.log(`✅ Review ${reviewId} moderado: ${status}`);

    res.status(200).json({
      success: true,
      message: `Review ${status} exitosamente`,
      data: review
    });
  } catch (error) {
    console.error('❌ Error moderando review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// OBTENER REVIEWS PENDIENTES (ADMIN)
// ==========================================
const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ProductReview.find({
        $or: [
          { status: 'pending' },
          { status: 'flagged' }
        ]
      })
        .populate('productId', 'name images')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ProductReview.countDocuments({
        $or: [
          { status: 'pending' },
          { status: 'flagged' }
        ]
      })
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo reviews pendientes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// VERIFICAR SI USUARIO PUEDE REVIEWAR
// ==========================================
const canUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Verificar si ya tiene review
    const existingReview = await ProductReview.findOne({ productId, userId });
    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'already_reviewed',
        message: 'Ya has dejado un review para este producto'
      });
    }

    // Verificar si compró el producto
    const purchaseOrder = await Order.findOne({
      userId,
      'items.productId': productId,
      orderStatus: 'Entregado'
    });

    res.status(200).json({
      success: true,
      canReview: true,
      hasPurchased: !!purchaseOrder,
      message: purchaseOrder
        ? 'Puedes dejar un review verificado'
        : 'Puedes dejar un review (sin verificación de compra)'
    });
  } catch (error) {
    console.error('❌ Error verificando permiso de review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// ACTUALIZAR RATING DEL PRODUCTO
// ==========================================
const updateProductRating = async (productId) => {
  try {
    const stats = await ProductReview.getProductStats(productId);

    await Product.findByIdAndUpdate(productId, {
      rating: stats.averageRating,
      reviewCount: stats.totalReviews
    });

    console.log(`✅ Rating actualizado para producto ${productId}: ${stats.averageRating} (${stats.totalReviews} reviews)`);
  } catch (error) {
    console.error('❌ Error actualizando rating del producto:', error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  voteReview,
  removeVote,
  respondToReview,
  editSellerResponse,
  flagReview,
  moderateReview,
  getPendingReviews,
  canUserReview
};
