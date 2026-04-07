const PracticeEvaluation = require('../models/practiceEvaluationModel');
const Application = require('../models/applicationModel');
const { createNotification } = require('./notificationController');

// Enviar una evaluación
exports.submitEvaluation = async (req, res) => {
  try {
    const {
      applicationId,
      ratings,
      strengths,
      areasForImprovement,
      comments,
      isPublic
    } = req.body;

    const userId = req.user._id;

    // Verificar que la aplicación existe
    const application = await Application.findById(applicationId)
      .populate('applicant', 'role')
      .populate('jobOffer', 'organization');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicación no encontrada'
      });
    }

    // Determinar tipo de evaluador y evaluado
    let evaluatorType, evaluated;
    const isStudent = ['STUDENT', 'USER'].includes(req.user.role);

    if (isStudent) {
      // Estudiante evalúa a institución
      evaluatorType = 'student';
      evaluated = application.jobOffer.organization;
    } else if (req.user.role === 'ORGANIZATION') {
      // Institución evalúa a estudiante
      evaluatorType = 'institution';
      evaluated = application.applicant._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Solo estudiantes e instituciones pueden evaluar'
      });
    }

    // Verificar que no haya evaluado ya
    const existingEval = await PracticeEvaluation.findOne({
      application: applicationId,
      evaluatorType
    });

    if (existingEval) {
      return res.status(400).json({
        success: false,
        message: 'Ya has enviado una evaluación para esta práctica'
      });
    }

    // Crear evaluación
    const evaluation = await PracticeEvaluation.create({
      application: applicationId,
      evaluatorType,
      evaluator: userId,
      evaluated,
      ratings,
      strengths: strengths || '',
      areasForImprovement: areasForImprovement || '',
      comments: comments || '',
      isPublic: isPublic || false,
      jobOffer: application.jobOffer._id
    });

    // Notificar al evaluado
    await createNotification(
      evaluated,
      'evaluation_received',
      'Has recibido una nueva evaluación',
      `Tu práctica ha sido evaluada${isPublic ? ' y es visible en tu perfil' : ''}`,
      { entityType: 'PracticeEvaluation', entityId: evaluation._id },
      `/evaluations`
    );

    res.status(201).json({
      success: true,
      message: 'Evaluación enviada exitosamente',
      evaluation
    });
  } catch (error) {
    console.error('Error al enviar evaluación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar evaluación'
    });
  }
};

// Obtener evaluaciones pendientes
exports.getPendingEvaluations = async (req, res) => {
  try {
    const userId = req.user._id;
    const isStudent = ['STUDENT', 'USER'].includes(req.user.role);

    let applications;

    if (isStudent) {
      // Buscar prácticas finalizadas donde el estudiante no ha evaluado
      applications = await Application.find({
        applicant: userId,
        status: { $in: ['aceptado', 'finalizado', 'completado'] }
      })
        .populate('jobOffer', 'title organization')
        .populate({
          path: 'jobOffer',
          populate: {
            path: 'organization',
            select: 'name profilePic'
          }
        });
    } else {
      // Buscar prácticas finalizadas donde la institución no ha evaluado
      applications = await Application.find({
        jobOffer: {
          $in: await require('../models/jobOfferModel').find({ organization: userId }).distinct('_id')
        },
        status: { $in: ['aceptado', 'finalizado', 'completado'] }
      })
        .populate('applicant', 'name profilePic email')
        .populate('jobOffer', 'title');
    }

    // Filtrar las que ya tienen evaluación
    const pending = [];
    for (const app of applications) {
      const hasEvaluated = await PracticeEvaluation.findOne({
        application: app._id,
        evaluatorType: isStudent ? 'student' : 'institution'
      });

      if (!hasEvaluated) {
        pending.push(app);
      }
    }

    res.json({
      success: true,
      pending
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones pendientes'
    });
  }
};

// Obtener evaluaciones recibidas
exports.getReceivedEvaluations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { onlyPublic = true } = req.query;

    // Si no es el mismo usuario, solo mostrar públicas
    const showOnlyPublic = userId !== req.user._id.toString() || onlyPublic === 'true';

    const query = {
      evaluated: userId,
      ...(showOnlyPublic && { isPublic: true })
    };

    const evaluations = await PracticeEvaluation.find(query)
      .populate('evaluator', 'name profilePic')
      .populate('jobOffer', 'title')
      .sort('-createdAt');

    // Calcular promedio
    const isStudent = ['STUDENT', 'USER'].includes(req.user.role);
    const stats = await PracticeEvaluation.getAverageRating(userId, isStudent);

    res.json({
      success: true,
      evaluations,
      stats
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones recibidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones'
    });
  }
};

// Obtener evaluaciones dadas
exports.getGivenEvaluations = async (req, res) => {
  try {
    const userId = req.user._id;

    const evaluations = await PracticeEvaluation.find({ evaluator: userId })
      .populate('evaluated', 'name profilePic')
      .populate('jobOffer', 'title')
      .sort('-createdAt');

    res.json({
      success: true,
      evaluations
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones dadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones dadas'
    });
  }
};

// Obtener estadísticas de evaluaciones
exports.getEvaluationStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const isStudent = ['STUDENT', 'USER'].includes(req.user.role);

    const stats = await PracticeEvaluation.getAverageRating(userId, isStudent);

    // Contar total de evaluaciones dadas
    const givenCount = await PracticeEvaluation.countDocuments({
      evaluator: userId
    });

    // Recomendaciones recibidas
    const recommendations = await PracticeEvaluation.countDocuments({
      evaluated: userId,
      'ratings.wouldRecommend': true,
      isPublic: true
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        givenCount,
        recommendations
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

// Actualizar visibilidad de evaluación
exports.updateVisibility = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { isPublic } = req.body;
    const userId = req.user._id;

    const evaluation = await PracticeEvaluation.findOne({
      _id: evaluationId,
      evaluated: userId
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada o no tienes permiso'
      });
    }

    evaluation.isPublic = isPublic;
    await evaluation.save();

    res.json({
      success: true,
      message: 'Visibilidad actualizada',
      evaluation
    });
  } catch (error) {
    console.error('Error al actualizar visibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar visibilidad'
    });
  }
};
