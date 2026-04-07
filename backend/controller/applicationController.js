const Application = require('../models/applicationModel');
const JobOffer = require('../models/jobOfferModel');

// ========================================
// --- Postulaciones de Estudiantes ---
// ========================================

// Postularse a una oferta
const applyToJob = async (req, res) => {
  try {
    const { jobOfferId, coverLetter, resumeUrl } = req.body;
    const applicant = req.user;

    // Verificar que es estudiante
    if (!['STUDENT', 'USER'].includes(applicant.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo los estudiantes pueden postularse a ofertas'
      });
    }

    // Verificar que la oferta existe y está activa
    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    if (jobOffer.status !== 'activa') {
      return res.status(400).json({
        success: false,
        message: 'Esta oferta no está aceptando postulaciones'
      });
    }

    // Verificar deadline
    if (jobOffer.applicationDeadline && new Date() > jobOffer.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'El plazo de postulación ha vencido'
      });
    }

    // Verificar que no se haya postulado antes
    const existingApplication = await Application.findOne({
      applicant: applicant._id,
      jobOffer: jobOfferId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Ya te has postulado a esta oferta'
      });
    }

    // Calcular matching pedagógico
    const AcademicProgram = require('../models/academicProgramModel');
    let studentProgram = null;
    let pedagogicalAlignment = 0;
    let programMatch = false;

    if (applicant.program) {
      studentProgram = await AcademicProgram.findOne({ name: applicant.program });
    }

    // Calcular alineación pedagógica por tags
    if (jobOffer.requiredPedagogicalTags && jobOffer.requiredPedagogicalTags.length > 0) {
      const userTags = applicant.pedagogicalTags || [];
      const matchingTags = jobOffer.requiredPedagogicalTags.filter(tag =>
        userTags.includes(tag)
      );
      pedagogicalAlignment = Math.round((matchingTags.length / jobOffer.requiredPedagogicalTags.length) * 100);
    }

    // Validar si el programa del estudiante coincide con los programas objetivo
    if (studentProgram && jobOffer.targetPrograms && jobOffer.targetPrograms.length > 0) {
      programMatch = jobOffer.targetPrograms.some(p => p.toString() === studentProgram._id.toString());
    }

    // Crear la postulación con trazabilidad institucional
    const application = new Application({
      applicant: applicant._id,
      jobOffer: jobOfferId,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      studentProgram: studentProgram?._id || null,
      institutionalTracking: {
        programMatch,
        pedagogicalAlignment,
        approvedForProgram: false,
        facultyReview: false
      },
      statusHistory: [{
        status: 'postulado',
        changedBy: applicant._id,
        changedAt: new Date(),
        notes: `Postulación enviada. Matching pedagógico: ${pedagogicalAlignment}%`
      }]
    });

    await application.save();

    // Incrementar contador de postulaciones en la oferta
    await JobOffer.findByIdAndUpdate(jobOfferId, { $inc: { applicationCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Postulación enviada exitosamente',
      data: application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya te has postulado a esta oferta'
      });
    }
    console.error('Error al postularse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al enviar la postulación'
    });
  }
};

// Obtener mis postulaciones (estudiante)
const getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { applicant: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'jobOffer',
          select: 'title type modality location organization status compensation',
          populate: { path: 'organization', select: 'name profilePic' }
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las postulaciones'
    });
  }
};

// ========================================
// --- Gestión por Organización ---
// ========================================

// Obtener postulaciones de una oferta (organización)
const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Verificar que la oferta pertenece a la organización
    const jobOffer = await JobOffer.findById(jobId);
    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    if (jobOffer.organization.toString() !== req.user._id.toString() && !['ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estas postulaciones'
      });
    }

    const filter = { jobOffer: jobId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'name email profilePic faculty tel')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las postulaciones'
    });
  }
};

// Actualizar estado de una postulación (organización)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDate, interviewLocation, internalNotes, score } = req.body;

    const application = await Application.findById(id).populate('jobOffer');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    // Verificar permisos
    const isOwner = application.jobOffer.organization.toString() === req.user._id.toString();
    const isPrivileged = ['ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta postulación'
      });
    }

    // Actualizar estado
    if (status) {
      application.status = status;
      application.statusHistory.push({
        status,
        changedBy: req.user._id,
        changedAt: new Date(),
        notes: notes || ''
      });
    }

    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewLocation) application.interviewLocation = interviewLocation;
    if (internalNotes !== undefined) application.internalNotes = internalNotes;
    if (score !== undefined) application.score = score;

    await application.save();

    res.json({
      success: true,
      message: `Estado actualizado a: ${status || application.status}`,
      data: application
    });
  } catch (error) {
    console.error('Error al actualizar postulación:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la postulación'
    });
  }
};

// Retirar postulación (estudiante)
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para retirar esta postulación'
      });
    }

    if (['aceptado', 'rechazado', 'retirado'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'No se puede retirar una postulación en este estado'
      });
    }

    application.status = 'retirado';
    application.statusHistory.push({
      status: 'retirado',
      changedBy: req.user._id,
      changedAt: new Date(),
      notes: 'Postulación retirada por el estudiante'
    });

    await application.save();

    // Decrementar contador
    await JobOffer.findByIdAndUpdate(application.jobOffer, { $inc: { applicationCount: -1 } });

    res.json({
      success: true,
      message: 'Postulación retirada',
      data: application
    });
  } catch (error) {
    console.error('Error al retirar postulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al retirar la postulación'
    });
  }
};

// Obtener detalle de una postulación
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email profilePic faculty tel')
      .populate({
        path: 'jobOffer',
        populate: { path: 'organization', select: 'name email profilePic' }
      })
      .populate('statusHistory.changedBy', 'name role')
      .populate('universityReview.reviewedBy', 'name role');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    // Verificar permisos: el postulante, la organización, o la universidad
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isOrgOwner = application.jobOffer.organization._id.toString() === req.user._id.toString();
    const isPrivileged = ['ADMIN', 'OWNER', 'FACULTY', 'DOCENTE'].includes(req.user.role);

    if (!isApplicant && !isOrgOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta postulación'
      });
    }

    // No mostrar notas internas al estudiante
    if (isApplicant && !isOrgOwner && !isPrivileged) {
      application.internalNotes = undefined;
      application.score = undefined;
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error al obtener postulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la postulación'
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById
};
