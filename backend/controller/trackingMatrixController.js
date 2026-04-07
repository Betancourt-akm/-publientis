const User = require('../models/userModel');
const Application = require('../models/applicationModel');
const PracticeEvaluation = require('../models/practiceEvaluationModel');

/**
 * Matriz de Seguimiento - Dashboard Reactivo
 * 
 * Endpoint que alimenta el StudentTrackingMatrix component
 * Según teoría de Unger & Chandler: "Interfaz Adaptativa"
 * 
 * Retorna alertas críticas que requieren acción del administrador
 */

exports.getTrackingMatrix = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000);

    // 1. ALERTA CRÍTICA: Egresados sin práctica
    const studentsWithoutPractice = await User.find({
      role: 'STUDENT',
      academicStatus: 'Egresado',
      createdAt: { $lt: thirtyDaysAgo } // Egresado hace más de 30 días
    }).select('name email profilePic program faculty createdAt');

    // Verificar cuáles NO tienen prácticas aceptadas
    const studentsWithoutPracticeList = [];
    for (const student of studentsWithoutPractice) {
      const hasAcceptedPractice = await Application.findOne({
        applicant: student._id,
        status: 'aceptado'
      });

      if (!hasAcceptedPractice) {
        studentsWithoutPracticeList.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePic: student.profilePic,
          program: student.program,
          faculty: student.faculty,
          daysSinceGraduation: Math.floor((now - new Date(student.createdAt)) / (1000 * 60 * 60 * 24))
        });
      }
    }

    // 2. ALERTA DE GESTIÓN: Instituciones con convenio vencido
    const expiredConvenios = await User.find({
      role: 'ORGANIZATION',
      'convenio.expirationDate': { $lt: now }
    }).select('name email profilePic convenio');

    const expiredConveniosList = expiredConvenios.map(org => ({
      _id: org._id,
      name: org.name,
      email: org.email,
      profilePic: org.profilePic,
      expirationDate: org.convenio.expirationDate,
      daysUntilExpiration: Math.floor((new Date(org.convenio.expirationDate) - now) / (1000 * 60 * 60 * 24))
    }));

    // 3. ALERTA DE SEGUIMIENTO: Estudiantes estancados (>5 días sin respuesta)
    const stuckApplications = await Application.find({
      status: 'pendiente',
      createdAt: { $lt: fiveDaysAgo }
    })
      .populate('applicant', 'name email')
      .populate('jobOffer', 'title organization')
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'organization',
          select: 'name'
        }
      });

    const stuckStudentsList = stuckApplications.map(app => ({
      applicationId: app._id,
      studentName: app.applicant?.name,
      studentEmail: app.applicant?.email,
      jobTitle: app.jobOffer?.title,
      institutionName: app.jobOffer?.organization?.name,
      daysWaiting: Math.floor((now - new Date(app.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    // 4. ALERTA DE ACCIÓN: Documentos pendientes de validación
    // (Simulado - ajustar según tu modelo de documentos)
    const pendingValidations = await User.find({
      role: 'STUDENT',
      'portfolio.cv.validated': false // Ajustar según tu estructura
    }).select('name email portfolio.cv');

    const pendingValidationsList = pendingValidations.map(student => ({
      _id: student._id,
      userId: student._id,
      studentName: student.name,
      documentType: 'CV Pedagógico',
      daysAgo: 3, // Calcular según fecha de subida
      documentUrl: student.portfolio?.cv?.[0]?.url
    }));

    // Calcular tasa de vinculación
    const totalStudents = await User.countDocuments({ role: 'STUDENT', academicStatus: 'Egresado' });
    const placedStudents = await Application.countDocuments({ status: 'aceptado' });
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    // Estudiantes activos
    const activeStudents = await User.countDocuments({
      role: 'STUDENT',
      academicStatus: { $in: ['Activo', 'Practicante', 'Egresado'] }
    });

    res.json({
      success: true,
      matrix: {
        studentsWithoutPractice: studentsWithoutPracticeList,
        expiredConvenios: expiredConveniosList,
        stuckStudents: stuckStudentsList,
        pendingValidations: pendingValidationsList,
        placementRate,
        activeStudents,
        lastUpdated: now
      }
    });
  } catch (error) {
    console.error('Error al generar matriz de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar matriz de seguimiento'
    });
  }
};

/**
 * Validar documento de estudiante
 */
exports.validateDocument = async (req, res) => {
  try {
    const { userId, documentType, validated } = req.body;

    // Actualizar documento según tipo
    // (Ajustar según tu estructura de datos)
    await User.findByIdAndUpdate(userId, {
      'portfolio.cv.validated': validated
    });

    // Crear notificación
    const { createNotification } = require('./notificationController');
    await createNotification(
      userId,
      'document_validated',
      'Documento Validado',
      `Tu ${documentType} ha sido validado por la Universidad`,
      { entityType: 'Document', entityId: userId },
      '/perfil/portafolio'
    );

    res.json({
      success: true,
      message: 'Documento validado correctamente'
    });
  } catch (error) {
    console.error('Error al validar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar documento'
    });
  }
};

/**
 * Notificar a institución sobre estudiante estancado
 */
exports.notifyInstitutionAboutStuckStudent = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findById(applicationId)
      .populate('jobOffer')
      .populate('applicant', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    const { createNotification } = require('./notificationController');
    
    // Notificar a la institución
    await createNotification(
      application.jobOffer.organization,
      'urgent_response_needed',
      'Respuesta Urgente Requerida',
      `La postulación de ${application.applicant.name} lleva más de 5 días sin respuesta. Por favor, revisar.`,
      { entityType: 'Application', entityId: applicationId },
      `/jobs/${application.jobOffer._id}/applicants`
    );

    res.json({
      success: true,
      message: 'Notificación enviada a la institución'
    });
  } catch (error) {
    console.error('Error al notificar institución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación'
    });
  }
};
