const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  // Campos para compartir wishlist (social)
  shareToken: {
    type: String,
    index: true,
    sparse: true
  },
  shareEnabled: {
    type: Boolean,
    default: false
  },
  sharePrivacy: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  shareViews: {
    type: Number,
    default: 0
  },
  ownerName: String
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados y optimizar consultas
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Método estático para agregar a favoritos
wishlistSchema.statics.addToWishlist = async function(userId, productId) {
  try {
    const existingItem = await this.findOne({ userId, productId });
    if (existingItem) {
      return { success: false, message: 'Producto ya está en favoritos' };
    }
    
    const wishlistItem = new this({ userId, productId });
    await wishlistItem.save();
    return { success: true, message: 'Producto agregado a favoritos' };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: 'Producto ya está en favoritos' };
    }
    throw error;
  }
};

// Método estático para remover de favoritos
wishlistSchema.statics.removeFromWishlist = async function(userId, productId) {
  const result = await this.deleteOne({ userId, productId });
  return {
    success: result.deletedCount > 0,
    message: result.deletedCount > 0 ? 'Producto removido de favoritos' : 'Producto no encontrado en favoritos'
  };
};

// Método estático para toggle favoritos
wishlistSchema.statics.toggleWishlist = async function(userId, productId) {
  const existingItem = await this.findOne({ userId, productId });
  
  if (existingItem) {
    await this.deleteOne({ userId, productId });
    return { 
      success: true, 
      action: 'removed', 
      message: 'Producto removido de favoritos',
      inWishlist: false
    };
  } else {
    const wishlistItem = new this({ userId, productId });
    await wishlistItem.save();
    return { 
      success: true, 
      action: 'added', 
      message: 'Producto agregado a favoritos',
      inWishlist: true
    };
  }
};

// Método estático para obtener wishlist del usuario
wishlistSchema.statics.getUserWishlist = async function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    this.find({ userId })
      .populate('productId', 'name images price finalPrice discount category brand rating reviews stock')
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ userId })
  ]);
  
  return {
    items: items.filter(item => item.productId), // Filtrar productos eliminados
    total,
    page,
    pages: Math.ceil(total / limit),
    hasMore: skip + items.length < total
  };
};

// Método estático para contar favoritos del usuario
wishlistSchema.statics.getWishlistCount = async function(userId) {
  return await this.countDocuments({ userId });
};

// Método estático para verificar si un producto está en favoritos
wishlistSchema.statics.isInWishlist = async function(userId, productId) {
  const item = await this.findOne({ userId, productId });
  return !!item;
};

// Método estático para obtener IDs de productos en wishlist
wishlistSchema.statics.getWishlistProductIds = async function(userId) {
  const items = await this.find({ userId }).select('productId').lean();
  return items.map(item => item.productId.toString());
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
