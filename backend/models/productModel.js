const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo'],
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: [
      'Materiales Didácticos',
      'Libros y Textos Educativos',
      'Recursos Digitales',
      'Material para Primera Infancia',
      'Herramientas Pedagógicas',
      'Tecnología Educativa',
      'Recursos de Inclusión',
      'Material de Apoyo Bilingüe',
      'Kits Educativos',
    ],
  },
  brand: {
    type: String,
    required: [true, 'La editorial/autor es requerida'],
  },
  publisher: {
    type: String,
  },
  images: [{
    type: String,
    required: true,
  }],
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0,
  },
  features: [{
    type: String,
  }],
  specifications: {
    type: Map,
    of: String,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
  }],
  salesCount: {
    type: Number,
    default: 0,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true,
  },
}, {
  timestamps: true,
});

// Índices para mejorar búsquedas
productSchema.index({ name: 'text', description: 'text', brand: 'text', publisher: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Método para calcular precio con descuento
productSchema.virtual('finalPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Configurar virtuals en JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
