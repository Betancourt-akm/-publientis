const JobOffer = require('../models/jobOfferModel');
const Application = require('../models/applicationModel');

// ========================================
// --- CRUD de Ofertas Laborales ---
// ========================================

// Crear oferta (ORGANIZATION)
const createJobOffer = async (req, res) => {
  try {
    const user = req.user;

    if (!['ORGANIZATION', 'ADMIN', 'OWNER'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo las organizaciones pueden crear ofertas'
      });
    }

    const jobData = {
      ...req.body,
      organization: user._id,
      status: 'pendiente_aprobacion'
    };

    const jobOffer = new JobOffer(jobData);
    await jobOffer.save();

    res.status(201).json({
      success: true,
      message: 'Oferta creada exitosamente. Pendiente de aprobación universitaria.',
      data: jobOffer
    });
  } catch (error) {
    console.error('Error al crear oferta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la oferta'
    });
  }
};

// Obtener todas las ofertas activas (público para estudiantes)
const getActiveJobOffers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      faculty,
      modality,
      search,
      sort = '-createdAt'
    } = req.query;

    const filter = { status: 'activa' };

    if (type) filter.type = type;
    if (modality) filter.modality = modality;
    if (faculty) filter.targetFaculties = { $in: [faculty] };
    if (search) {
      filter.$text = { $search: search };
    }

    // Solo ofertas con deadline futuro o sin deadline
    filter.$or = [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobOffers, total] = await Promise.all([
      JobOffer.find(filter)
        .populate('organization', 'name email profilePic')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      JobOffer.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: jobOffers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas'
    });
  }
};

// Obtener oferta por ID
const getJobOfferById = async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id)
      .populate('organization', 'name email profilePic tel')
      .populate('approvedBy', 'name email');

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    // Incrementar contador de vistas
    jobOffer.viewCount += 1;
    await jobOffer.save();

    res.json({
      success: true,
      data: jobOffer
    });
  } catch (error) {
    console.error('Error al obtener oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la oferta'
    });
  }
};

// Actualizar oferta (solo la organización dueña)
const updateJobOffer = async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id);

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    // Solo el dueño o admin puede editar
    if (jobOffer.organization.toString() !== req.user._id.toString() && !['ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta oferta'
      });
    }

    // Si se edita una oferta activa, vuelve a pendiente de aprobación
    const updateData = { ...req.body };
    if (jobOffer.status === 'activa' && (req.body.title || req.body.description || req.body.requirements)) {
      updateData.status = 'pendiente_aprobacion';
    }

    const updated = await JobOffer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Oferta actualizada',
      data: updated
    });
  } catch (error) {
    console.error('Error al actualizar oferta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la oferta'
    });
  }
};

// Eliminar oferta
const deleteJobOffer = async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id);

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    if (jobOffer.organization.toString() !== req.user._id.toString() && !['ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta oferta'
      });
    }

    await JobOffer.findByIdAndDelete(req.params.id);
    // También eliminar las postulaciones asociadas
    await Application.deleteMany({ jobOffer: req.params.id });

    res.json({
      success: true,
      message: 'Oferta eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la oferta'
    });
  }
};

// Obtener ofertas de la organización autenticada
const getMyJobOffers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { organization: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobOffers, total] = await Promise.all([
      JobOffer.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      JobOffer.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: jobOffers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener mis ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas'
    });
  }
};

// ========================================
// --- Aprobación Universitaria ---
// ========================================

// Obtener ofertas pendientes de aprobación (FACULTY/DOCENTE/ADMIN)
const getPendingApproval = async (req, res) => {
  try {
    if (!['FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [offers, total] = await Promise.all([
      JobOffer.find({ status: 'pendiente_aprobacion' })
        .populate('organization', 'name email profilePic')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      JobOffer.countDocuments({ status: 'pendiente_aprobacion' })
    ]);

    res.json({
      success: true,
      data: offers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener ofertas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas pendientes'
    });
  }
};

// Aprobar oferta
const approveJobOffer = async (req, res) => {
  try {
    if (!['FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aprobar ofertas'
      });
    }

    const jobOffer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      {
        status: 'activa',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('organization', 'name email');

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Oferta aprobada y publicada',
      data: jobOffer
    });
  } catch (error) {
    console.error('Error al aprobar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar la oferta'
    });
  }
};

// Rechazar oferta
const rejectJobOffer = async (req, res) => {
  try {
    if (!['FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar ofertas'
      });
    }

    const { reason } = req.body;

    const jobOffer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rechazada',
        rejectionReason: reason || 'No cumple con los requisitos de la institución'
      },
      { new: true }
    );

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Oferta rechazada',
      data: jobOffer
    });
  } catch (error) {
    console.error('Error al rechazar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar la oferta'
    });
  }
};

// ========================================
// --- Métricas (Dashboard universitario) ---
// ========================================

const getJobStats = async (req, res) => {
  try {
    if (!['FACULTY', 'DOCENTE', 'ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estadísticas'
      });
    }

    const [
      totalOffers,
      activeOffers,
      pendingOffers,
      totalApplications,
      acceptedApplications,
      offersByType,
      offersByFaculty
    ] = await Promise.all([
      JobOffer.countDocuments(),
      JobOffer.countDocuments({ status: 'activa' }),
      JobOffer.countDocuments({ status: 'pendiente_aprobacion' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'aceptado' }),
      JobOffer.aggregate([
        { $match: { status: 'activa' } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      JobOffer.aggregate([
        { $match: { status: 'activa' } },
        { $unwind: '$targetFaculties' },
        { $group: { _id: '$targetFaculties', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOffers,
        activeOffers,
        pendingOffers,
        totalApplications,
        acceptedApplications,
        conversionRate: totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(1) : 0,
        offersByType,
        offersByFaculty
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

module.exports = {
  createJobOffer,
  getActiveJobOffers,
  getJobOfferById,
  updateJobOffer,
  deleteJobOffer,
  getMyJobOffers,
  getPendingApproval,
  approveJobOffer,
  rejectJobOffer,
  getJobStats
};
