const mongoose = require('mongoose');

const practiceEvaluationSchema = new mongoose.Schema({
  // Relación con la postulación/práctica
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },

  // Tipo de evaluador
  evaluatorType: {
    type: String,
    enum: ['student', 'institution'],
    required: true
  },

  // Quién evalúa y quién es evaluado
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  evaluated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Calificaciones numéricas (1-5 estrellas)
  ratings: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    // Para estudiantes
    pedagogicalSkills: {
      type: Number,
      min: 1,
      max: 5
    },
    // Para instituciones
    workEnvironment: {
      type: Number,
      min: 1,
      max: 5
    },
    support: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    wouldRecommend: {
      type: Boolean,
      required: true
    }
  },

  // Feedback cualitativo
  strengths: {
    type: String,
    trim: true
  },

  areasForImprovement: {
    type: String,
    trim: true
  },

  comments: {
    type: String,
    trim: true
  },

  // Control de visibilidad
  isPublic: {
    type: Boolean,
    default: false
  },

  // Referencia a la oferta laboral
  jobOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer'
  }
}, {
  timestamps: true
});

// Índices para queries eficientes
practiceEvaluationSchema.index({ evaluated: 1, isPublic: 1 });
practiceEvaluationSchema.index({ evaluator: 1 });
practiceEvaluationSchema.index({ application: 1 });

// Evitar evaluaciones duplicadas
practiceEvaluationSchema.index(
  { application: 1, evaluatorType: 1 },
  { unique: true }
);

// Método estático para calcular promedio de evaluaciones
practiceEvaluationSchema.statics.getAverageRating = async function(userId, isStudent = true) {
  const evaluations = await this.find({
    evaluated: userId,
    evaluatorType: isStudent ? 'institution' : 'student',
    isPublic: true
  });

  if (evaluations.length === 0) {
    return {
      count: 0,
      average: 0,
      breakdown: {}
    };
  }

  const totals = evaluations.reduce((acc, evaluation) => {
    acc.overall += evaluation.ratings.overall;
    acc.professionalism += evaluation.ratings.professionalism;
    acc.support += evaluation.ratings.support;
    
    if (isStudent && evaluation.ratings.pedagogicalSkills) {
      acc.pedagogicalSkills += evaluation.ratings.pedagogicalSkills;
    }
    if (!isStudent && evaluation.ratings.workEnvironment) {
      acc.workEnvironment += evaluation.ratings.workEnvironment;
    }
    
    return acc;
  }, {
    overall: 0,
    professionalism: 0,
    support: 0,
    pedagogicalSkills: 0,
    workEnvironment: 0
  });

  const count = evaluations.length;

  return {
    count,
    average: (totals.overall / count).toFixed(2),
    breakdown: {
      overall: (totals.overall / count).toFixed(2),
      professionalism: (totals.professionalism / count).toFixed(2),
      support: (totals.support / count).toFixed(2),
      ...(isStudent && totals.pedagogicalSkills > 0 && {
        pedagogicalSkills: (totals.pedagogicalSkills / count).toFixed(2)
      }),
      ...(!isStudent && totals.workEnvironment > 0 && {
        workEnvironment: (totals.workEnvironment / count).toFixed(2)
      })
    }
  };
};

const PracticeEvaluation = mongoose.model('PracticeEvaluation', practiceEvaluationSchema);

module.exports = PracticeEvaluation;
