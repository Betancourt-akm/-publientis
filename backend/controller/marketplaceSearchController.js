const User = require('../models/userModel');
const JobOffer = require('../models/jobOfferModel');
const AcademicProgram = require('../models/academicProgramModel');

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
      minRating = 0,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {
      role: { $in: ['STUDENT', 'USER'] },
    };

    // Buscar verificados primero, pero mostrar todos si no hay verificados
    // Para que la página no se vea vacía
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { pedagogicalEmphasis: { $regex: q, $options: 'i' } }
      ];
    }

    if (programId) {
      filter.academicProgramRef = programId;
    }

    if (emphasis) {
      const emphasisArr = emphasis.split(',').filter(Boolean);
      if (emphasisArr.length > 0) {
        filter.pedagogicalEmphasis = { $in: emphasisArr };
      }
    }

    if (minRating > 0) {
      filter.socialScore = { $gte: parseInt(minRating) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [talents, total] = await Promise.all([
      User.find(filter)
        .select('name email profilePic bio pedagogicalEmphasis academicProgramRef facultyRef university socialScore profileStatus profileCompleteness location createdAt')
        .populate('academicProgramRef', 'name')
        .populate('facultyRef', 'name')
        .populate('university', 'name')
        .sort({ socialScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      talents: talents,
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
