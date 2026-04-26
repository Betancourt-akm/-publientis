/**
 * Rutas de Amigos
 */

const express = require('express');
const router = express.Router();
const Friendship = require('../models/friendshipModel');
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('../controller/notificationController');

// Buscar usuarios para agregar (SOLO de otras facultades)
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;
    const userFaculty = req.user.faculty;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Buscar usuarios de OTRAS facultades (no de la misma)
    const searchCriteria = {
      _id: { $ne: userId },
      isVerified: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };
    
    // Excluir usuarios de la misma facultad
    if (userFaculty) {
      searchCriteria.faculty = { $ne: userFaculty };
    }
    
    const users = await User.find(searchCriteria)
    .select('name email profilePic role faculty')
    .limit(20)
    .lean();

    // Para cada usuario, verificar estado de amistad
    const usersWithStatus = await Promise.all(users.map(async (user) => {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: userId, recipient: user._id },
          { requester: user._id, recipient: userId }
        ]
      });

      let friendshipStatus = 'none';
      let friendshipId = null;
      
      if (friendship) {
        friendshipStatus = friendship.status;
        friendshipId = friendship._id;
      }

      return {
        ...user,
        friendshipStatus,
        friendshipId
      };
    }));

    res.json({ success: true, data: usersWithStatus });
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios',
      error: error.message
    });
  }
});

// Enviar solicitud de amistad (SOLO para usuarios de otras facultades)
router.post('/request/:userId', protect, async (req, res) => {
  try {
    const requesterId = req.user._id;
    const recipientId = req.params.userId;
    const { message } = req.body;
    const userFaculty = req.user.faculty;

    if (requesterId.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte solicitud a ti mismo'
      });
    }

    // Verificar que el usuario existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si ya existe una relación
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Ya son amigos' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Ya existe una solicitud pendiente' });
      }
      // Si fue rechazada, permitir re-enviar actualizando el registro
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.requester = requesterId;
        existing.recipient = recipientId;
        existing.message = message;
        existing.rejectedAt = undefined;
        await existing.save();

        // Notificar al destinatario
        const requester = await User.findById(requesterId).select('name');
        await createNotification(
          recipientId, 'friend_request',
          'Nueva solicitud de amistad',
          `${requester.name} te envió una solicitud de amistad`,
          { entityType: 'Friendship', entityId: existing._id },
          '/amigos'
        ).catch(() => {});
        const io = req.app.get('io');
        if (io) io.to(`user:${recipientId}`).emit('friend:request', { from: requester });

        return res.json({ success: true, message: 'Solicitud de amistad enviada', data: existing });
      }
    }

    // Crear nueva solicitud
    const friendship = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
      message
    });

    // Notificar al destinatario
    const requester = await User.findById(requesterId).select('name');
    await createNotification(
      recipientId, 'friend_request',
      'Nueva solicitud de amistad',
      `${requester.name} te envió una solicitud de amistad`,
      { entityType: 'Friendship', entityId: friendship._id },
      '/amigos'
    ).catch(() => {});
    const io = req.app.get('io');
    if (io) io.to(`user:${recipientId}`).emit('friend:request', { from: requester });

    res.json({
      success: true,
      message: 'Solicitud de amistad enviada',
      data: friendship
    });
  } catch (error) {
    console.error('Error enviando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar solicitud',
      error: error.message
    });
  }
});

// Obtener solicitudes pendientes recibidas
router.get('/requests/pending', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'name email profilePic role')
    .sort({ createdAt: -1 })
    .lean();

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: error.message
    });
  }
});

