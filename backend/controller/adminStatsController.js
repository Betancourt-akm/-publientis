const Application = require('../models/applicationModel');
const JobOffer = require('../models/jobOfferModel');
const User = require('../models/userModel');

// Métricas de "Semáforo de Respuesta" - Tiempo de atención institucional
exports.getResponseTrafficLight = async (req, res) => {
  try {
    const now = new Date();
    const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000);

    // Postulaciones sin respuesta en más de 5 días
    const stuckApplications = await Application.find({
      status: 'pendiente',
      createdAt: { $lt: fiveDaysAgo }
    })
      .populate('applicant', 'name email faculty program')
      .populate('jobOffer', 'title organization')
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'organization',
          select: 'name email'
        }
      });

    // Tiempo promedio de primera respuesta por institución
    const allApplications = await Application.find({
      status: { $ne: 'pendiente' }
    })
      .populate({
        path: 'jobOffer',
        select: 'organization'
      });

    const institutionResponseTimes = {};

    allApplications.forEach(app => {
      if (!app.jobOffer || !app.jobOffer.organization) return;

      const orgId = app.jobOffer.organization.toString();
      const firstResponse = app.statusHistory.find(h => h.status !== 'pendiente');

      if (firstResponse) {
        const responseTime = Math.floor(
          (new Date(firstResponse.changedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)
        );

        if (!institutionResponseTimes[orgId]) {
          institutionResponseTimes[orgId] = {
            total: 0,
            count: 0
          };
        }

        institutionResponseTimes[orgId].total += responseTime;
        institutionResponseTimes[orgId].count += 1;
      }
    });

    // Calcular promedios y clasificar por semáforo
    const institutionMetrics = await Promise.all(
      Object.entries(institutionResponseTimes).map(async ([orgId, data]) => {
        const avgDays = data.total / data.count;
        const organization = await User.findById(orgId).select('name email profilePic');

        let trafficLight;
        if (avgDays <= 2) {
          trafficLight = 'green'; // Excelente
        } else if (avgDays <= 5) {
          trafficLight = 'yellow'; // Aceptable
        } else {
          trafficLight = 'red'; // Lento - requiere intervención
        }

        return {
          organization: {
            id: orgId,
            name: organization?.name,
            email: organization?.email,
            profilePic: organization?.profilePic
          },
          avgResponseDays: Math.round(avgDays * 10) / 10,
          totalApplications: data.count,
          trafficLight
        };
      })
    );

    // Ordenar por tiempo de respuesta (de mayor a menor para identificar problemas)
    institutionMetrics.sort((a, b) => b.avgResponseDays - a.avgResponseDays);

    res.json({
      success: true,
      metrics: {
        stuckCount: stuckApplications.length,
        stuckApplications: stuckApplications.map(app => ({
          id: app._id,
          applicant: app.applicant?.name,
          jobTitle: app.jobOffer?.title,
          institution: app.jobOffer?.organization?.name,
          daysWaiting: Math.floor((now - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)),
          appliedAt: app.createdAt
        })),
        institutionMetrics,
        summary: {
          green: institutionMetrics.filter(m => m.trafficLight === 'green').length,
          yellow: institutionMetrics.filter(m => m.trafficLight === 'yellow').length,
          red: institutionMetrics.filter(m => m.trafficLight === 'red').length
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener semáforo de respuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de respuesta'
    });
  }
};

// Validador de Convenios - Instituciones con convenio vencido o próximo a vencer
exports.getConvenioStatus = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Buscar organizaciones con convenio
    const organizations = await User.find({
      role: 'ORGANIZATION',
      'convenio.expirationDate': { $exists: true }
    }).select('name email convenio profilePic');

    const convenioStatus = organizations.map(org => {
      const expiration = new Date(org.convenio.expirationDate);
      const daysUntilExpiration = Math.floor((expiration - now) / (1000 * 60 * 60 * 24));

      let status;
      let canPublish = true;

      if (daysUntilExpiration < 0) {
        status = 'expired'; // Vencido
        canPublish = false;
      } else if (daysUntilExpiration <= 30) {
        status = 'expiring_soon'; // Por vencer
        canPublish = true; // Aún puede publicar pero debe renovar
      } else {
        status = 'active'; // Vigente
        canPublish = true;
      }

      return {
        organizationId: org._id,
        name: org.name,
        email: org.email,
        profilePic: org.profilePic,
        convenio: {
          startDate: org.convenio.startDate,
          expirationDate: org.convenio.expirationDate,
          documentUrl: org.convenio.documentUrl,
          daysUntilExpiration,
          status,
          canPublish
        }
      };
    });

    // Ordenar por urgencia (vencidos primero, luego por vencer)
    convenioStatus.sort((a, b) => a.convenio.daysUntilExpiration - b.convenio.daysUntilExpiration);

    res.json({
      success: true,
      convenios: convenioStatus,
      summary: {
        total: convenioStatus.length,
        expired: convenioStatus.filter(c => c.convenio.status === 'expired').length,
        expiringSoon: convenioStatus.filter(c => c.convenio.status === 'expiring_soon').length,
        active: convenioStatus.filter(c => c.convenio.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de convenios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de convenios'
    });
  }
};

// Aprobar/Rechazar vacante
exports.approveJobOffer = async (req, res) => {
  try {
    const { jobOfferId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Acción inválida'
      });
    }

    const jobOffer = await JobOffer.findById(jobOfferId).populate('organization', 'name email convenio');

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    // Verificar convenio vigente antes de aprobar
    if (action === 'approve' && jobOffer.organization.convenio) {
      const expirationDate = new Date(jobOffer.organization.convenio.expirationDate);
      if (expirationDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'No se puede aprobar. El convenio de la institución ha vencido.'
        });
      }
    }

    jobOffer.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    jobOffer.approvedBy = req.user._id;
    jobOffer.approvedAt = new Date();

    if (action === 'reject' && rejectionReason) {
      jobOffer.rejectionReason = rejectionReason;
      jobOffer.status = 'pausada'; // Pausar si se rechaza
    } else if (action === 'approve') {
      jobOffer.status = 'activa'; // Activar si se aprueba
    }

    await jobOffer.save();

    // Notificar a la organización
    const { createNotification } = require('./notificationController');
    await createNotification(
      jobOffer.organization._id,
      'job_offer_status',
      `Oferta ${action === 'approve' ? 'aprobada' : 'rechazada'}`,
      action === 'approve'
        ? `Tu oferta "${jobOffer.title}" ha sido aprobada y está visible`
        : `Tu oferta "${jobOffer.title}" fue rechazada. Motivo: ${rejectionReason || 'No especificado'}`,
      { entityType: 'JobOffer', entityId: jobOfferId },
      `/jobs/${jobOfferId}`
    );

    res.json({
      success: true,
      message: `Oferta ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
      jobOffer
    });
  } catch (error) {
    console.error('Error al aprobar/rechazar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
};

// Obtener ofertas pendientes de aprobación
exports.getPendingJobOffers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pendingOffers = await JobOffer.find({
      approvalStatus: 'pending'
    })
      .populate('organization', 'name email profilePic convenio')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await JobOffer.countDocuments({ approvalStatus: 'pending' });

    res.json({
      success: true,
      offers: pendingOffers,
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

// KPIs del Admin Dashboard
exports.getAdminKPIs = async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total de estudiantes vinculados este mes
    const vinculadosEsteMes = await Application.countDocuments({
      status: 'aceptado',
      updatedAt: { $gte: thisMonth }
    });

    // Plazas de práctica disponibles (ofertas activas y aprobadas)
    const plazasDisponibles = await JobOffer.aggregate([
      {
        $match: {
          status: 'activa',
          approvalStatus: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalSlots: { $sum: '$slots' }
        }
      }
    ]);

    // Ofertas pendientes de aprobación
    const ofertasPendientes = await JobOffer.countDocuments({
      approvalStatus: 'pending'
    });

    // Estudiantes estancados (sin respuesta en >5 días)
    const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000);
    const estudiantesEstancados = await Application.countDocuments({
      status: 'pendiente',
      createdAt: { $lt: fiveDaysAgo }
    });

    // Convenios por vencer (próximos 30 días)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const conveniosPorVencer = await User.countDocuments({
      role: 'ORGANIZATION',
      'convenio.expirationDate': {
        $gte: now,
        $lte: thirtyDaysFromNow
      }
    });

    res.json({
      success: true,
      kpis: {
        vinculadosEsteMes,
        plazasDisponibles: plazasDisponibles[0]?.totalSlots || 0,
        ofertasPendientes,
        estudiantesEstancados,
        conveniosPorVencer
      }
    });
  } catch (error) {
    console.error('Error al obtener KPIs de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener KPIs'
    });
  }
};
