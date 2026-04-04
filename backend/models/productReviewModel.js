/**
 * Modelo Mejorado de Reviews de Productos
 * Con verificación de compra, votos, respuestas, moderación e imágenes
 */

const mongoose = require('mongoose');

// Sub-esquema para respuestas del vendedor
const sellerResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  response: {
    type: String,
    required: true,
    maxlength: 1000
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Esquema principal de review
const productReviewSchema = new mongoose.Schema({
  // Producto y usuario
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: String,
  
  // Contenido del review
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000,
    trim: true
  },
  
  // Imágenes del review
  images: [{
    url: String,
    publicId: String, // Para Cloudinary
    caption: String
  }],
  
  // Verificación de compra
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  
  // Sistema de votos (útil/no útil)
  helpfulVotes: {
    type: Number,
    default: 0
  },
  notHelpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'not_helpful']
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Respuestas del vendedor/admin
  sellerResponse: sellerResponseSchema,
  
  // Moderación
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved' // Auto-aprobar por defecto, cambiar a 'pending' si quieres moderación manual
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  moderationNotes: {
    type: String,
    maxlength: 500
  },
  
  // Flags de abuso
  flaggedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other']
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  
  // Estadísticas
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices compuestos para búsquedas eficientes
productReviewSchema.index({ productId: 1, status: 1 });
productReviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // Un review por usuario por producto
productReviewSchema.index({ verifiedPurchase: 1 });
productReviewSchema.index({ rating: 1 });
productReviewSchema.index({ helpfulVotes: -1 });
productReviewSchema.index({ createdAt: -1 });
productReviewSchema.index({ status: 1, createdAt: -1 });

// Método para verificar si un usuario ya votó
productReviewSchema.methods.hasUserVoted = function(userId) {
  return this.votedBy.some(vote => vote.userId.toString() === userId.toString());
};

// Método para agregar/cambiar voto
productReviewSchema.methods.addVote = function(userId, voteType) {
  // Verificar si ya votó
  const existingVoteIndex = this.votedBy.findIndex(
    vote => vote.userId.toString() === userId.toString()
  );

  if (existingVoteIndex !== -1) {
    const oldVote = this.votedBy[existingVoteIndex].vote;
    
    // Si el voto es el mismo, no hacer nada
    if (oldVote === voteType) {
      return { changed: false, message: 'Ya votaste de esta forma' };
    }
    
    // Actualizar contadores al remover voto anterior
    if (oldVote === 'helpful') {
      this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
    } else {
      this.notHelpfulVotes = Math.max(0, this.notHelpfulVotes - 1);
    }
    
    // Actualizar el voto
    this.votedBy[existingVoteIndex].vote = voteType;
    this.votedBy[existingVoteIndex].votedAt = new Date();
  } else {
    // Nuevo voto
    this.votedBy.push({
      userId,
      vote: voteType,
      votedAt: new Date()
    });
  }

  // Actualizar contadores
  if (voteType === 'helpful') {
    this.helpfulVotes += 1;
  } else {
    this.notHelpfulVotes += 1;
  }

  return { changed: true, message: 'Voto registrado' };
};

// Método para remover voto
productReviewSchema.methods.removeVote = function(userId) {
  const voteIndex = this.votedBy.findIndex(
    vote => vote.userId.toString() === userId.toString()
  );

  if (voteIndex === -1) {
    return { removed: false, message: 'No has votado' };
  }

  const vote = this.votedBy[voteIndex];
  
  // Actualizar contadores
  if (vote.vote === 'helpful') {
    this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
  } else {
    this.notHelpfulVotes = Math.max(0, this.notHelpfulVotes - 1);
  }

  // Remover voto
  this.votedBy.splice(voteIndex, 1);

  return { removed: true, message: 'Voto removido' };
};

// Calcular score de utilidad
productReviewSchema.methods.getHelpfulnessScore = function() {
  const total = this.helpfulVotes + this.notHelpfulVotes;
  if (total === 0) return 0;
  return (this.helpfulVotes / total) * 100;
};

// Virtual para verificar si tiene respuesta del vendedor
productReviewSchema.virtual('hasSellerResponse').get(function() {
  return !!this.sellerResponse;
});

// Virtual para calcular días desde la compra
productReviewSchema.virtual('daysSincePurchase').get(function() {
  if (!this.purchaseDate) return null;
  const diffTime = Math.abs(new Date() - new Date(this.purchaseDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware pre-save para validaciones
productReviewSchema.pre('save', function(next) {
  // Si es verified purchase, asegurarse que tenga orderId
  if (this.verifiedPurchase && !this.orderId) {
    return next(new Error('Compra verificada requiere orderId'));
  }
  
  next();
});

// Método estático para obtener estadísticas de reviews de un producto
productReviewSchema.statics.getProductStats = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: {
        productId: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        verifiedPurchases: {
          $sum: { $cond: ['$verifiedPurchase', 1, 0] }
        },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      verifiedPurchases: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  // Calcular distribución de ratings
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stats[0].ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    totalReviews: stats[0].totalReviews,
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    verifiedPurchases: stats[0].verifiedPurchases,
    distribution
  };
};

// Configurar virtuals en JSON/Object
productReviewSchema.set('toJSON', { virtuals: true });
productReviewSchema.set('toObject', { virtuals: true });

const ProductReview = mongoose.model('ProductReview', productReviewSchema);

module.exports = ProductReview;
