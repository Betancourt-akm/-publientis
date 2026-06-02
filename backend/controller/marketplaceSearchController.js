const User = require('../models/userModel');
const JobOffer = require('../models/jobOfferModel');
const AcademicProgram = require('../models/academicProgramModel');
const AcademicProfile = require('../modules/academic/models/AcademicProfile');

/**
 * MarketplaceSearchController
 * Endpoints públicos de búsqueda para el Marketplace de Talento
 */

// GET /api/marketplace/search-talent
const searchTalent = async (req, res) => {
  try {
    const {
      q = '',
      programId,
      emphasis,
      location,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { role: { $in: ['STUDENT', 'USER'] } };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { pedagogicalEmphasis: { $regex: q, $options: 'i' } }
      ];
    }

    if (programId) filter.academicProgramRef = programId;

    if (emphasis) {
      const emphasisArr = emphasis.split(',').filter(Boolean);
      if (emphasisArr.length > 0) filter.pedagogicalEmphasis = { $in: emphasisArr };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email profilePic pedagogicalEmphasis academicProgramRef facultyRef university socialScore profileStatus profileCompleteness portfolio address createdAt')
        .populate('academicProgramRef', 'name')
        .populate('facultyRef', 'name')
        .sort({ socialScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    // Enriquecer con datos de AcademicProfile (bio, skills, practices, location)
    const userIds = users.map(u => u._id);
    const profiles = await AcademicProfile.find({ userId: { $in: userIds } })
      .select('userId bio headline skills practices location educationHistory university faculty')
      .lean();

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    let talents = users.map(user => {
      const ap = profileMap[user._id.toString()] || {};

      // Portfolio: en User es objeto {cv:[], certificates:[], projects:[]}, no un array
      const portfolioFileCount =
        (user.portfolio?.cv?.length || 0) +
        (user.portfolio?.certificates?.length || 0) +
        (user.portfolio?.projects?.length || 0);

      // Emphasis: priorizar User.pedagogicalEmphasis, fallback a AcademicProfile.skills
      const emphasis =
        (user.pedagogicalEmphasis?.length > 0)
          ? user.pedagogicalEmphasis
          : (ap.skills || []);

      const latestEdu = ap.educationHistory?.[0];

      // Campo legacy: AcademicProfile.university es un string directo
      const legacyUniversity = ap.university || '';
      const legacyFaculty = ap.faculty || '';

      return {
        ...user,
        bio: ap.bio || '',
        headline: ap.headline || '',
        skills: ap.skills || [],
        emphasis,
        experienceCount: ap.practices?.length || 0,
        portfolioFileCount,
        location: ap.location || user.address || null,
        legacyUniversity,
        legacyFaculty,
        educationSummary: latestEdu
          ? { field: latestEdu.field || '', institution: latestEdu.institution || '', degree: latestEdu.degree || '' }
          : (legacyUniversity ? { field: '', institution: legacyUniversity, degree: '' } : null),
      };
    });

    // Filtro de ubicación (campo en AcademicProfile, no en User)
    if (location) {
      const loc = location.toLowerCase();
      talents = talents.filter(t =>
        t.location?.city?.toLowerCase().includes(loc) ||
        t.location?.country?.toLowerCase().includes(loc) ||
        t.address?.city?.toLowerCase().includes(loc)
      );
    }

    // Filtrar únicamente cuentas sin nombre
    talents = talents.filter(t => t.name && t.name.trim() !== '');

    // Re-ordenar: perfiles con datos reales primero, perfiles vacíos al final
    talents.sort((a, b) => {
      const scoreA =
        (a.emphasis?.length > 0 ? 3 : 0) +
        (a.experienceCount > 0    ? 3 : 0) +
        (a.headline               ? 2 : 0) +
        (a.portfolioFileCount > 0 ? 1 : 0) +
        (a.academicProgramRef     ? 1 : 0);
      const scoreB =
        (b.emphasis?.length > 0 ? 3 : 0) +
        (b.experienceCount > 0    ? 3 : 0) +
        (b.headline               ? 2 : 0) +
        (b.portfolioFileCount > 0 ? 1 : 0) +
        (b.academicProgramRef     ? 1 : 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.socialScore || 0) - (a.socialScore || 0);
    });

    res.json({
      success: true,
      talents,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error buscando talento:', error);
    res.status(500).json({ success: false, message: error.message, talents: [] });
  }
};

// GET /api/marketplace/search-jobs
const searchJobs = async (req, res) => {
  try {
    const {
      q = '',
      programId,
      location,
      jobType,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { status: 'activa' };

    // Solo ofertas con deadline futuro o sin deadline
    filter.$or = [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null }
    ];

    if (q) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      });
    }

    if (jobType) filter.type = jobType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (programId) filter.targetPrograms = { $in: [programId] };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      JobOffer.find(filter)
        .populate('organization', 'name email profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobOffer.countDocuments(filter)
    ]);

    res.json({
      success: true,
      jobs: jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error buscando vacantes:', error);
    res.status(500).json({ success: false, message: error.message, jobs: [] });
  }
};

// GET /api/marketplace/programs (todos los programas para filtros)
const getAllPrograms = async (req, res) => {
  try {
    let programs = [];

    // Buscar en AcademicProgram
    try {
      programs = await AcademicProgram.find({})
        .select('name faculty')
        .populate('faculty', 'name')
        .sort({ name: 1 })
        .lean();
    } catch (e) {
      console.error('Error buscando programas:', e);
    }

    // Si no hay programas en la colección, extraer de usuarios
    if (!programs || programs.length === 0) {
      const userPrograms = await User.distinct('academicProgramRef');
      if (userPrograms.length > 0) {
        programs = userPrograms.filter(Boolean).map(id => ({ _id: id, name: 'Programa' }));
      }
    }

    res.json({
      success: true,
      programs: programs || []
    });

  } catch (error) {
    console.error('Error obteniendo programas:', error);
    res.json({ success: true, programs: [] });
  }
};

// GET /api/marketplace/stats (estadísticas públicas del marketplace)
const getMarketplaceStats = async (req, res) => {
  try {
    const [totalTalent, totalJobs, totalOrgs] = await Promise.all([
      User.countDocuments({ role: { $in: ['STUDENT', 'USER'] } }),
      JobOffer.countDocuments({ status: 'activa' }),
      User.countDocuments({ role: 'ORGANIZATION' })
    ]);

    res.json({
      success: true,
      stats: {
        totalTalent,
        totalJobs,
        totalOrgs,
        verifiedTalent: await User.countDocuments({ profileStatus: 'verified' })
      }
    });

  } catch (error) {
    console.error('Error obteniendo stats:', error);
    res.json({
      success: true,
      stats: { totalTalent: 0, totalJobs: 0, totalOrgs: 0, verifiedTalent: 0 }
    });
  }
};

module.exports = {
  searchTalent,
  searchJobs,
  getAllPrograms,
  getMarketplaceStats
};
