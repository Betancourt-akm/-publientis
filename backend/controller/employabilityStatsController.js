const User = require('../models/userModel');
const Application = require('../models/applicationModel');
const JobOffer = require('../models/jobOfferModel');
const AcademicProgram = require('../models/academicProgramModel');

// Obtener embudo de conversión de empleabilidad
exports.getEmploymentFunnel = async (req, res) => {
  try {
    const { programId, faculty, startDate, endDate } = req.query;

    // Construir filtro base para estudiantes/egresados
    const userFilter = {
      role: { $in: ['STUDENT', 'USER'] }
    };

    if (programId) userFilter.program = programId;
    if (faculty) userFilter.faculty = faculty;

    // Total de estudiantes/egresados activos
    const totalUsers = await User.countDocuments(userFilter);

    // Estudiantes con perfil completo (tienen al menos un dato pedagógico)
    const profileCompleteCount = await User.countDocuments({
      ...userFilter,
      $or: [
        { 'pedagogicalTags.0': { $exists: true } },
        { 'portfolio.cv.0': { $exists: true } },
        { academicLevel: { $ne: null } }
      ]
    });

    // Estudiantes que han visto ofertas (han navegado pero no necesariamente aplicado)
    // Aproximación: estudiantes con al menos 1 postulación
    const searchingUsers = await Application.distinct('applicant', {
      createdAt: startDate && endDate 
        ? { $gte: new Date(startDate), $lte: new Date(endDate) }
        : undefined
    });
    const searchingCount = searchingUsers.length;

    // Estudiantes que han postulado
    const appliedCount = await User.countDocuments({
      ...userFilter,
      _id: { $in: searchingUsers }
    });

    // Estudiantes en proceso (estados: en_revision, preseleccionado, entrevista)
    const inProcessApplications = await Application.find({
      status: { $in: ['en_revision', 'preseleccionado', 'entrevista'] },
      ...(startDate && endDate && {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
    }).distinct('applicant');

    const inProcessUsers = await User.find({
      ...userFilter,
      _id: { $in: inProcessApplications }
    });
    const inProcessCount = inProcessUsers.length;

    // Estudiantes vinculados/aceptados
    const placedApplications = await Application.find({
      status: 'aceptado',
      ...(startDate && endDate && {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
    }).distinct('applicant');

    const placedUsers = await User.find({
      ...userFilter,
      _id: { $in: placedApplications }
    });
    const placedCount = placedUsers.length;

    // Calcular porcentajes
    const calculatePercentage = (count, total) => 
      total > 0 ? Math.round((count / total) * 100) : 0;

    const funnel = {
      total: totalUsers,
      stages: {
        registered: {
          count: totalUsers,
          percentage: 100,
          label: 'Registrados'
        },
        profileComplete: {
          count: profileCompleteCount,
          percentage: calculatePercentage(profileCompleteCount, totalUsers),
          label: 'Perfil Completo'
        },
        searching: {
          count: searchingCount,
          percentage: calculatePercentage(searchingCount, totalUsers),
          label: 'Buscando Activamente'
        },
        applied: {
          count: appliedCount,
          percentage: calculatePercentage(appliedCount, totalUsers),
          label: 'Han Postulado'
        },
        inProcess: {
          count: inProcessCount,
          percentage: calculatePercentage(inProcessCount, totalUsers),
          label: 'En Proceso de Selección'
        },
        placed: {
          count: placedCount,
          percentage: calculatePercentage(placedCount, totalUsers),
          label: 'Vinculados Exitosamente'
        }
      }
    };

    res.json({
      success: true,
      funnel
    });
  } catch (error) {
    console.error('Error al obtener embudo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener embudo de empleabilidad'
    });
  }
};

// Métricas por programa académico
exports.getStatsByProgram = async (req, res) => {
  try {
    const { faculty } = req.query;

    // Obtener todos los programas
    const programFilter = faculty ? { faculty } : {};
    const programs = await AcademicProgram.find(programFilter);

    const statsByProgram = await Promise.all(
      programs.map(async (program) => {
        // Total de estudiantes del programa
        const totalStudents = await User.countDocuments({
          program: program.name,
          role: { $in: ['STUDENT', 'USER'] }
        });

        // Estudiantes vinculados del programa
        const placedApplications = await Application.find({
          status: 'aceptado'
        }).distinct('applicant');

        const placedStudents = await User.countDocuments({
          program: program.name,
          role: { $in: ['STUDENT', 'USER'] },
          _id: { $in: placedApplications }
        });

        // Tasa de vinculación
        const placementRate = totalStudents > 0 
          ? Math.round((placedStudents / totalStudents) * 100) 
          : 0;

        // Tiempo promedio de vinculación (días desde primera postulación hasta aceptación)
        const acceptedApps = await Application.find({
          status: 'aceptado'
        }).populate('applicant', 'program');

        const programAccepted = acceptedApps.filter(
          app => app.applicant?.program === program.name
        );

        let avgTimeToPlacement = 0;
        if (programAccepted.length > 0) {
          const totalDays = programAccepted.reduce((sum, app) => {
            const acceptedDate = app.statusHistory.find(
              h => h.status === 'aceptado'
            )?.changedAt || app.updatedAt;
            const days = Math.floor(
              (new Date(acceptedDate) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0);
          avgTimeToPlacement = Math.round(totalDays / programAccepted.length);
        }

        return {
          program: program.name,
          faculty: program.faculty,
          totalStudents,
          placedStudents,
          placementRate,
          avgTimeToPlacement
        };
      })
    );

    // Ordenar por tasa de vinculación
    statsByProgram.sort((a, b) => b.placementRate - a.placementRate);

    res.json({
      success: true,
      programs: statsByProgram
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por programa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas por programa'
    });
  }
};

// Línea de tiempo de vinculaciones (por mes)
exports.getPlacementTimeline = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsAgo = parseInt(months);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);

    // Obtener todas las aplicaciones aceptadas en el período
    const acceptedApplications = await Application.find({
      status: 'aceptado',
      updatedAt: { $gte: startDate }
    }).sort('updatedAt');

    // Agrupar por mes
    const timelineData = {};
    acceptedApplications.forEach(app => {
      const month = new Date(app.updatedAt).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short'
      });
      timelineData[month] = (timelineData[month] || 0) + 1;
    });

    // Convertir a array
    const timeline = Object.entries(timelineData).map(([month, count]) => ({
      month,
      placements: count
    }));

    res.json({
      success: true,
      timeline
    });
  } catch (error) {
    console.error('Error al obtener línea de tiempo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener línea de tiempo'
    });
  }
};

