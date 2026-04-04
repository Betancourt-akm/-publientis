/**
 * Rutas de Chat - Conversaciones peer-to-peer
 */

const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

// Obtener todas las conversaciones del usuario actual
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Chat.find({
      type: 'direct',
      participants: userId,
      status: { $in: ['active', 'waiting'] }
    })
    .populate('participants', 'name email profilePic role')
    .sort({ updatedAt: -1 })
    .lean();

    // Formatear para el frontend
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId.toString());
      return {
        _id: conv._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          profilePic: otherUser.profilePic,
          role: otherUser.role
        },
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount.user || 0,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener conversaciones',
      error: error.message
    });
  }
});

// Obtener o crear conversación con otro usuario
router.post('/conversations/with/:otherUserId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.otherUserId;

    if (userId.toString() === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes crear una conversación contigo mismo'
      });
    }

    // Buscar conversación existente
    let conversation = await Chat.findOne({
      type: 'direct',
      participants: { $all: [userId, otherUserId] }
    }).populate('participants', 'name email profilePic role');

    // Si no existe, crear nueva
    if (!conversation) {
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      conversation = await Chat.create({
        type: 'direct',
        participants: [userId, otherUserId],
        participantsInfo: [
          {
            userId: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.profilePic,
            role: req.user.role
          },
          {
            userId: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            avatar: otherUser.profilePic,
            role: otherUser.role
          }
        ],
        status: 'active',
        unreadCount: { user: 0, admin: 0 }
      });

      conversation = await conversation.populate('participants', 'name email profilePic role');
    }

    // Obtener mensajes
    const messages = await Message.find({ chatId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    const otherUser = conversation.participants.find(p => p._id.toString() !== userId.toString());

    res.json({
      success: true,
      data: {
        conversation: {
          _id: conversation._id,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            profilePic: otherUser.profilePic,
            role: otherUser.role
          },
          lastMessage: conversation.lastMessage,
          unreadCount: conversation.unreadCount.user || 0,
          updatedAt: conversation.updatedAt
        },
        messages
      }
    });
  } catch (error) {
    console.error('Error obteniendo/creando conversación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener conversación',
      error: error.message
    });
  }
});

// Obtener mensajes de una conversación
router.get('/conversations/:conversationId/messages', protect, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user._id;

    // Verificar que el usuario sea parte de la conversación
    const conversation = await Chat.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    const messages = await Message.find({ chatId: conversationId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message
    });
  }
});

// Obtener lista de usuarios para chatear (contactos sugeridos)
router.get('/users', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Obtener usuarios excluyendo al actual
    const users = await User.find({
      _id: { $ne: userId },
      isVerified: true
    })
    .select('name email profilePic role')
    .limit(20)
    .lean();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

module.exports = router;
