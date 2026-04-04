const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['ACHIEVEMENT', 'PAPER', 'BOOK', 'RESEARCH_PROJECT', 'INTERNSHIP', 'CERTIFICATION']
  },
  category: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  externalLinks: [{
    url: String,
    label: String
  }],
  attachments: [{
    url: String,
    filename: String,
    fileType: String
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  facultyId: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de búsquedas
publicationSchema.index({ status: 1, createdAt: -1 });
publicationSchema.index({ authorId: 1, status: 1 });
publicationSchema.index({ facultyId: 1, status: 1 });
publicationSchema.index({ type: 1, status: 1 });
publicationSchema.index({ tags: 1 });

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
