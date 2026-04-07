const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controller/notificationController');

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener notificaciones del usuario
router.get('/', getMyNotifications);

// Contar notificaciones no leídas
router.get('/unread-count', getUnreadCount);

// Marcar todas como leídas
router.put('/mark-all-read', markAllAsRead);

// Eliminar todas las leídas
router.delete('/read', deleteAllRead);

// Marcar notificación específica como leída
router.put('/:id/read', markAsRead);

// Eliminar notificación específica
router.delete('/:id', deleteNotification);

module.exports = router;