// Instituciones con más contrataciones
exports.getTopInstitutions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Obtener aplicaciones aceptadas agrupadas por organización
    const acceptedApplications = await Application.find({
      status: 'aceptado'
    }).populate({
      path: 'jobOffer',
      select: 'organization',
      populate: {
        path: 'organization',
        select: 'name profilePic'
      }
    });

    // Contar por organización
    const institutionCounts = {};
    acceptedApplications.forEach(app => {
      if (app.jobOffer?.organization) {
        const orgId = app.jobOffer.organization._id.toString();
        if (!institutionCounts[orgId]) {
          institutionCounts[orgId] = {
            organization: app.jobOffer.organization,
            count: 0
          };
        }
        institutionCounts[orgId].count++;
      }
    });

    // Convertir a array y ordenar
    const topInstitutions = Object.values(institutionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit))
      .map(item => ({
        name: item.organization.name,
        profilePic: item.organization.profilePic,
        hiredCount: item.count
      }));

    res.json({
      success: true,
      institutions: topInstitutions
    });
  } catch (error) {
    console.error('Error al obtener instituciones top:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener instituciones top'
    });
  }
};

// Ranking de centros de práctica (evaluación promedio)
exports.getPracticeCenters = async (req, res) => {
  try {
    // Este endpoint será completado cuando se implemente el sistema de evaluaciones
    // Por ahora, retornar datos básicos de instituciones que han contratado

    const acceptedApplications = await Application.find({
      status: 'aceptado'
    }).populate({
      path: 'jobOffer',
      select: 'organization type',
      populate: {
        path: 'organization',
        select: 'name profilePic'
      }
    });

    // Filtrar solo ofertas de tipo práctica
    const practiceApplications = acceptedApplications.filter(
      app => app.jobOffer?.type === 'Práctica Profesional'
    );

    // Agrupar por institución
    const centerCounts = {};
    practiceApplications.forEach(app => {
      if (app.jobOffer?.organization) {
        const orgId = app.jobOffer.organization._id.toString();
        if (!centerCounts[orgId]) {
          centerCounts[orgId] = {
            organization: app.jobOffer.organization,
            practiceCount: 0,
            avgRating: 0 // Placeholder para cuando se implemente evaluaciones
          };
        }
        centerCounts[orgId].practiceCount++;
      }
    });

    const practiceCenters = Object.values(centerCounts)
      .sort((a, b) => b.practiceCount - a.practiceCount)
      .map(item => ({
        name: item.organization.name,
        profilePic: item.organization.profilePic,
        practiceCount: item.practiceCount,
        avgRating: item.avgRating
      }));

    res.json({
      success: true,
      centers: practiceCenters,
      note: 'Las calificaciones serán agregadas cuando se implemente el sistema de evaluaciones'
    });
  } catch (error) {
    console.error('Error al obtener centros de práctica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener centros de práctica'
    });
  }
};

// KPIs generales
exports.getGeneralKPIs = async (req, res) => {
  try {
    // Total de estudiantes activos
    const totalStudents = await User.countDocuments({
      role: { $in: ['STUDENT', 'USER'] }
    });

    // Total vinculados
    const placedApplications = await Application.find({
      status: 'aceptado'
    }).distinct('applicant');
    const totalPlaced = placedApplications.length;

    // Tasa de empleabilidad general
    const employabilityRate = totalStudents > 0 
      ? Math.round((totalPlaced / totalStudents) * 100) 
      : 0;

    // Tiempo promedio de vinculación
    const acceptedApps = await Application.find({ status: 'aceptado' });
    let avgTimeToPlacement = 0;
    if (acceptedApps.length > 0) {
      const totalDays = acceptedApps.reduce((sum, app) => {
        const acceptedDate = app.statusHistory.find(
          h => h.status === 'aceptado'
        )?.changedAt || app.updatedAt;
        const days = Math.floor(
          (new Date(acceptedDate) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgTimeToPlacement = Math.round(totalDays / acceptedApps.length);
    }

    // Total de ofertas activas
    const activeOffers = await JobOffer.countDocuments({
      status: 'activa'
    });

    // Total de postulaciones este mes
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const applicationsThisMonth = await Application.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    res.json({
      success: true,
      kpis: {
        totalStudents,
        totalPlaced,
        employabilityRate,
        avgTimeToPlacement,
        activeOffers,
        applicationsThisMonth
      }
    });
  } catch (error) {
    console.error('Error al obtener KPIs generales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener KPIs generales'
    });
  }
};
