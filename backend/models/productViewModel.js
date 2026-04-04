/**
 * Modelo para trackear productos vistos por usuarios
 * Para sistema de "Visto Recientemente" y recomendaciones personalizadas
 */

const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
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
  viewCount: {
    type: Number,
    default: 1
  },
  lastViewedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Metadata del producto (para análisis sin joins)
  productCategory: String,
  productBrand: String,
  productPrice: Number
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
productViewSchema.index({ userId: 1, lastViewedAt: -1 });
productViewSchema.index({ userId: 1, productId: 1 }, { unique: true });
productViewSchema.index({ productCategory: 1 });

// Método para incrementar view count
productViewSchema.statics.recordView = async function(userId, product) {
  try {
    await this.findOneAndUpdate(
      { userId, productId: product._id },
      {
        $inc: { viewCount: 1 },
        $set: {
          lastViewedAt: new Date(),
          productCategory: product.category,
          productBrand: product.brand,
          productPrice: product.price
        }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error recording product view:', error);
  }
};

// Limpiar vistas antiguas (más de 90 días)
productViewSchema.statics.cleanOldViews = async function() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    lastViewedAt: { $lt: ninetyDaysAgo }
  });
  
  console.log(`🧹 Limpiadas ${result.deletedCount} vistas antiguas`);
  return result;
};

const ProductView = mongoose.model('ProductView', productViewSchema);

module.exports = ProductView;
