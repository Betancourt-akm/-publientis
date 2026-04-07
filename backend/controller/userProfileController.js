const User = require('../models/userModel');
const AcademicProgram = require('../models/academicProgramModel');

// Actualizar perfil pedagógico del usuario
exports.updatePedagogicalProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      faculty,
      program,
      academicLevel,
      pedagogicalTags,
      academicStatus
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos pedagógicos
    if (faculty) user.faculty = faculty;
    if (program) user.program = program;
    if (academicLevel) user.academicLevel = academicLevel;
    if (pedagogicalTags) user.pedagogicalTags = pedagogicalTags;
    if (academicStatus) user.academicStatus = academicStatus;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Perfil pedagógico actualizado exitosamente',
      data: {
        faculty: user.faculty,
        program: user.program,
        academicLevel: user.academicLevel,
        pedagogicalTags: user.pedagogicalTags,
        academicStatus: user.academicStatus
      }
    });
  } catch (error) {
    console.error('Error en updatePedagogicalProfile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar perfil pedagógico'
    });
  }
};

// Agregar tag pedagógico
exports.addPedagogicalTag = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El tag es requerido'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.pedagogicalTags) {
      user.pedagogicalTags = [];
    }

    const normalizedTag = tag.trim();
    if (user.pedagogicalTags.includes(normalizedTag)) {
      return res.status(400).json({
        success: false,
        message: 'Este tag ya está en tu perfil'
      });
    }

    user.pedagogicalTags.push(normalizedTag);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Tag agregado exitosamente',
      data: { pedagogicalTags: user.pedagogicalTags }
    });
  } catch (error) {
    console.error('Error en addPedagogicalTag:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al agregar tag'
    });
  }
};

// Eliminar tag pedagógico
exports.removePedagogicalTag = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tag } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.pedagogicalTags = user.pedagogicalTags.filter(t => t !== tag);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Tag eliminado exitosamente',
      data: { pedagogicalTags: user.pedagogicalTags }
    });
  } catch (error) {
    console.error('Error en removePedagogicalTag:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar tag'
    });
  }
};

// Obtener perfil pedagógico completo
exports.getPedagogicalProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await User.findById(userId).select(
      'name email faculty program academicLevel pedagogicalTags academicStatus role'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si tiene programa, buscar detalles del programa académico
    let programDetails = null;
    if (user.program) {
      programDetails = await AcademicProgram.findOne({ name: user.program });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        },
        pedagogicalProfile: {
          faculty: user.faculty,
          program: user.program,
          academicLevel: user.academicLevel,
          pedagogicalTags: user.pedagogicalTags || [],
          academicStatus: user.academicStatus,
          programDetails
        }
      }
    });
  } catch (error) {
    console.error('Error en getPedagogicalProfile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener perfil pedagógico'
    });
  }
};

// Calcular matching pedagógico entre estudiante y oferta
exports.calculatePedagogicalMatch = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobOfferId } = req.params;

    const user = await User.findById(userId);
    const JobOffer = require('../models/jobOfferModel');
    const jobOffer = await JobOffer.findById(jobOfferId);

    if (!user || !jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Usuario u oferta no encontrada'
      });
    }

    let matchScore = 0;
    const matchDetails = {
      facultyMatch: false,
      programMatch: false,
      tagsMatch: 0,
      totalTags: 0,
      recommendations: []
    };

    // Validar facultad
    if (jobOffer.targetFaculties && jobOffer.targetFaculties.includes(user.faculty)) {
      matchScore += 30;
      matchDetails.facultyMatch = true;
    } else if (jobOffer.targetFaculties && jobOffer.targetFaculties.length > 0) {
      matchDetails.recommendations.push('Esta oferta está dirigida a otras facultades');
    }

    // Validar tags pedagógicos
    if (jobOffer.requiredPedagogicalTags && jobOffer.requiredPedagogicalTags.length > 0) {
      const userTags = user.pedagogicalTags || [];
      const matchingTags = jobOffer.requiredPedagogicalTags.filter(tag =>
        userTags.includes(tag)
      );

      matchDetails.tagsMatch = matchingTags.length;
      matchDetails.totalTags = jobOffer.requiredPedagogicalTags.length;

      const tagMatchPercentage = (matchingTags.length / jobOffer.requiredPedagogicalTags.length) * 70;
      matchScore += tagMatchPercentage;

      if (matchingTags.length === 0) {
        matchDetails.recommendations.push('Considera agregar tags pedagógicos relevantes a tu perfil');
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        matchScore: Math.round(matchScore),
        matchDetails,
        isGoodMatch: matchScore >= 60
      }
    });
  } catch (error) {
    console.error('Error en calculatePedagogicalMatch:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al calcular matching'
    });
  }
};
