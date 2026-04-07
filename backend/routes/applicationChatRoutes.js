const express = require('express');
const router = express.Router();
const applicationChatController = require('../controller/applicationChatController');
const { protect } = require('../middleware/auth');

// Obtener o crear chat para una postulación específica
router.get(
  '/:applicationId/chat',
  protect,
  applicationChatController.getOrCreateApplicationChat
);

// Obtener todos mis chats de postulaciones
router.get(
  '/my-chats',
  protect,
  applicationChatController.getMyApplicationChats
);

module.exports = router;
