const MatchEvent = require('../models/matchEventModel');
const User = require('../models/userModel');
let notificationController;
try {
  notificationController = require('./notificationController');
} catch (e) {
  console.warn('notificationController no disponible:', e.message);
  notificationController = { createNotification: async () => {} };
}

/**
 * MatchmakingController - Dashboard de Matches y Alertas
 * 
 * Gestiona el registro de intereses de organizaciones en egresados
 * y genera alertas automáticas a coordinadores de programa.
 */

/**
 * POST /api/matchmaking/register-interest
 * Registrar interés de organización en un egresado
 */
exports.registerMatchInterest = async (req, res) => {
  try {
    const { studentId, action, jobOfferId, metadata } = req.body;
    const organizationId = req.user._id;

    // Validar que es una organización
    if (req.user.role !== 'ORGANIZATION') {
      return res.status(403).json({
        success: false,
        message: 'Solo organizaciones pueden registrar interés'
      });
    }

    // Validar que el estudiante existe y está verificado
    const student = await User.findById(studentId)
      .populate('academicProgramRef')
      .populate('facultyRef');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    if (student.profileStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede contactar egresados verificados'
      });
    }

    // Crear evento de match
    const matchEvent = await MatchEvent.create({
      student: studentId,
      organization: organizationId,
      action,
      jobOffer: jobOfferId || null,
      metadata: metadata || {}
    });

    // Incrementar contador de vistas de portafolio
    if (action === 'viewed_portfolio') {
      await User.findByIdAndUpdate(studentId, {
        $inc: { 'socialMetrics.portfolioViews': 1 }
      });
    }

    // Encontrar coordinador del programa para notificar
    const coordinator = await User.findOne({
      role: 'DOCENTE',
      academicProgramRef: student.academicProgramRef._id
    });

    if (coordinator) {
      const actionLabels = {
        viewed_profile: 'vio el perfil',
        viewed_portfolio: 'revisó el portafolio',
        saved_candidate: 'guardó como favorito',
        invited_to_apply: 'invitó a postular',
        contacted_directly: 'contactó directamente'
      };

      await notificationController.createNotification(
        coordinator._id,
        'match_interest',
        '🎯 Nueva Organización Interesada',
        `${req.user.name} ${actionLabels[action]} de ${student.name}`,
        { entityType: 'MatchEvent', entityId: matchEvent._id }
      );

      // Marcar como notificado
      matchEvent.coordinatorNotified = true;
      await matchEvent.save();
    }

    // También notificar al estudiante
    if (action === 'invited_to_apply' || action === 'contacted_directly') {
      await notificationController.createNotification(
        studentId,
        'match_interest',
        '🎉 Nueva Oportunidad',
        `${req.user.name} está interesado en tu perfil`,
        { entityType: 'MatchEvent', entityId: matchEvent._id }
      );
    }

    res.json({
      success: true,
      matchEvent
    });

  } catch (error) {
    console.error('Error registrando match:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/matchmaking/dashboard
 * Dashboard de matches para Facultad (coordinadores)
 */
exports.getMatchmakingDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { programId, startDate, endDate } = req.query;

    // Determinar alcance según rol
    let studentsQuery = {};
    
    if (req.user.role === 'DOCENTE') {
      // Coordinador: solo su programa
      studentsQuery.academicProgramRef = req.user.academicProgramRef;
    } else if (req.user.role === 'FACULTY') {
      // Decano: toda su facultad
      studentsQuery.facultyRef = req.user.facultyRef;
    } else if (req.user.role === 'ADMIN' || req.user.role === 'OWNER') {
      // Admin: toda la universidad
      studentsQuery.university = req.user.university;
    } else {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver dashboard de matchmaking'
      });
    }

    // Si se especifica programa, filtrar
    if (programId) {
      studentsQuery.academicProgramRef = programId;
    }

    // Obtener IDs de estudiantes del alcance
    const students = await User.find(studentsQuery).select('_id');
    const studentIds = students.map(s => s._id);

    // Query de matches
    const matchQuery = {
      student: { $in: studentIds }
    };

    // Filtrar por fechas si se especifican
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // KPIs
    const totalMatches = await MatchEvent.countDocuments(matchQuery);
    
    const matchesActivos = await MatchEvent.countDocuments({
      ...matchQuery,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const matchesPorAccion = await MatchEvent.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    // Estudiantes verificados vs total
    const totalEstudiantes = await User.countDocuments(studentsQuery);
    const estudiantesVerificados = await User.countDocuments({
      ...studentsQuery,
      profileStatus: 'verified'
    });

    const indiceVerificacion = totalEstudiantes > 0 
      ? Math.round((estudiantesVerificados / totalEstudiantes) * 100)
      : 0;

    // Matches recientes con detalles
    const matchesRecientes = await MatchEvent.find(matchQuery)
      .populate('student', 'name profilePic academicProgramRef')
      .populate('organization', 'name profilePic')
      .populate({
        path: 'student',
        populate: { path: 'academicProgramRef', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Alertas pendientes
    const alertasPendientes = await MatchEvent.countDocuments({
      ...matchQuery,
      followUpStatus: 'pending',
      action: { $in: ['invited_to_apply', 'contacted_directly'] }
    });

    // Tasa de respuesta (simulada por ahora)
    const tasaRespuestaPromedio = 36; // horas

    res.json({
      success: true,
      dashboard: {
        kpis: {
          totalMatches,
          matchesActivos,
          indiceVerificacion,
          alertasPendientes,
          tasaRespuestaPromedio,
          totalEstudiantes,
          estudiantesVerificados
        },
        matchesPorAccion,
        matchesRecientes
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/matchmaking/alerts
 * Obtener alertas de matches pendientes para coordinador
 */
exports.getMatchAlerts = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    // Solo coordinadores
    if (req.user.role !== 'DOCENTE') {
      return res.status(403).json({
        success: false,
        message: 'Solo coordinadores pueden ver alertas'
      });
    }

    // Estudiantes del programa del coordinador
    const students = await User.find({
      academicProgramRef: req.user.academicProgramRef
    }).select('_id');

    const studentIds = students.map(s => s._id);

    // Matches con filtro de estado
    const query = {
      student: { $in: studentIds },
      action: { $in: ['invited_to_apply', 'contacted_directly', 'saved_candidate'] }
    };

    if (status !== 'all') {
      query.followUpStatus = status;
    }

    const alerts = await MatchEvent.find(query)
      .populate('student', 'name profilePic academicProgramRef email tel')
      .populate('organization', 'name profilePic email tel')
      .populate({
        path: 'student',
        populate: { path: 'academicProgramRef', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts
    });

  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/matchmaking/follow-up/:matchId
 * Actualizar seguimiento de un match
 */
exports.updateFollowUp = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, note } = req.body;

    const matchEvent = await MatchEvent.findById(matchId);

    if (!matchEvent) {
      return res.status(404).json({
        success: false,
        message: 'Match no encontrado'
      });
    }

    // Actualizar estado
    if (status) {
      matchEvent.followUpStatus = status;
    }

    // Agregar nota
    if (note) {
      matchEvent.followUpNotes.push({
        author: req.user._id,
        note,
        date: Date.now()
      });
    }

    await matchEvent.save();

    res.json({
      success: true,
      matchEvent
    });

  } catch (error) {
    console.error('Error actualizando seguimiento:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/matchmaking/stats/program/:programId
 * Estadísticas de matchmaking por programa
 */
exports.getProgramStats = async (req, res) => {
  try {
    const { programId } = req.params;
    const { months = 3 } = req.query;

    // Verificar autorización
    if (req.user.role === 'DOCENTE' && req.user.academicProgramRef.toString() !== programId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver estadísticas de este programa'
      });
    }

    const students = await User.find({ academicProgramRef: programId }).select('_id');
    const studentIds = students.map(s => s._id);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    // Tendencia de matches por semana
    const weeklyMatches = await MatchEvent.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    // Top organizaciones interesadas
    const topOrganizations = await MatchEvent.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$organization',
          matchCount: { $sum: 1 }
        }
      },
      { $sort: { matchCount: -1 } },
      { $limit: 10 }
    ]);

    // Poblar nombres de organizaciones
    const populatedOrgs = await User.populate(topOrganizations, {
      path: '_id',
      select: 'name profilePic'
    });

    res.json({
      success: true,
      stats: {
        weeklyMatches,
        topOrganizations: populatedOrgs
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
