const Publication = require('../models/Publication');
const userModel = require('../../../models/userModel');

/**
 * Crear nueva publicación (cualquier usuario autenticado)
 */
const createPublication = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const publicationData = {
      ...req.body,
      authorId: userId,
      status: 'APPROVED' // Aparece inmediatamente en el feed
    };

    const publication = new Publication(publicationData);
    await publication.save();
    await publication.populate('authorId', 'name email profilePic');

    res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente y visible en el feed.',
      data: publication
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la publicación',
      error: error.message
    });
  }
};

/**
 * Obtener feed de publicaciones (solo APPROVED, público)
 */
const getPublicationFeed = async (req, res) => {
  try {
    const { type, faculty, tags, page = 1, limit = 10 } = req.query;
    
    const query = { status: 'APPROVED' };

    if (type) query.type = type;
    if (faculty) query.facultyId = faculty;
    if (tags) query.tags = { $in: tags.split(',') };

    const skip = (page - 1) * limit;

    const publications = await Publication.find(query)
      .populate('authorId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Publication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: publications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el feed de publicaciones',
      error: error.message
    });
  }
};

/**
 * Obtener publicaciones pendientes (FACULTY role)
 */
const getPendingPublications = async (req, res) => {
  try {
    const user = req.user;

    // Verificar que sea FACULTY o ADMIN
    if (user.role !== 'FACULTY' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de facultad'
      });
    }

    const { faculty, page = 1, limit = 20 } = req.query;
    
    const query = { status: 'PENDING' };
    
    // Si se especifica facultad, filtrar por ella
    if (faculty) {
      query.facultyId = faculty;
    }

    const skip = (page - 1) * limit;

    const publications = await Publication.find(query)
      .populate('authorId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Publication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: publications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener publicaciones pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las publicaciones pendientes',
      error: error.message
    });
  }
};

/**
 * Aprobar publicación (FACULTY role)
 */
const approvePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const user = req.user;

    if (user.role !== 'FACULTY' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de facultad'
      });
    }

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    publication.status = 'APPROVED';
    publication.approvedBy = userId;
    publication.approvedAt = new Date();
    publication.rejectionReason = '';

    await publication.save();
    await publication.populate('authorId', 'name email profilePic');

    res.status(200).json({
      success: true,
      message: 'Publicación aprobada exitosamente',
      data: publication
    });
  } catch (error) {
    console.error('Error al aprobar publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar la publicación',
      error: error.message
    });
  }
};

/**
 * Rechazar publicación (FACULTY role, requiere razón)
 */
const rejectPublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (user.role !== 'FACULTY' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de facultad'
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una razón para el rechazo'
      });
    }

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    publication.status = 'REJECTED';
    publication.rejectionReason = reason;

    await publication.save();
    await publication.populate('authorId', 'name email profilePic');

    res.status(200).json({
      success: true,
      message: 'Publicación rechazada',
      data: publication
    });
  } catch (error) {
    console.error('Error al rechazar publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar la publicación',
      error: error.message
    });
  }
};

/**
 * Obtener mis publicaciones (del usuario autenticado)
 */
const getMyPublications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { authorId: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const publications = await Publication.find(query)
      .populate('authorId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Publication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: publications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener mis publicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las publicaciones',
      error: error.message
    });
  }
};

/**
 * Obtener publicación por ID
 */
const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await Publication.findById(id)
      .populate('authorId', 'name email profilePic')
      .populate('approvedBy', 'name email');

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Incrementar contador de vistas
    publication.viewsCount += 1;
    await publication.save();

    res.status(200).json({
      success: true,
      data: publication
    });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la publicación',
      error: error.message
    });
  }
};

/**
 * Actualizar publicación (solo el autor o ADMIN)
 */
const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    // Verificar permisos
    const isAuthor = publication.authorId.toString() === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta publicación'
      });
    }

    // No permitir cambiar status desde aquí
    const { status, approvedBy, approvedAt, ...updateData } = req.body;

    Object.assign(publication, updateData);

    // Si se edita una publicación aprobada, volver a PENDING
    if (publication.status === 'APPROVED' && isAuthor && !isAdmin) {
      publication.status = 'PENDING';
      publication.approvedBy = undefined;
      publication.approvedAt = undefined;
    }

    await publication.save();
    await publication.populate('authorId', 'name email profilePic');

    res.status(200).json({
      success: true,
      message: 'Publicación actualizada exitosamente',
      data: publication
    });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la publicación',
      error: error.message
    });
  }
};

/**
 * Eliminar publicación (solo el autor o ADMIN)
 */
const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    const isAuthor = publication.authorId.toString() === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta publicación'
      });
    }

    await Publication.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Publicación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la publicación',
      error: error.message
    });
  }
};

/**
 * Toggle like en publicación
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    const likeIndex = publication.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Ya le dio like, quitar like
      publication.likes.splice(likeIndex, 1);
    } else {
      // No le ha dado like, agregar like
      publication.likes.push(userId);
    }

    await publication.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Like removido' : 'Like agregado',
      data: {
        likesCount: publication.likes.length,
        hasLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el like',
      error: error.message
    });
  }
};

module.exports = {
  createPublication,
  getPublicationFeed,
  getPendingPublications,
  approvePublication,
  rejectPublication,
  getMyPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
  toggleLike
};
