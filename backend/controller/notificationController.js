const Notification = require('../models/notificationModel');

// Obtener notificaciones del usuario actual
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countUnread(req.user._id);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
};

// Contar notificaciones no leídas
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countUnread(req.user._id);
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al contar notificaciones'
    });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      notification
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída'
    });
  }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones'
    });
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación'
    });
  }
};

// Eliminar todas las notificaciones leídas
exports.deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id,
      read: true
    });

    res.json({
      success: true,
      message: 'Notificaciones leídas eliminadas',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error al eliminar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificaciones'
    });
  }
};

// Helper: Crear notificación (usado por otros controllers)
exports.createNotification = async (recipientId, type, title, message, relatedEntity = null, actionUrl = null) => {
  try {
    const notificationData = {
      recipient: recipientId,
      type,
      title,
      message,
      actionUrl
    };

    if (relatedEntity) {
      notificationData.relatedEntity = relatedEntity;
    }

    const notification = await Notification.createNotification(notificationData);
    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return null;
  }
};
