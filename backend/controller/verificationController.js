const User = require('../models/userModel');
let notificationController;
try {
  notificationController = require('./notificationController');
} catch (e) {
  console.warn('notificationController no disponible:', e.message);
  notificationController = { createNotification: async () => {} };
}

/**
 * VerificationController - Sistema de Verificación Académica
 * 
 * Gestiona el flujo de verificación de egresados por parte
 * de coordinadores de programa (Facultad).
 * 
 * Flujo: incomplete → pending_verification → verified/rejected
 */

/**
 * POST /api/verification/request
 * Solicitar verificación de perfil (Egresado)
 */
exports.requestVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.profileStatus === 'verified') {
      return res.status(400).json({ success: false, message: 'Tu perfil ya está verificado' });
    }

    if (user.profileStatus === 'pending_verification') {
      return res.status(400).json({ success: false, message: 'Ya tienes una solicitud pendiente' });
    }

    // Validar completitud mínima del perfil
    const completeness = calculateProfileCompleteness(user);
    if (completeness < 60) {
      return res.status(400).json({
        success: false,
        message: `Tu perfil debe estar al menos 60% completo para solicitar verificación. Actualmente: ${completeness}%`,
        profileCompleteness: completeness
      });
    }

    // Actualizar estado
    user.profileStatus = 'pending_verification';
    user.profileCompleteness = completeness;
    user.verificationHistory.push({
      action: 'requested',
      date: new Date(),
      notes: 'Solicitud enviada por el usuario'
    });
    
    await user.save();

    // Notificar al coordinador del programa
    if (user.academicProgramRef) {
      const coordinator = await User.findOne({
        role: 'DOCENTE',
        academicProgramRef: user.academicProgramRef
      });

      if (coordinator) {
        await notificationController.createNotification(
          coordinator._id,
          'verification_request',
          'Nueva Solicitud de Verificación',
          `${user.name} solicita verificación de su perfil académico`,
          { entityType: 'User', entityId: user._id }
        );
      }
    }

    res.json({
      success: true,
      message: 'Solicitud de verificación enviada. Tu coordinador la revisará pronto.',
      profileStatus: user.profileStatus,
      profileCompleteness: completeness
    });

  } catch (error) {
    console.error('Error solicitando verificación:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/verification/pending
 * Obtener solicitudes pendientes (Coordinador/Facultad)
 */
exports.getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Determinar alcance según rol
    let query = { profileStatus: 'pending_verification' };

    if (req.user.role === 'DOCENTE') {
      query.academicProgramRef = req.user.academicProgramRef;
    } else if (req.user.role === 'FACULTY') {
      query.facultyRef = req.user.facultyRef;
    }
    // ADMIN/OWNER ven todas

    const total = await User.countDocuments(query);
    const pendingUsers = await User.find(query)
      .select('name email profilePic profileCompleteness academicProgramRef facultyRef pedagogicalEmphasis createdAt')
      .populate('academicProgramRef', 'name')
      .populate('facultyRef', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      pending: pendingUsers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo verificaciones pendientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/verification/approve/:userId
 * Aprobar verificación (Coordinador)
 */
exports.approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.profileStatus !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'Este usuario no tiene solicitud pendiente' });
    }

    // Verificar que el coordinador tenga autorización sobre este programa
    if (req.user.role === 'DOCENTE') {
      if (user.academicProgramRef?.toString() !== req.user.academicProgramRef?.toString()) {
        return res.status(403).json({ success: false, message: 'No tienes autorización sobre este programa' });
      }
    }

    // Aprobar
    user.profileStatus = 'verified';
    user.visibilityLevel = 'public';
    user.verifiedBy = {
      facultyCoordinator: req.user._id,
      verificationDate: new Date(),
      verificationNotes: notes || 'Perfil aprobado por coordinador'
    };
    user.verificationHistory.push({
      action: 'approved',
      coordinator: req.user._id,
      date: new Date(),
      notes: notes || 'Perfil aprobado'
    });
    
    await user.save();

    // Notificar al estudiante
    await notificationController.createNotification(
      user._id,
      'verification_approved',
      '✅ Perfil Verificado',
      'Tu perfil ha sido verificado por tu coordinador. Ahora eres visible para organizaciones.',
      { entityType: 'User', entityId: user._id }
    );

    res.json({
      success: true,
      message: `Perfil de ${user.name} verificado exitosamente`,
      user: {
        _id: user._id,
        name: user.name,
        profileStatus: user.profileStatus,
        visibilityLevel: user.visibilityLevel
      }
    });

  } catch (error) {
    console.error('Error aprobando verificación:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/verification/reject/:userId
 * Rechazar verificación (Coordinador)
 */
exports.rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar una razón detallada para el rechazo (mínimo 10 caracteres)'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.profileStatus !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'Este usuario no tiene solicitud pendiente' });
    }

    // Rechazar
    user.profileStatus = 'rejected';
    user.visibilityLevel = 'hidden';
    user.verificationHistory.push({
      action: 'rejected',
      coordinator: req.user._id,
      date: new Date(),
      notes
    });
    
    await user.save();

    // Notificar al estudiante con la razón
    await notificationController.createNotification(
      user._id,
      'verification_rejected',
      'Verificación Rechazada',
      `Tu solicitud de verificación fue rechazada. Razón: ${notes}`,
      { entityType: 'User', entityId: user._id }
    );

    res.json({
      success: true,
      message: `Verificación de ${user.name} rechazada`,
      user: {
        _id: user._id,
        name: user.name,
        profileStatus: user.profileStatus
      }
    });

  } catch (error) {
    console.error('Error rechazando verificación:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/verification/stats
 * Estadísticas de verificación (Dashboard)
 */
exports.getVerificationStats = async (req, res) => {
  try {
    let baseQuery = {};

    if (req.user.role === 'DOCENTE') {
      baseQuery.academicProgramRef = req.user.academicProgramRef;
    } else if (req.user.role === 'FACULTY') {
      baseQuery.facultyRef = req.user.facultyRef;
    }

    const [total, incomplete, pending, verified, rejected] = await Promise.all([
      User.countDocuments({ ...baseQuery, role: { $in: ['STUDENT', 'USER'] } }),
      User.countDocuments({ ...baseQuery, profileStatus: 'incomplete', role: { $in: ['STUDENT', 'USER'] } }),
      User.countDocuments({ ...baseQuery, profileStatus: 'pending_verification' }),
      User.countDocuments({ ...baseQuery, profileStatus: 'verified' }),
      User.countDocuments({ ...baseQuery, profileStatus: 'rejected' })
    ]);

    res.json({
      success: true,
      stats: {
        total,
        incomplete,
        pending,
        verified,
        rejected,
        verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Calcular completitud del perfil
 */
function calculateProfileCompleteness(user) {
  let score = 0;
  const weights = {
    name: 10,
    email: 10,
    profilePic: 10,
    bio: 10,
    academicProgramRef: 15,
    facultyRef: 10,
    pedagogicalEmphasis: 15,
    tel: 5,
    location: 5,
    portfolio: 10
  };

  if (user.name && user.name.trim()) score += weights.name;
  if (user.email) score += weights.email;
  if (user.profilePic) score += weights.profilePic;
  if (user.bio && user.bio.length > 20) score += weights.bio;
  if (user.academicProgramRef) score += weights.academicProgramRef;
  if (user.facultyRef) score += weights.facultyRef;
  if (user.pedagogicalEmphasis && user.pedagogicalEmphasis.length > 0) score += weights.pedagogicalEmphasis;
  if (user.tel) score += weights.tel;
  if (user.location) score += weights.location;
  // Portfolio check would need a separate query in production
  score += weights.portfolio * 0.5; // Base score for having an account

  return Math.min(100, score);
}
