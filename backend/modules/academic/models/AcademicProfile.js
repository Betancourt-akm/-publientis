const mongoose = require('mongoose');

const academicProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  researchLine: {
    type: String,
    default: ''
  },
  semillero: {
    type: String,
    default: ''
  },
  university: {
    type: String,
    default: ''
  },
  faculty: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  practices: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    current: {
      type: Boolean,
      default: false
    }
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    credentialUrl: String,
    imageUrl: String
  }],
  socialLinks: {
    linkedin: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    },
    portfolio: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  cvUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const AcademicProfile = mongoose.model('AcademicProfile', academicProfileSchema);

module.exports = AcademicProfile;