// Aceptar solicitud de amistad
router.put('/requests/:friendshipId/accept', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendshipId = req.params.friendshipId;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    friendship.status = 'accepted';
    friendship.acceptedAt = new Date();
    await friendship.save();

    await friendship.populate('requester', 'name email profilePic role');

    // Notificar al que envió la solicitud
    const acceptor = await User.findById(userId).select('name');
    await createNotification(
      friendship.requester._id, 'friend_request_accepted',
      '¡Solicitud aceptada!',
      `${acceptor.name} aceptó tu solicitud de amistad`,
      { entityType: 'Friendship', entityId: friendship._id },
      '/amigos'
    ).catch(() => {});
    const io = req.app.get('io');
    if (io) io.to(`user:${friendship.requester._id}`).emit('friend:accepted', { by: acceptor });

    res.json({
      success: true,
      message: 'Solicitud aceptada',
      data: friendship
    });
  } catch (error) {
    console.error('Error aceptando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aceptar solicitud',
      error: error.message
    });
  }
});

// Rechazar solicitud de amistad
router.put('/requests/:friendshipId/reject', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendshipId = req.params.friendshipId;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    friendship.status = 'rejected';
    friendship.rejectedAt = new Date();
    await friendship.save();

    res.json({
      success: true,
      message: 'Solicitud rechazada'
    });
  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud',
      error: error.message
    });
  }
});

// Obtener lista de amigos (incluyendo compañeros de facultad)
router.get('/list', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userFaculty = req.user.faculty;
    
    // Obtener amigos confirmados (de otras facultades)
    const confirmedFriends = await Friendship.getFriends(userId.toString());
    
    // Si el usuario tiene facultad, obtener compañeros de la misma facultad
    let facultyMates = [];
    if (userFaculty) {
      facultyMates = await User.find({
        _id: { $ne: userId },
        faculty: userFaculty,
        isVerified: true
      })
      .select('name email profilePic role faculty')
      .lean();
      
      // Marcar como compañeros de facultad
      facultyMates = facultyMates.map(mate => ({
        ...mate,
        isFacultyMate: true,
        friendsSince: null
      }));
    }
    
    // Combinar amigos confirmados y compañeros de facultad
    const allFriends = [...confirmedFriends, ...facultyMates];
    
    // Eliminar duplicados (por si acaso)
    const uniqueFriends = allFriends.filter((friend, index, self) => 
      index === self.findIndex(f => f._id.toString() === friend._id.toString())
    );

    res.json({ success: true, data: uniqueFriends });
  } catch (error) {
    console.error('Error obteniendo amigos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener amigos',
      error: error.message
    });
  }
});

// Personas que quizás conozcas
router.get('/suggestions', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // IDs ya relacionados (amigos + pendientes)
    const existingRelations = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }]
    }).select('requester recipient').lean();

    const excludeIds = new Set([userId.toString()]);
    existingRelations.forEach(r => {
      excludeIds.add(r.requester.toString());
      excludeIds.add(r.recipient.toString());
    });

    // Prioridad 1: mismo programa/facultad
    let suggestions = [];
    if (req.user.faculty || req.user.program) {
      const sameFacultyQuery = { _id: { $nin: Array.from(excludeIds) } };
      if (req.user.faculty) sameFacultyQuery.faculty = req.user.faculty;
      suggestions = await User.find(sameFacultyQuery)
        .select('name profilePic role faculty program')
        .limit(12)
        .lean();
    }

    // Prioridad 2: completar con usuarios aleatorios si hacen falta
    if (suggestions.length < 12) {
      const extra = await User.find({
        _id: { $nin: [...Array.from(excludeIds), ...suggestions.map(s => s._id)] }
      })
        .select('name profilePic role faculty program')
        .limit(12 - suggestions.length)
        .lean();
      suggestions = [...suggestions, ...extra];
    }

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({ success: false, message: 'Error al obtener sugerencias' });
  }
});

// Eliminar amistad
router.delete('/:friendshipId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendshipId = req.params.friendshipId;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Amistad no encontrada'
      });
    }

    await friendship.deleteOne();

    res.json({
      success: true,
      message: 'Amistad eliminada'
    });
  } catch (error) {
    console.error('Error eliminando amistad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar amistad',
      error: error.message
    });
  }
});

module.exports = router;
