const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// Guardar candidato en favoritos
exports.saveCandidate = async (req, res) => {
  try {
    const { candidateId, notes, tags, jobOfferId } = req.body;
    const organizationId = req.user._id;

    // Verificar que el usuario actual sea una organización
    if (req.user.role !== 'ORGANIZATION' && !['ADMIN', 'OWNER'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo las organizaciones pueden guardar candidatos'
      });
    }

    // Verificar que el candidato existe y es estudiante
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidato no encontrado'
      });
    }

    if (!['STUDENT', 'USER'].includes(candidate.role)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden guardar estudiantes'
      });
    }

    // Verificar si ya está guardado
    const organization = await User.findById(organizationId);
    const alreadySaved = organization.savedCandidates.some(
      saved => saved.candidate.toString() === candidateId
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Este candidato ya está en tus guardados'
      });
    }

    // Agregar a guardados
    const savedCandidate = {
      candidate: candidateId,
      notes: notes || '',
      tags: tags || [],
      jobOffer: jobOfferId || null,
      savedAt: new Date()
    };

    organization.savedCandidates.push(savedCandidate);
    await organization.save();

    // Notificar al candidato (opcional - puede ser motivador)
    await createNotification(
      candidateId,
      'saved_candidate',
      'Una institución guardó tu perfil',
      'Tu perfil ha llamado la atención de una organización educativa',
      { entityType: 'User', entityId: organizationId },
      '/perfil'
    );

    res.status(201).json({
      success: true,
      message: 'Candidato guardado exitosamente',
      savedCandidate
    });
  } catch (error) {
    console.error('Error al guardar candidato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar candidato'
    });
  }
};

// Quitar candidato de guardados
exports.removeSavedCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const organizationId = req.user._id;

    const organization = await User.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    const initialLength = organization.savedCandidates.length;
    organization.savedCandidates = organization.savedCandidates.filter(
      saved => saved.candidate.toString() !== candidateId
    );

    if (organization.savedCandidates.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Candidato no encontrado en guardados'
      });
    }

    await organization.save();

    res.json({
      success: true,
      message: 'Candidato removido de guardados'
    });
  } catch (error) {
    console.error('Error al remover candidato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover candidato'
    });
  }
};

// Obtener todos los candidatos guardados
exports.getSavedCandidates = async (req, res) => {
  try {
    const { tag, jobOfferId, page = 1, limit = 20 } = req.query;
    const organizationId = req.user._id;

    const organization = await User.findById(organizationId)
      .populate({
        path: 'savedCandidates.candidate',
        select: 'name email profilePic faculty program pedagogicalTags academicLevel tel'
      })
      .populate({
        path: 'savedCandidates.jobOffer',
        select: 'title type'
      });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    let savedCandidates = organization.savedCandidates;

    // Filtrar por tag si se especifica
    if (tag) {
      savedCandidates = savedCandidates.filter(saved => 
        saved.tags.includes(tag)
      );
    }

    // Filtrar por oferta laboral si se especifica
    if (jobOfferId) {
      savedCandidates = savedCandidates.filter(saved => 
        saved.jobOffer && saved.jobOffer._id.toString() === jobOfferId
      );
    }

    // Ordenar por fecha más reciente
    savedCandidates.sort((a, b) => b.savedAt - a.savedAt);

    // Paginación manual
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCandidates = savedCandidates.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      savedCandidates: paginatedCandidates,
      pagination: {
        total: savedCandidates.length,
        page: parseInt(page),
        pages: Math.ceil(savedCandidates.length / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener candidatos guardados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener candidatos guardados'
    });
  }
};

// Actualizar notas de un candidato guardado
exports.updateCandidateNotes = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { notes, tags } = req.body;
    const organizationId = req.user._id;

    const organization = await User.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    const savedCandidate = organization.savedCandidates.find(
      saved => saved.candidate.toString() === candidateId
    );

    if (!savedCandidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidato no encontrado en guardados'
      });
    }

    if (notes !== undefined) savedCandidate.notes = notes;
    if (tags !== undefined) savedCandidate.tags = tags;

    await organization.save();

    res.json({
      success: true,
      message: 'Notas actualizadas',
      savedCandidate
    });
  } catch (error) {
    console.error('Error al actualizar notas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notas'
    });
  }
};

// Verificar si un candidato está guardado
exports.checkIfSaved = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const organizationId = req.user._id;

    const organization = await User.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    const isSaved = organization.savedCandidates.some(
      saved => saved.candidate.toString() === candidateId
    );

    res.json({
      success: true,
      isSaved
    });
  } catch (error) {
    console.error('Error al verificar guardado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar guardado'
    });
  }
};

// Obtener estadísticas de guardados
exports.getSavedStats = async (req, res) => {
  try {
    const organizationId = req.user._id;

    const organization = await User.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    const totalSaved = organization.savedCandidates.length;
    
    // Contar por tags
    const tagCounts = {};
    organization.savedCandidates.forEach(saved => {
      saved.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Guardados recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlySaved = organization.savedCandidates.filter(
      saved => saved.savedAt >= sevenDaysAgo
    ).length;

    res.json({
      success: true,
      stats: {
        total: totalSaved,
        recentlySaved,
        tagCounts
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
